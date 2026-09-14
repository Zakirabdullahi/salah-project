import os
from pathlib import Path
import google.generativeai as genai
from dotenv import load_dotenv
import json
import re

BASE_DIR = Path(__file__).resolve().parent.parent.parent

def load_env_vars():
    load_dotenv(BASE_DIR / "config" / ".env")
    load_dotenv(BASE_DIR / ".env")

load_env_vars()

def get_gemini_api_key():
    load_env_vars()
    key = os.getenv("GEMINI_API_KEY") or os.getenv("GOOGLE_API_KEY")
    if key and key.strip():
        return key.strip()
    return None

DEFAULT_MODEL = os.getenv("GEMINI_MODEL", "gemini-1.5-flash")

def generate_rule_based_advice(user_data, transactions):
    """
    Generates dynamic, high-impact advice tailored directly to the student's
    real spending, top expense categories, and surplus/deficit.
    """
    income = float(user_data.get('total_income', 0) or 0)
    expenses = float(user_data.get('total_expenses', 0) or 0)
    balance = float(user_data.get('balance', income - expenses) or 0)
    
    category_totals = {}
    for t in transactions:
        if t.get('type') == 'EXPENSE':
            cat = t.get('category', 'Others')
            category_totals[cat] = category_totals.get(cat, 0) + float(t.get('amount', 0))
            
    sorted_cats = sorted(category_totals.items(), key=lambda x: x[1], reverse=True)
    tips = []
    
    # 1. Top expense category analysis
    if sorted_cats:
        top_cat, top_amt = sorted_cats[0]
        top_pct = round((top_amt / expenses * 100), 1) if expenses > 0 else 0
        cat_lower = top_cat.lower()
        if 'food' in cat_lower or 'dining' in cat_lower:
            tips.append(f"{top_cat} is your largest expense at KSh {top_amt:,.0f} ({top_pct}%). Cooking campus meals in bulk or choosing university mess plans can save up to KSh 4,000 monthly.")
        elif 'rent' in cat_lower or 'utilit' in cat_lower:
            tips.append(f"{top_cat} accounts for {top_pct}% of spending (KSh {top_amt:,.0f}). Look into splitting utility tokens or negotiating off-campus tenancy rates.")
        elif 'transport' in cat_lower or 'car' in cat_lower:
            tips.append(f"Transport costs total KSh {top_amt:,.0f} ({top_pct}%). Leverage student commuter discounts, carpools, or cycling to reduce weekly travel expense.")
        elif 'shopping' in cat_lower or 'cloth' in cat_lower:
            tips.append(f"Shopping took KSh {top_amt:,.0f} ({top_pct}%). Practice a 48-hour pause rule before non-essential purchases to curb impulse buys.")
        elif 'wifi' in cat_lower or 'data' in cat_lower:
            tips.append(f"WiFi & Data bundles cost KSh {top_amt:,.0f}. Maximize campus eduroam/Wi-Fi to trim expensive mobile data renewals.")
        elif 'entertainment' in cat_lower:
            tips.append(f"Entertainment is your top expense at KSh {top_amt:,.0f}. Seek free university student social events to keep recreational costs low.")
        else:
            tips.append(f"Your top expense is {top_cat} at KSh {top_amt:,.0f} ({top_pct}%). Establish a strict weekly budget ceiling for this category.")

    # 2. Second expense category
    if len(sorted_cats) > 1:
        sec_cat, sec_amt = sorted_cats[1]
        sec_pct = round((sec_amt / expenses * 100), 1) if expenses > 0 else 0
        cat_lower = sec_cat.lower()
        if 'food' in cat_lower or 'dining' in cat_lower:
            tips.append(f"Food & Dining took KSh {sec_amt:,.0f} ({sec_pct}%). Packing home snacks and coffee reduces recurring cafeteria drains.")
        elif 'rent' in cat_lower or 'utilit' in cat_lower:
            tips.append(f"{sec_cat} is your second highest cost (KSh {sec_amt:,.0f}). Monitor shared utility contributions closely.")
        elif 'wifi' in cat_lower or 'data' in cat_lower:
            tips.append(f"Data & Bundles took KSh {sec_amt:,.0f}. Take advantage of university Wi-Fi to lower mobile network charges.")
        elif 'mpesa' in cat_lower or 'bank' in cat_lower or 'charge' in cat_lower:
            tips.append(f"Transaction fees amount to KSh {sec_amt:,.0f}. Consolidate transfers to cut repetitive paybill and withdrawal fees.")
        else:
            tips.append(f"Keep an eye on {sec_cat} spending (KSh {sec_amt:,.0f}) — small recurring purchases add up significantly.")

    # 3. Financial position (surplus, deficit, emergency fund)
    if income > 0 and expenses > income:
        deficit = expenses - income
        tips.append(f"Budget Alert: You are in a deficit of KSh {deficit:,.0f}. Pause non-essential purchases immediately to preserve cash reserves.")
    elif balance > 0:
        recommended_savings = round(balance * 0.2, 0)
        tips.append(f"Healthy surplus of KSh {balance:,.0f}! Transfer at least 20% (KSh {recommended_savings:,.0f}) straight into your emergency savings fund.")
    elif expenses > 0:
        tips.append("Aim to build a one-month living expense buffer to protect against unexpected academic and personal emergencies.")
    else:
        tips.append("Add your daily transactions to unlock personalized predictive spending insights.")

    fallback_pool = [
        "Apply the 50/30/20 budgeting rule (Needs, Wants, Savings) to manage your student allowance effectively.",
        "Set up an automated weekly savings transfer to reach your financial goals without stress.",
        "Review your weekly expenditures every Sunday to make quick adjustments before month-end."
    ]
    for fb in fallback_pool:
        if len(tips) >= 3:
            break
        if fb not in tips:
            tips.append(fb)

    return " | ".join(tips[:3])

def generate_financial_advice(user_data, transactions):
    """
    Generates personalized financial advice for a student in Kenya.
    Uses Gemini AI if an API key is available; otherwise falls back to tailored rule-based advice.
    """
    api_key = get_gemini_api_key()
    if api_key:
        prompt = f"""
    You are a professional Financial Advisor specialized in students and youth in Kenya.
    User Profile: {user_data.get('name')} at {user_data.get('university')}, studying {user_data.get('course')} (Year {user_data.get('year')}).
    Current Financials: Income KSh {user_data.get('total_income')}, Expenses KSh {user_data.get('total_expenses')}.
    Recent transactions: {transactions}
    
    TASK: Provide exactly 3 high-impact advice points based on their spending. 
    Be specific (e.g., if they spend on 'Food', suggest cheap campus alternatives).
    FORMAT rules:
    - Separate each point with a pipe symbol '|'.
    - DO NOT use markdown symbols like '**', '##', or '#'.
    - Use clean, professional text only.
    - Example: Tip One | Tip Two | Tip Three
    """
        try:
            genai.configure(api_key=api_key)
            models_to_try = [
                os.getenv("GEMINI_MODEL"),
                "gemini-1.5-flash",
                "gemini-2.0-flash",
                "gemini-2.5-flash",
                "gemini-1.5-pro",
            ]
            for model_name in models_to_try:
                if not model_name:
                    continue
                try:
                    model = genai.GenerativeModel(model_name)
                    response = model.generate_content(prompt)
                    if response and response.text:
                        advice = response.text.replace("*", "").replace("#", "").strip()
                        if "|" in advice:
                            return advice
                except Exception as model_err:
                    print(f"Gemini model {model_name} failed: {model_err}")
                    continue
        except Exception as e:
            print(f"AI Advice Error: {e}")
            
    return generate_rule_based_advice(user_data, transactions)

def _parse_mpesa_regex(raw_text):
    """Fallback parser for Kenyan M-Pesa SMS and bank statements."""
    results = []
    for line in raw_text.splitlines():
        line_clean = line.strip()
        if not line_clean:
            continue
        amt_match = re.search(r'(?:Ksh|KES)\.?\s*([\d,]+(?:\.\d{2})?)', line_clean, re.IGNORECASE)
        if not amt_match:
            continue
        try:
            amt = float(amt_match.group(1).replace(',', ''))
        except ValueError:
            continue

        lower = line_clean.lower()
        is_income = any(w in lower for w in ['received', 'credited', 'deposit', 'salary', 'give you'])
        tx_type = 'INCOME' if is_income else 'EXPENSE'

        cat = 'Income / Allowance' if is_income else 'Others'
        if any(w in lower for w in ['food', 'restaurant', 'cafe', 'hotel', 'dining', 'kitchen', 'snack']):
            cat = 'Food & Dining'
        elif any(w in lower for w in ['matatu', 'uber', 'bolt', 'fare', 'fuel', 'petrol', 'transport', 'bus']):
            cat = 'Transport'
        elif any(w in lower for w in ['rent', 'kplc', 'token', 'water', 'power', 'utility', 'hostel']):
            cat = 'Rent & Utilities'
        elif any(w in lower for w in ['data', 'bundle', 'wifi', 'airtime', 'safaricom', 'internet']):
            cat = 'Wifi & Data Bundles'
        elif any(w in lower for w in ['fee', 'charge', 'tariff', 'mpesa charges']):
            cat = 'M-Pesa & Bank Charges'

        results.append({
            "type": tx_type,
            "amount": amt,
            "category": cat,
            "description": line_clean[:60],
            "date": "TODAY"
        })
    return results

def parse_financial_text(raw_text):
    """
    Parses raw text (SMS, Statement snippet, etc.) into structured transaction data.
    Uses Gemini AI if configured, or falls back to regex extraction.
    """
    api_key = get_gemini_api_key()
    if api_key:
        prompt = f"""
    You are a professional financial data extractor specialized in Kenya (M-Pesa, Bank, Equitel). 
    I will provide you with raw text. 
    
    RAW TEXT:
    {raw_text}
    
    TASK: Extract all transactions found in the text.
    For each transaction, determine:
    1. Type: 'INCOME' or 'EXPENSE'
    2. Amount: Numeric value only (e.g. 500)
    3. Category: Choose EXACTLY one from this list:
       [Food & Dining, Transport, Academic / Tuition, Rent & Utilities, Wifi & Data Bundles, Personal Care & Health, Shopping & Clothing, M-Pesa & Bank Charges, Entertainment, Savings Deposit, Income / Allowance, Others]
    4. Description: A short summary (e.g. "Sent to John", "Salary", "M-Pesa Fee")
    5. Date: YYYY-MM-DD format. If no date is found, use today's date placeholder 'TODAY'.
    
    STRICT RULES:
    - If a transaction is an M-Pesa fee or bank charge, use 'M-Pesa & Bank Charges'.
    - If it's for 'Data', 'Bundles', or 'Wifi', use 'Wifi & Data Bundles'.
    - If it's for food, drinks, or restaurants, use 'Food & Dining'.
    - If it doesn't clearly fit others, use 'Others'.
    
    FORMAT: Output ONLY a valid JSON array of objects. 
    Example: [{{"type": "EXPENSE", "amount": 150, "category": "Food & Dining", "description": "Lunch", "date": "2024-03-31"}}]
    """
        try:
            genai.configure(api_key=api_key)
            models_to_try = [
                os.getenv("GEMINI_MODEL"),
                "gemini-1.5-flash",
                "gemini-2.0-flash",
                "gemini-2.5-flash",
                "gemini-1.5-pro",
            ]
            for model_name in models_to_try:
                if not model_name:
                    continue
                try:
                    model = genai.GenerativeModel(model_name)
                    response = model.generate_content(prompt)
                    content = response.text.strip()
                    if "```json" in content:
                        content = content.split("```json")[1].split("```")[0]
                    elif "```" in content:
                        content = content.split("```")[1].split("```")[0]
                    json_str = re.search(r'\[.*\]', content, re.DOTALL)
                    if json_str:
                        return json.loads(json_str.group())
                except Exception as model_err:
                    print(f"Gemini parse model {model_name} failed: {model_err}")
                    continue
        except Exception as e:
            print(f"AI Parsing Error: {e}")

    return _parse_mpesa_regex(raw_text)

from decimal import Decimal
from datetime import timedelta

def get_financial_score_breakdown(metrics):
    """
    Computes financial health score starting from 100 for a new user,
    reducing accordingly based on deficits, budget overruns, and savings neglect.
    """
    income = float(metrics.get('income', 0))
    expenses = float(metrics.get('expenses', 0))
    total_budget = float(metrics.get('total_budget', 0))
    over_budget_total = float(metrics.get('over_budget_total', 0))
    total_target = float(metrics.get('total_target', 0))
    total_current = float(metrics.get('total_current', 0))
    
    # New user with no expenses & no income starts at 100.0
    if expenses == 0 and income == 0:
        return 100.0
        
    score = 100.0
    deductions = 0.0
    
    # 1. Deficit & Burn Rate (up to 40 points deduction)
    if income > 0:
        if expenses > income:
            deficit_pct = (expenses - income) / income
            deductions += min(40.0, deficit_pct * 40.0)
        else:
            burn_rate = expenses / income
            if burn_rate > 0.70:
                deductions += min(20.0, (burn_rate - 0.70) * 60.0)
    elif expenses > 0:
        deductions += 20.0  # Spending with 0 recorded income
        
    # 2. Budget Discipline (up to 35 points deduction)
    if total_budget > 0 and over_budget_total > 0:
        over_ratio = over_budget_total / total_budget
        deductions += min(35.0, over_ratio * 35.0)
        
    # 3. Savings Goal Progress (up to 15 points deduction, only if active targets exist)
    if total_target > 0:
        savings_ratio = total_current / total_target
        if savings_ratio < 0.50:
            deductions += (0.50 - savings_ratio) * 30.0
            
    return round(max(10.0, min(100.0, score - deductions)), 1)

def forecast_expenses(daily_avg, days=30):
    return round(float(daily_avg * days), 2)
