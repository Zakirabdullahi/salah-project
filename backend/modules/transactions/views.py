from rest_framework import viewsets, status
from rest_framework.decorators import action
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated
from .models import Transaction
from .serializers import TransactionSerializer
from modules.budgets.models import Budget
from modules.notifications.utils import create_notification
from modules.analytics.ai_service import parse_financial_text
from .statement_parser import parse_statement_file
from django.db.models import Sum
from decimal import Decimal
from django.utils import timezone
import pandas as pd
import pdfplumber
import io

class TransactionViewSet(viewsets.ModelViewSet):
    serializer_class = TransactionSerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        return Transaction.objects.filter(user=self.request.user)

    def perform_create(self, serializer, user=None):
        target_user = user or self.request.user
        transaction = serializer.save(user=target_user)
        
        # Smart Alert: Check Budget Proximity
        if transaction.type == 'EXPENSE':
            transaction.refresh_from_db()
            now = timezone.localdate()
            t_month = now.replace(day=1)
            budget = Budget.objects.filter(
                user=target_user, 
                category__iexact=transaction.category,
                month=t_month
            ).first()
            
            if budget:
                total_spent = Transaction.objects.filter(
                    user=target_user,
                    category__iexact=transaction.category,
                    type='EXPENSE',
                    date__year=transaction.date.year,
                    date__month=transaction.date.month
                ).aggregate(Sum('amount'))['amount__sum'] or Decimal('0')
                
                if total_spent > budget.limit:
                    alert_message = f"🚨 Budget Alert: You have exceeded your {transaction.category} budget of KSh {float(budget.limit):,.0f}!"
                    create_notification(target_user, alert_message)
                    return alert_message
        return None

    def create(self, request, *args, **kwargs):
        serializer = self.get_serializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        alert_message = self.perform_create(serializer)
        
        headers = self.get_success_headers(serializer.data)
        response_data = serializer.data
        if alert_message:
            response_data['alert_message'] = alert_message
            
        return Response(response_data, status=status.HTTP_201_CREATED, headers=headers)

    @action(detail=False, methods=['POST'])
    def parse_sms(self, request):
        """
        AI-Powered SMS/Text Parsing.
        """
        text = request.data.get('text', '')
        if not text:
            return Response({"error": "No text provided"}, status=400)
        
        parsed_data = parse_financial_text(text)
        return Response(parsed_data)

    @action(detail=False, methods=['POST'])
    def upload_statement(self, request):
        """
        M-Pesa / Bank Statement Parsing (PDF/CSV/Excel).
        """
        file = request.FILES.get('file')
        password = request.data.get('password')
        if not password or not str(password).strip():
            password = None
        
        if not file:
            return Response({"error": "No file uploaded"}, status=400)

        transactions, error = parse_statement_file(file, file.name, password=password)
        if error:
            return Response({"error": error}, status=400)

        return Response({"transactions": transactions or []})

    @action(detail=False, methods=['POST'])
    def bulk_create(self, request):
        """
        Confirming multiple transactions at once.
        """
        transactions_data = request.data.get('transactions', [])
        created_count = 0
        alerts = []

        for data in transactions_data:
            # Clean date
            if data.get('date') == 'TODAY' or not data.get('date'):
                data['date'] = timezone.localdate()
            
            serializer = self.get_serializer(data=data)
            if serializer.is_valid():
                alert = self.perform_create(serializer)
                if alert:
                    alerts.append(alert)
                created_count += 1
        
        return Response({
            "message": f"Successfully imported {created_count} transactions.",
            "alerts": list(set(alerts)) # Unique alerts
        })
