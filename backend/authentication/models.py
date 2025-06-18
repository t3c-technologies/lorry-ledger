import uuid
from django.db import models
from django.utils.timezone import now
from django.contrib.auth.models import AbstractBaseUser, BaseUserManager, PermissionsMixin


class OTPLog(models.Model):
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    mobile_number = models.CharField(max_length=255)  # Hashed mobile number
    otp_sent = models.CharField(max_length=4)  # OTP sent (unencrypted for logging)
    sent_at = models.DateTimeField(auto_now_add=True)  # Timestamp when OTP was sent
    ip_address = models.GenericIPAddressField(blank=True, null=True)  # IP address
    device_os = models.CharField(max_length=50, blank=True, null=True)  # Device OS
    browser = models.CharField(max_length=1000, blank=True, null=True)  # Browser info
    region = models.CharField(max_length=1000, blank=True, null=True)  # Region info

    def __str__(self):
        return f"OTPLog for {self.mobile_number} at {self.sent_at}"


class OTPSession(models.Model):
    
    STATUS_CHOICES = [
        (0, 'Open'),       
        (1, 'Success'),      
        (2, 'Logged Out')    
    ]

    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    mobile_number = models.CharField(max_length=255)
    otp_sent = models.CharField(max_length=4)
    expiry = models.DateTimeField()
    validated = models.BooleanField(default=False)
    log_status = models.PositiveSmallIntegerField(choices=STATUS_CHOICES, default=0)
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
    

# User model
# Custom User Manager
class UserManager(BaseUserManager):
    def create_user(self, mobile_number, **extra_fields):
        if not mobile_number:
            raise ValueError("Mobile number is required")
        user = self.model(mobile_number=mobile_number, **extra_fields)
        user.save(using=self._db)
        return user

    def create_superuser(self, mobile_number, **extra_fields):
        extra_fields.setdefault('is_staff', True)
        extra_fields.setdefault('is_superuser', True)
        return self.create_user(mobile_number, **extra_fields)


# Custom User Model
class User(AbstractBaseUser, PermissionsMixin):
    # Core fields
    mobile_number = models.CharField(max_length=10, unique=True)

    # Optional fields
    first_name = models.CharField(max_length=50, blank=True, null=True)
    last_name = models.CharField(max_length=50, blank=True, null=True)
    email = models.EmailField(blank=True, null=True)
    company_name = models.CharField(max_length=100, blank=True, null=True)

    # Permissions fields
    is_active = models.BooleanField(default=True)
    is_staff = models.BooleanField(default=False)
    created_at = models.DateTimeField(auto_now_add=True)

    # Avoid related_name conflicts
    groups = models.ManyToManyField(
        'auth.Group', related_name='authentication_users', blank=True
    )
    user_permissions = models.ManyToManyField(
        'auth.Permission', related_name='authentication_users', blank=True
    )

    # Login field
    USERNAME_FIELD = 'mobile_number'
    REQUIRED_FIELDS = []  # No additional required fields

    objects = UserManager()

    def __str__(self):
        return self.mobile_number