from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated
from modules.transactions.models import Transaction
from modules.savings.models import SavingGoal
from django.db.models import Sum
from django.utils import timezone
from decimal import Decimal
import calendar
from .ai_service import generate_financial_advice, get_financial_score_breakdown, forecast_expenses
from modules.budgets.models import Budget
from datetime import timedelta

def get_past_months(n):
    today = timezone.localdate()
    months = []
    for i in range(n):
        month = today.month - i
        year = today.year
        while month <= 0:
            month += 12
            year -= 1
        months.insert(0, (year, month))
    return months

class DashboardKPIsView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        now = timezone.localdate()
        income = Transaction.objects.filter(user=request.user, type='INCOME').aggregate(Sum('amount'))['amount__sum'] or Decimal('0')
        expenses = Transaction.objects.filter(user=request.user, type='EXPENSE').aggregate(Sum('amount'))['amount__sum'] or Decimal('0')
        balance = income - expenses
        
        this_month_income = Transaction.objects.filter(user=request.user, type='INCOME', date__year=now.year, date__month=now.month).aggregate(Sum('amount'))['amount__sum'] or Decimal('0')
        this_month_expense = Transaction.objects.filter(user=request.user, type='EXPENSE', date__year=now.year, date__month=now.month).aggregate(Sum('amount'))['amount__sum'] or Decimal('0')
        total_savings = SavingGoal.objects.filter(user=request.user).aggregate(Sum('current_amount'))['current_amount__sum'] or Decimal('0')

        # Yearly Total & Trend
        total_year_expense = Transaction.objects.filter(user=request.user, type='EXPENSE', date__year=now.year).aggregate(Sum('amount'))['amount__sum'] or Decimal('0')
        
        last_month = now.replace(day=1) - timedelta(days=1)
        last_month_expense = Transaction.objects.filter(
            user=request.user, type='EXPENSE', 
            date__year=last_month.year, date__month=last_month.month
        ).aggregate(Sum('amount'))['amount__sum'] or Decimal('0')

        expense_trend = 0
        if last_month_expense > 0:
            expense_trend = ((this_month_expense - last_month_expense) / last_month_expense) * 100

        return Response({
            'balance': balance,
            'monthly_income': this_month_income,
            'monthly_expense': this_month_expense,
            'total_savings': total_savings,
            'total_year_expense': total_year_expense,
            'expense_trend': round(float(expense_trend), 1)
        })

class SixMonthTrendsView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        months_list = get_past_months(6)
        trends = []
        cumulative_burn = Decimal('0')
        for y, m in months_list:
            q_in = Transaction.objects.filter(user=request.user, type='INCOME', date__year=y, date__month=m).aggregate(Sum('amount'))['amount__sum'] or Decimal('0')
            q_out = Transaction.objects.filter(user=request.user, type='EXPENSE', date__year=y, date__month=m).aggregate(Sum('amount'))['amount__sum'] or Decimal('0')
            cumulative_burn += q_out
            trends.append({
                'month': calendar.month_abbr[m],
                'income': q_in,
                'expense': q_out,
                'net': q_in - q_out,
                'total_burn': cumulative_burn
            })
        return Response(trends)

class CategoryHorizontalView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        expenses = Transaction.objects.filter(
            user=request.user, type='EXPENSE'
        ).values('category').annotate(total=Sum('amount')).order_by('-total')[:5]
        
        data = [{'category': item['category'], 'total': item['total']} for item in expenses]
        return Response(data)

class SavingsProgressView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        goals = SavingGoal.objects.filter(user=request.user).order_by('-target_amount')[:5]
        data = [{'name': g.name, 'current': g.current_amount, 'target': g.target_amount} for g in goals]
        return Response(data)

class AIAdvisorView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        user = request.user
        transactions = Transaction.objects.filter(user=user).order_by('-date')[:20]
        trans_list = [{"type": t.type, "category": t.category, "amount": float(t.amount), "date": str(t.date)} for t in transactions]
        
        
        income = Transaction.objects.filter(user=user, type='INCOME').aggregate(Sum('amount'))['amount__sum'] or Decimal('0')
        expenses = Transaction.objects.filter(user=user, type='EXPENSE').aggregate(Sum('amount'))['amount__sum'] or Decimal('0')
        
        user_data = {
            "name": user.first_name or user.email.split('@')[0],
            "university": user.university or "Unknown University",
            "course": user.course or "General Studies",
            "year": user.year_of_study or "N/A",
            "total_income": float(income),
            "total_expenses": float(expenses),
            "balance": float(income - expenses)
        }
        
        
        category_breakdown = Transaction.objects.filter(
            user=user, 
            type='EXPENSE',
            date__year=timezone.localdate().year,
            date__month=timezone.localdate().month
        ).values('category').annotate(total=Sum('amount')).order_by('-total')
        
        breakdown_data = {item['category']: float(item['total']) for item in category_breakdown}
        
        advice = generate_financial_advice(user_data, trans_list)
        
        return Response({
            "advice": advice,
            "breakdown": breakdown_data,
            "total_expenses": float(expenses)
        })

class PredictiveAnalyticsView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        now = timezone.localdate()
        last_30_days = now - timedelta(days=30)
        
        recent_expenses = Transaction.objects.filter(
            user=request.user, 
            type='EXPENSE', 
            date__gte=last_30_days
        ).aggregate(Sum('amount'))['amount__sum'] or Decimal('0')
        
        daily_avg = recent_expenses / Decimal('30')
        prediction_30d = forecast_expenses(float(daily_avg), 30)
        
        income = Transaction.objects.filter(user=request.user, type='INCOME').aggregate(Sum('amount'))['amount__sum'] or Decimal('0')
        expenses = Transaction.objects.filter(user=request.user, type='EXPENSE').aggregate(Sum('amount'))['amount__sum'] or Decimal('0')
        current_balance = income - expenses
        
        days_until_zero = float(current_balance / daily_avg) if daily_avg > 0 else 999
        
        return Response({
            "predicted_next_30d": prediction_30d,
            "daily_average": float(daily_avg),
            "days_until_zero": round(days_until_zero, 0),
            "prediction_date": (now + timedelta(days=int(min(days_until_zero, 365)))).strftime("%B %d, %Y")
        })

class FinancialHealthScoreView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        user = request.user
        income = Transaction.objects.filter(user=user, type='INCOME').aggregate(Sum('amount'))['amount__sum'] or Decimal('0') 
        expenses = Transaction.objects.filter(user=user, type='EXPENSE').aggregate(Sum('amount'))['amount__sum'] or Decimal('0')
        wealth_ratio = (income - expenses) / income if income > 0 else 0
        
        total_target = SavingGoal.objects.filter(user=user).aggregate(Sum('target_amount'))['target_amount__sum'] or Decimal('0')
        total_current = SavingGoal.objects.filter(user=user).aggregate(Sum('current_amount'))['current_amount__sum'] or Decimal('0')
        savings_ratio = total_current / total_target if total_target > 0 else 0
        
        budgets = Budget.objects.filter(user=user)
        total_budget = budgets.aggregate(Sum('limit'))['limit__sum'] or Decimal('0')
        over_budget_total = Decimal('0')
        for b in budgets:
            category_spend = Transaction.objects.filter(user=user, category=b.category, type='EXPENSE').aggregate(Sum('amount'))['amount__sum'] or Decimal('0')
            if category_spend > b.limit:
                over_budget_total += (category_spend - b.limit)
        
        budget_discipline = (1 - (over_budget_total / total_budget)) if total_budget > 0 else 1.0
        
        metrics = {
            "income": float(income),
            "expenses": float(expenses),
            "total_budget": float(total_budget),
            "over_budget_total": float(over_budget_total),
            "total_target": float(total_target),
            "total_current": float(total_current),
            "wealth_ratio": float(wealth_ratio),
            "savings_ratio": float(savings_ratio),
            "budget_discipline": float(budget_discipline)
        }
        
        score = get_financial_score_breakdown(metrics)
        
        return Response({
            "score": score,
            "breakdown": metrics
        })
