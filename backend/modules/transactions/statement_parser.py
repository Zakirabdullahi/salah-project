import re
import pdfplumber
import pandas as pd
from pdfminer.pdfdocument import PDFPasswordIncorrect
from modules.analytics.ai_service import parse_financial_text, get_gemini_api_key

def clean_amount(val):
    if val is None:
        return 0.0
    val_str = str(val).replace(',', '').strip()
    val_str = re.sub(r'[^\d\.\-]', '', val_str)
    try:
        return float(val_str)
    except (ValueError, TypeError):
        return 0.0

def clean_date(val):
    if not val:
        return "TODAY"
    val_str = str(val).strip()
    m = re.search(r'(\d{4})[-/](\d{2})[-/](\d{2})', val_str)
    if m:
        return f"{m.group(1)}-{m.group(2)}-{m.group(3)}"
    m2 = re.search(r'(\d{2})[-/](\d{2})[-/](\d{4})', val_str)
    if m2:
        return f"{m2.group(3)}-{m2.group(2)}-{m2.group(1)}"
    return "TODAY"

def classify_mpesa_transaction(details, tx_type):
    if tx_type == 'INCOME':
        return 'Income / Allowance'
    
    d = str(details).lower()
    
    # 1. Academic & Tuition
    if any(k in d for k in ['tuition', 'school', 'university', 'college', 'exam', 'kuccps', 'helb', 'campus']):
        return 'Academic / Tuition'
    if 'fee' in d and any(k in d for k in ['academic', 'exam', 'tuition', 'semester', 'term']):
        return 'Academic / Tuition'
        
    # 2. M-Pesa / Bank Charges
    if any(k in d for k in ['charge', 'tariff', 'excise duty', 'withdrawal fee', 'm-pesa fee']):
        return 'M-Pesa & Bank Charges'
        
    # 3. Wifi & Data
    if any(k in d for k in ['airtime', 'bundle', 'data', 'safaricom', 'wifi', 'internet', 'faiba', 'zuku', 'telkom', 'airtel']):
        return 'Wifi & Data Bundles'
        
    # 4. Rent & Utilities
    if any(k in d for k in ['kplc', 'token', 'water', 'rent', 'power', 'stima', 'nairobi water', 'hostel', 'electricity']):
        return 'Rent & Utilities'
        
    # 5. Food & Dining
    if any(k in d for k in ['cafe', 'restaurant', 'hotel', 'fast food', 'kitchen', 'food', 'bakery', 'java', 'kfc', 'pizza', 'grill', 'bites', 'dining', 'meat', 'butchery', 'snack', 'pork', 'chicken']):
        return 'Food & Dining'
        
    # 6. Shopping & Supermarkets
    if any(k in d for k in ['supermarket', 'quickmart', 'naivas', 'carrefour', 'chandarana', 'mart', 'store', 'cloth', 'boutique', 'shoes', 'wear']):
        return 'Shopping & Clothing'
        
    # 7. Transport
    if any(k in d for k in ['uber', 'bolt', 'little', 'matatu', 'fare', 'petrol', 'fuel', 'shell', 'total', 'rubis', 'bus', 'stage', 'shuttle']):
        return 'Transport'
        
    # 8. Health & Personal care
    if any(k in d for k in ['chemist', 'pharmacy', 'hospital', 'clinic', 'salon', 'barber', 'spa', 'beauty', 'dental', 'med']):
        return 'Personal Care & Health'
        
    # 9. Entertainment
    if any(k in d for k in ['cinema', 'movie', 'netflix', 'spotify', 'playstation', 'gaming', 'bar', 'lounge', 'club', 'event', 'ticket']):
        return 'Entertainment'
        
    # 10. Savings
    if any(k in d for k in ['m-shwari', 'kcb mpesa', 'lock savings', 'savings', 'chama', 'deposit']):
        return 'Savings Deposit'
        
    if 'fee' in d or 'charge' in d:
        return 'M-Pesa & Bank Charges'
        
    if 'buy goods' in d or 'pay bill' in d:
        return 'Shopping & Clothing'
        
    return 'Others'

def parse_tables_data(tables):
    transactions = []
    for table in tables:
        if not table or len(table) < 2:
            continue
        header_idx = -1
        cols = {}
        for i, row in enumerate(table):
            row_str = " ".join([str(c or "").lower() for c in row])
            if ('receipt' in row_str or 'trans' in row_str) and ('paid in' in row_str or 'withdrawn' in row_str or 'details' in row_str or 'credit' in row_str or 'debit' in row_str):
                header_idx = i
                for col_idx, cell in enumerate(row):
                    c = str(cell or "").lower().strip()
                    if 'receipt' in c or 'ref' in c: cols['receipt'] = col_idx
                    elif 'time' in c or 'date' in c: cols['date'] = col_idx
                    elif 'detail' in c or 'desc' in c: cols['details'] = col_idx
                    elif 'status' in c: cols['status'] = col_idx
                    elif 'paid in' in c or 'credit' in c: cols['paid_in'] = col_idx
                    elif 'withdrawn' in c or 'debit' in c: cols['withdrawn'] = col_idx
                    elif 'balance' in c: cols['balance'] = col_idx
                break
                
        if header_idx != -1:
            for row in table[header_idx + 1:]:
                if not row or len(row) < 3:
                    continue
                details = str(row[cols.get('details', 2)] or "").strip()
                if not details or 'total' in details.lower() or 'summary' in details.lower():
                    continue
                    
                raw_paid = row[cols.get('paid_in', 4)] if 'paid_in' in cols and cols['paid_in'] < len(row) else 0
                raw_withdrawn = row[cols.get('withdrawn', 5)] if 'withdrawn' in cols and cols['withdrawn'] < len(row) else 0
                paid_in = clean_amount(raw_paid)
                withdrawn = abs(clean_amount(raw_withdrawn))
                
                raw_date = row[cols.get('date', 1)] if 'date' in cols and cols['date'] < len(row) else "TODAY"
                date_str = clean_date(raw_date)
                
                if paid_in > 0:
                    cat = classify_mpesa_transaction(details, 'INCOME')
                    transactions.append({
                        "type": "INCOME",
                        "amount": paid_in,
                        "category": cat,
                        "description": details,
                        "date": date_str
                    })
                elif withdrawn > 0:
                    cat = classify_mpesa_transaction(details, 'EXPENSE')
                    transactions.append({
                        "type": "EXPENSE",
                        "amount": withdrawn,
                        "category": cat,
                        "description": details,
                        "date": date_str
                    })
    return transactions

def parse_text_lines_data(raw_text):
    transactions = []
    line_pattern = r'^([A-Z0-9]{8,12})\s+(\d{4}[-/]\d{2}[-/]\d{2}|\d{2}[-/]\d{2}[-/]\d{4})\s+(\d{2}:\d{2}(?::\d{2})?)\s+(.*?)(?:\s+(?:Completed|COMPLETED|Failed|FAILED))?\s+((?:[+\-]?[\d,]+\.\d{2}|-)(?:\s+(?:[+\-]?[\d,]+\.\d{2}|-))+)$'

    for line in raw_text.splitlines():
        line = line.strip()
        if not line:
            continue
            
        m = re.match(line_pattern, line)
        if m:
            receipt, raw_date, raw_time, details, nums_str = m.groups()
            nums = re.findall(r'[+\-]?[\d,]+\.\d{2}', nums_str)
            if not nums:
                continue
            date_str = clean_date(raw_date)
            num_vals = [float(n.replace(',', '')) for n in nums]
            
            tx_type = 'EXPENSE'
            amount = 0.0
            
            if len(num_vals) >= 3:
                paid_in = num_vals[0]
                withdrawn = num_vals[1]
                if paid_in > 0:
                    tx_type = 'INCOME'
                    amount = paid_in
                else:
                    tx_type = 'EXPENSE'
                    amount = abs(withdrawn)
            elif len(num_vals) == 2:
                amt = num_vals[0]
                if amt < 0:
                    tx_type = 'EXPENSE'
                    amount = abs(amt)
                elif 'received' in details.lower() or 'deposit' in details.lower():
                    tx_type = 'INCOME'
                    amount = amt
                else:
                    tx_type = 'EXPENSE'
                    amount = amt
            elif len(num_vals) == 1:
                amount = abs(num_vals[0])
                if 'received' in details.lower() or 'deposit' in details.lower():
                    tx_type = 'INCOME'
                else:
                    tx_type = 'EXPENSE'
                    
            if amount > 0:
                cat = classify_mpesa_transaction(details, tx_type)
                transactions.append({
                    "type": tx_type,
                    "amount": amount,
                    "category": cat,
                    "description": details or f"M-Pesa {receipt}",
                    "date": date_str
                })
        else:
            # Loose line fallback for SMS style or unstructured lines:
            amt_match = re.search(r'(?:Ksh|KES)\.?\s*([\d,]+(?:\.\d{2})?)', line, re.IGNORECASE)
            if amt_match:
                amt = clean_amount(amt_match.group(1))
                if amt > 0:
                    is_income = any(w in line.lower() for w in ['received', 'credited', 'deposit', 'give you', 'salary'])
                    tx_type = 'INCOME' if is_income else 'EXPENSE'
                    cat = classify_mpesa_transaction(line, tx_type)
                    date_match = re.search(r'\b(\d{4}[-/]\d{2}[-/]\d{2}|\d{2}[-/]\d{2}[-/]\d{4})\b', line)
                    date_str = clean_date(date_match.group(1)) if date_match else "TODAY"
                    transactions.append({
                        "type": tx_type,
                        "amount": amt,
                        "category": cat,
                        "description": line[:80],
                        "date": date_str
                    })
                    
    return transactions

def parse_statement_file(file_obj, filename, password=None):
    filename = filename.lower()
    if filename.endswith('.pdf'):
        clean_pwd = str(password).strip() if password and str(password).strip() else None
        try:
            with pdfplumber.open(file_obj, password=clean_pwd) as pdf:
                all_tables = []
                all_text = ""
                for page in pdf.pages:
                    tables = page.extract_tables()
                    if tables:
                        all_tables.extend(tables)
                    all_text += (page.extract_text() or "") + "\n"
        except PDFPasswordIncorrect:
            return None, "Incorrect PDF password. Safaricom M-Pesa statements are encrypted with your National ID number or Passport number."
        except Exception as e:
            err_str = str(e).lower()
            if "password" in err_str or "encrypted" in err_str:
                return None, "This PDF is password-protected. Please enter your National ID number in the password field."
            return None, f"Could not read PDF: {str(e)}"
            
        # 1. Try structured table parser
        transactions = parse_tables_data(all_tables)
        if transactions:
            return transactions, None
            
        # 2. Try text regex line parser
        transactions = parse_text_lines_data(all_text)
        if transactions:
            return transactions, None
            
        # 3. Try Gemini AI if key is present
        if get_gemini_api_key() and all_text.strip():
            ai_data = parse_financial_text(all_text[:10000])
            if ai_data:
                return ai_data, None
                
        return [], None
        
    elif filename.endswith(('.csv', '.xlsx', '.xls')):
        try:
            df = pd.read_csv(file_obj) if filename.endswith('.csv') else pd.read_excel(file_obj)
            cols = {c.lower().strip(): c for c in df.columns}
            transactions = []
            
            det_col = next((cols[c] for c in cols if 'detail' in c or 'desc' in c or 'particular' in c), None)
            date_col = next((cols[c] for c in cols if 'date' in c or 'time' in c), None)
            paid_col = next((cols[c] for c in cols if 'paid' in c or 'credit' in c or 'in' in c), None)
            with_col = next((cols[c] for c in cols if 'withdrawn' in c or 'debit' in c or 'out' in c), None)
            amt_col = next((cols[c] for c in cols if 'amount' in c or 'total' in c), None)
            type_col = next((cols[c] for c in cols if 'type' in c), None)
            
            for _, row in df.iterrows():
                details = str(row[det_col] or "").strip() if det_col else "Transaction"
                date_str = clean_date(row[date_col]) if date_col else "TODAY"
                
                paid_in = clean_amount(row[paid_col]) if paid_col else 0
                withdrawn = abs(clean_amount(row[with_col])) if with_col else 0
                
                if paid_in > 0:
                    cat = classify_mpesa_transaction(details, 'INCOME')
                    transactions.append({"type": "INCOME", "amount": paid_in, "category": cat, "description": details, "date": date_str})
                elif withdrawn > 0:
                    cat = classify_mpesa_transaction(details, 'EXPENSE')
                    transactions.append({"type": "EXPENSE", "amount": withdrawn, "category": cat, "description": details, "date": date_str})
                elif amt_col:
                    raw_amt = clean_amount(row[amt_col])
                    t_type = str(row[type_col]).upper() if type_col else ('EXPENSE' if raw_amt < 0 else 'INCOME')
                    amt = abs(raw_amt)
                    if amt > 0:
                        cat = classify_mpesa_transaction(details, t_type)
                        transactions.append({"type": t_type, "amount": amt, "category": cat, "description": details, "date": date_str})
                        
            if transactions:
                return transactions, None
                
            raw_text = df.to_string()
            return parse_text_lines_data(raw_text), None
        except Exception as e:
            return None, f"Failed to parse spreadsheet: {str(e)}"
    else:
        return None, "Unsupported file format. Please upload a PDF, CSV, or Excel file."
