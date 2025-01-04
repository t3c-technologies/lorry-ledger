import uuid
from django.db import models
from django.utils.timezone import now


class OTPSession(models.Model):
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    mobile_number = models.CharField(max_length=255)
    otp_sent = models.CharField(max_length=4)
    expiry = models.DateTimeField()
    validated = models.BooleanField(default=False)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    device_os = models.CharField(max_length=50, blank=True, null=True)
    ip_address = models.GenericIPAddressField(blank=True, null=True)
    region = models.CharField(max_length=100, blank=True, null=True)
    browser = models.CharField(max_length=100, blank=True, null=True)
    resend_count = models.IntegerField(default=0)

    def is_expired(self):
        """Check if OTP has expired."""
        return now() > self.expiry

    def __str__(self):
        return f"OTP Session for {self.mobile_number} - Validated: {self.validated}"
