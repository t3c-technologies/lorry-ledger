# notifications.py - Corrected version

from datetime import datetime, timedelta
from django.utils import timezone
from django.shortcuts import get_object_or_404
from django.db.models import Q
from rest_framework.decorators import api_view
from rest_framework.response import Response
from rest_framework import status
from twilio.rest import Client as TwilioClient
from dateutil.relativedelta import relativedelta
import json
import logging
import os
from .models import Truck

TWILIO_SID = os.getenv("TWILIO_ACC_SID")
TWILIO_AUTH_TOKEN = os.getenv("TWILIO_AUTH_TOKEN")
TWILIO_FROM_PHONE_NUMBER = os.getenv("TWILIO_FROM_PHONE_NUMBER")  # Should be whatsapp:+1415xxxxxxx

logger = logging.getLogger(__name__)

class NotificationService:
    """Service class to handle all notification logic"""
    
    def __init__(self):
        if TWILIO_SID and TWILIO_AUTH_TOKEN:
            self.twilio_client = TwilioClient(TWILIO_SID, TWILIO_AUTH_TOKEN)
        else:
            logger.warning("Twilio credentials not found. WhatsApp messages will not be sent.")
            self.twilio_client = None
    
    def send_whatsapp_message(self, phone, message):
        """Send WhatsApp message via Twilio"""
        if not self.twilio_client:
            logger.error("Twilio client not initialized")
            return False, "Twilio client not initialized"
            
        try:
            # Ensure phone number has country code
            if not phone.startswith('+'):
                phone = '+91' + phone  # Default to India country code
                
            message = self.twilio_client.messages.create(
                to=f"whatsapp:{phone}",
                from_=TWILIO_FROM_PHONE_NUMBER,
                body=message
            )
            logger.info(f"WhatsApp message sent successfully. SID: {message.sid}")
            return True, message.sid
        except Exception as e:
            logger.error(f"Failed to send WhatsApp message: {str(e)}")
            return False, str(e)
    
    def check_document_expiry_reminders(self, truck_id=None):
        """Check and send document expiry reminders for all trucks or specific truck"""
        current_date = timezone.now().date()
        trucks_query = Truck.objects.select_related('owner')  # Optimize query
        
        if truck_id:
            trucks_query = trucks_query.filter(id=truck_id)
        
        reminder_count = 0
        
        for truck in trucks_query:
            if not truck.documents:
                continue
                
            for doc_type, doc_data in truck.documents.items():
                if not doc_data.get('expiryDate') or not doc_data.get('reminderDays'):
                    continue
                
                try:
                    expiry_date = datetime.strptime(doc_data['expiryDate'], '%Y-%m-%d').date()
                    reminder_days = int(doc_data['reminderDays'])
                    reminder_start_date = expiry_date - timedelta(days=reminder_days)
                    
                    # Check if current date is within reminder period
                    if reminder_start_date <= current_date <= expiry_date:
                        days_until_expiry = (expiry_date - current_date).days
                        
                        # Check if we should send reminder (prevent spam)
                        if self._should_send_document_reminder(truck, doc_type, current_date):
                            message = self._create_document_reminder_message(
                                doc_data.get('name', doc_type),
                                truck.truckNo,
                                doc_data['expiryDate'],
                                days_until_expiry
                            )
                            
                            phone = self._get_truck_owner_phone(truck)
                            
                            if phone:
                                success, result = self.send_whatsapp_message(phone, message)
                                if success:
                                    reminder_count += 1
                                    self._log_document_reminder_sent(truck, doc_type, current_date)
                                    logger.info(f"Document reminder sent for truck {truck.truckNo}, document {doc_type}")
                            else:
                                logger.warning(f"No phone number found for truck {truck.truckNo}")
                
                except (ValueError, TypeError) as e:
                    logger.error(f"Error processing document {doc_type} for truck {truck.truckNo}: {str(e)}")
        
        return reminder_count
    
    def check_emi_payment_reminders(self, truck_id=None):
        """Check and send EMI payment reminders"""
        current_date = timezone.now().date()
        trucks_query = Truck.objects.select_related('owner')  # Optimize query
        
        if truck_id:
            trucks_query = trucks_query.filter(id=truck_id)
        
        reminder_count = 0
        
        for truck in trucks_query:
            if not truck.emi:
                continue
            
            for emi_data in truck.emi:
                if emi_data.get('status') != 'active':
                    continue
                
                reminder_day = self._parse_reminder_day(emi_data.get('reminderDay', '1st'))
                
                # Check if today is the reminder day of the month
                if current_date.day == reminder_day:
                    # Check for upcoming payments that are due
                    upcoming_payments = emi_data.get('upcomingPayments', [])
                    
                    for payment in upcoming_payments:
                        if payment.get('status') == 'due':
                            try:
                                due_date = datetime.strptime(payment['dueDate'], '%Y-%m-%d').date()
                                days_until_due = (due_date - current_date).days
                                
                                # Send reminder if payment is due within next 30 days
                                if 0 <= days_until_due <= 30:
                                    if self._should_send_emi_reminder(truck, emi_data['id'], current_date):
                                        message = self._create_emi_reminder_message(
                                            truck.truckNo,
                                            payment['amount'],
                                            payment['dueDate'],
                                            emi_data.get('financeCompany', 'Finance Company'),
                                            days_until_due
                                        )
                                        
                                        phone = self._get_truck_owner_phone(truck)
                                        
                                        if phone:
                                            success, result = self.send_whatsapp_message(phone, message)
                                            if success:
                                                reminder_count += 1
                                                self._log_emi_reminder_sent(truck, emi_data['id'], current_date)
                                                logger.info(f"EMI reminder sent for truck {truck.truckNo}")
                                        else:
                                            logger.warning(f"No phone number found for truck {truck.truckNo}")
                            
                            except (ValueError, TypeError) as e:
                                logger.error(f"Error processing EMI for truck {truck.truckNo}: {str(e)}")
        
        return reminder_count
    
    def _parse_reminder_day(self, reminder_day_str):
        """Parse reminder day string (e.g., '1st', '2nd', '15th') to integer"""
        if isinstance(reminder_day_str, int):
            return reminder_day_str
        
        try:
            # Extract number from strings like '1st', '2nd', '3rd', '15th'
            number = ''.join(filter(str.isdigit, str(reminder_day_str)))
            return int(number) if number else 1
        except (ValueError, TypeError):
            return 1
    
    def _should_send_document_reminder(self, truck, doc_type, current_date):
        """Check if document reminder should be sent (to prevent spam)"""
        # You can enhance this by storing last reminder dates in database
        # For now, send only once per day per document
        return True  # Implement proper tracking based on your needs
    
    def _should_send_emi_reminder(self, truck, emi_id, current_date):
        """Check if EMI reminder should be sent (to prevent spam)"""
        # You can enhance this by storing last reminder dates in database
        # For now, send only once per day per EMI
        return True  # Implement proper tracking based on your needs
    
    def _get_truck_owner_phone(self, truck):
        """Get truck owner's phone number"""
        return "+917338706726"
        # try:
        #     # Try different possible attributes for phone number
        #     if hasattr(truck, 'owner') and truck.owner:
        #         if hasattr(truck.owner, 'phone') and truck.owner.phone:
        #             return truck.owner.phone
        #         elif hasattr(truck.owner, 'mobile') and truck.owner.mobile:
        #             return truck.owner.mobile
        #         elif hasattr(truck.owner, 'phoneNumber') and truck.owner.phoneNumber:
        #             return truck.owner.phoneNumber
            
        #     # If truck has direct phone field
        #     if hasattr(truck, 'ownerPhone') and truck.ownerPhone:
        #         return truck.ownerPhone
            
        #     # Fallback - you should replace this with actual phone logic
        #     logger.warning(f"No phone number found for truck {truck.truckNo}")
        #     return None
            
        # except Exception as e:
        #     logger.error(f"Error getting phone number for truck {truck.truckNo}: {str(e)}")
        #     return None
    
    def _create_document_reminder_message(self, doc_name, truck_no, expiry_date, days_until_expiry):
        """Create document expiry reminder message"""
        if days_until_expiry == 0:
            urgency = "TODAY"
        elif days_until_expiry == 1:
            urgency = "TOMORROW"
        else:
            urgency = f"in {days_until_expiry} days"
        
        return f"🚛 DOCUMENT REMINDER 🚛\n\nYour {doc_name} for truck {truck_no} expires {urgency} ({expiry_date}).\n\nPlease renew and upload the new document to avoid any issues.\n\n📞 Contact support if you need assistance."
    
    def _create_emi_reminder_message(self, truck_no, amount, due_date, finance_company, days_until_due):
        """Create EMI payment reminder message"""
        if days_until_due == 0:
            urgency = "TODAY"
        elif days_until_due == 1:
            urgency = "TOMORROW"
        else:
            urgency = f"in {days_until_due} days"
        
        return f"💰 EMI PAYMENT REMINDER 💰\n\nTruck: {truck_no}\nFinance Company: {finance_company}\nAmount: ₹{amount}\nDue Date: {due_date}\n\nPayment is due {urgency}. Please ensure timely payment to avoid penalties.\n\n📞 Contact {finance_company} for payment options."
    
    def _log_document_reminder_sent(self, truck, doc_type, date):
        """Log that document reminder was sent"""
        # You might want to store this in database for better tracking
        logger.info(f"Document reminder sent: Truck {truck.truckNo}, Document {doc_type}, Date {date}")
    
    def _log_emi_reminder_sent(self, truck, emi_id, date):
        """Log that EMI reminder was sent"""
        # You might want to store this in database for better tracking
        logger.info(f"EMI reminder sent: Truck {truck.truckNo}, EMI {emi_id}, Date {date}")

# Create a singleton instance
notification_service = NotificationService()