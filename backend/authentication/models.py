import uuid
from django.db import models
from django.utils.timezone import now


class OTPLog(models.Model):
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    mobile_number = models.CharField(max_length=255)  # Hashed mobile number
    otp_sent = models.CharField(max_length=4)  # OTP sent (unencrypted for logging)
    sent_at = models.DateTimeField(auto_now_add=True)  # Timestamp when OTP was sent
    ip_address = models.GenericIPAddressField(blank=True, null=True)  # IP address
    device_os = models.CharField(max_length=50, blank=True, null=True)  # Device OS
    browser = models.CharField(max_length=100, blank=True, null=True)  # Browser info
    region = models.CharField(max_length=100, blank=True, null=True)  # Region info

    def __str__(self):
        return f"OTPLog for {self.mobile_number} at {self.sent_at}"


class OTPSession(models.Model):
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    mobile_number = models.CharField(max_length=255)
    otp_sent = models.CharField(max_length=4)
    expiry = models.DateTimeField()
    validated = models.BooleanField(default=False)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    resend_count = models.IntegerField(default=0)

    # Foreign key to link with OTPLog
    otp_log = models.ForeignKey(
        OTPLog,  # Reference OTPLog model
        on_delete=models.CASCADE,  # Delete session if log is deleted
        related_name='sessions',  # Allows reverse lookup (otp_log.sessions.all())
        null=True,  # Optional link
        blank=True
    )

    def is_expired(self):
        """Check if OTP has expired."""
        return now() > self.expiry

    def __str__(self):
        return f"OTP Session for {self.mobile_number} - Validated: {self.validated}"
