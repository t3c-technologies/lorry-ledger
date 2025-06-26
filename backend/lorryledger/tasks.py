# tasks.py - Corrected Celery tasks for automated scheduling
# Create this file in your Django app directory

from backend.lorryledger.celery_config import shared_task
from django.utils import timezone
from .notifications import notification_service  # Now this import will work
import logging

logger = logging.getLogger(__name__)

@shared_task(bind=True, max_retries=3)
def check_document_reminders_task(self, truck_id=None):
    """
    Celery task to check and send document expiry reminders
    """
    try:
        count = notification_service.check_document_expiry_reminders(truck_id)
        logger.info(f"Document reminder task completed. {count} reminders sent.")
        return {
            'status': 'success',
            'reminders_sent': count,
            'timestamp': timezone.now().isoformat(),
            'truck_id': truck_id
        }
    except Exception as e:
        logger.error(f"Document reminder task failed: {str(e)}")
        # Retry the task with exponential backoff
        if self.request.retries < self.max_retries:
            raise self.retry(countdown=60 * (self.request.retries + 1), exc=e)
        return {
            'status': 'failed',
            'error': str(e),
            'timestamp': timezone.now().isoformat(),
            'truck_id': truck_id
        }

@shared_task(bind=True, max_retries=3)
def check_emi_reminders_task(self, truck_id=None):
    """
    Celery task to check and send EMI payment reminders
    """
    try:
        count = notification_service.check_emi_payment_reminders(truck_id)
        logger.info(f"EMI reminder task completed. {count} reminders sent.")
        return {
            'status': 'success',
            'reminders_sent': count,
            'timestamp': timezone.now().isoformat(),
            'truck_id': truck_id
        }
    except Exception as e:
        logger.error(f"EMI reminder task failed: {str(e)}")
        # Retry the task with exponential backoff
        if self.request.retries < self.max_retries:
            raise self.retry(countdown=60 * (self.request.retries + 1), exc=e)
        return {
            'status': 'failed',
            'error': str(e),
            'timestamp': timezone.now().isoformat(),
            'truck_id': truck_id
        }

@shared_task(bind=True, max_retries=3)
def check_all_reminders_task(self, truck_id=None):
    """
    Celery task to check and send all reminders
    """
    try:
        doc_count = notification_service.check_document_expiry_reminders(truck_id)
        emi_count = notification_service.check_emi_payment_reminders(truck_id)
        total_count = doc_count + emi_count
        
        logger.info(f"All reminders task completed. {total_count} total reminders sent.")
        return {
            'status': 'success',
            'document_reminders_sent': doc_count,
            'emi_reminders_sent': emi_count,
            'total_reminders_sent': total_count,
            'timestamp': timezone.now().isoformat(),
            'truck_id': truck_id
        }
    except Exception as e:
        logger.error(f"All reminders task failed: {str(e)}")
        # Retry the task with exponential backoff
        if self.request.retries < self.max_retries:
            raise self.retry(countdown=60 * (self.request.retries + 1), exc=e)
        return {
            'status': 'failed',
            'error': str(e),
            'timestamp': timezone.now().isoformat(),
            'truck_id': truck_id
        }

# Manual trigger tasks for testing
@shared_task
def test_document_reminder(truck_id):
    """Test task to send document reminder for specific truck"""
    try:
        count = notification_service.check_document_expiry_reminders(truck_id)
        return f"Test completed. {count} document reminders sent for truck {truck_id}"
    except Exception as e:
        logger.error(f"Test document reminder failed: {str(e)}")
        return f"Test failed: {str(e)}"

@shared_task
def test_emi_reminder(truck_id):
    """Test task to send EMI reminder for specific truck"""
    try:
        count = notification_service.check_emi_payment_reminders(truck_id)
        return f"Test completed. {count} EMI reminders sent for truck {truck_id}"
    except Exception as e:
        logger.error(f"Test EMI reminder failed: {str(e)}")
        return f"Test failed: {str(e)}"