# celery_config.py - Renamed to avoid import conflicts
from celery import Celery
from celery.schedules import crontab
import os

# Set the default Django settings module for the 'celery' program.
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'lorryledger.settings')

app = Celery('lorryledger')

# Redis configuration for Windows
app.conf.update(
    broker_url='redis://localhost:6379/0',
    result_backend='redis://localhost:6379/0',
    task_serializer='json',
    accept_content=['json'],
    result_serializer='json',
    result_expires=3600,
    timezone='Asia/Kolkata',
    
    # Windows-specific settings
    worker_pool='solo',  # Use solo pool for Windows
    task_track_started=True,
    task_time_limit=30 * 60,
    task_soft_time_limit=25 * 60,
    worker_prefetch_multiplier=1,
    worker_max_tasks_per_child=1000,
)

# Beat schedule for periodic tasks
app.conf.beat_schedule = {
    'check-document-reminders-daily': {
        'task': 'your_app_name.tasks.check_document_reminders_task',  # Replace 'your_app_name' with actual app name
        'schedule': crontab(hour=9, minute=0),
        'options': {'expires': 3600}
    },
    'check-emi-reminders-daily': {
        'task': 'your_app_name.tasks.check_emi_reminders_task',  # Replace 'your_app_name' with actual app name
        'schedule': crontab(hour=10, minute=0),
        'options': {'expires': 3600}
    },
    'check-all-reminders-morning': {
        'task': 'your_app_name.tasks.check_all_reminders_task',  # Replace 'your_app_name' with actual app name
        'schedule': crontab(hour=8, minute=30),
        'options': {'expires': 3600}
    },
    'check-all-reminders-evening': {
        'task': 'your_app_name.tasks.check_all_reminders_task',  # Replace 'your_app_name' with actual app name
        'schedule': crontab(hour=18, minute=30),
        'options': {'expires': 3600}
    },
}

# Load task modules from all registered Django apps
app.config_from_object('django.conf:settings', namespace='CELERY')
app.autodiscover_tasks()

@app.task(bind=True)
def debug_task(self):
    print(f'Request: {self.request!r}')