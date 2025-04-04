from django.db import models
from django.core.validators import RegexValidator

def driver_photo_upload_path(instance, filename):
    return f"drivers/{instance.aadhar_number}/photo/{filename}"

def driver_document_upload_path(instance, filename):
    return f"drivers/{instance.aadhar_number}/documents/{filename}"

class Driver(models.Model):
    STATUS_CHOICES = [
        ('available', 'Available'),
        ('on_trip', 'On Trip'),
        ('off_duty', 'Off Duty'),
    ]

    # Basic Info
    name = models.CharField(max_length=100)
    phone_number = models.CharField(
        max_length=10,
        validators=[RegexValidator(regex=r'^\d{10}$', message="Phone number must be exactly 10 digits.")]
    )
    photo = models.ImageField(upload_to=driver_photo_upload_path, blank=True, null=True)

    # Account Details
    aadhar_number = models.CharField(
        max_length=12,
        validators=[RegexValidator(regex=r'^\d{12}$', message="Aadhar number must be exactly 12 digits.")],
        default="000000000000"
    )
    license_number = models.CharField(max_length=20,default="DL-NOT-SET")
    license_expiry_date = models.DateField(default="2025-01-01")

    # Documents (optional - for additional docs like RC, fitness certificate)
    documents = models.FileField(upload_to=driver_document_upload_path, blank=True, null=True)

    # Status
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default='available')

    # Timestamps
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        ordering = ['name']

    def __str__(self):
        return f"{self.name} - {self.phone_number}"
    
class Transactions(models.Model):
    types = [
        ('Debit', 'Debit'),
        ('Credit', 'Credit'),
    ]
    amount = models.CharField(
        validators=[RegexValidator(regex=r'^\d*$', message="Amount should contain only number")]
    )

    amountType = models.CharField(max_length=20, choices=types, default='Credit')

    reason = models.CharField(max_length=35)

    date = models.DateField(default="2025-01-01")

    driverId = models.CharField()

class Truck(models.Model):
    truckChoices = [('Mini Truck / LCV','Mini Truck / LCV'),
                    ('Open Body Truck', 'Open Body Truck'),
                    ('Closed Container', 'Closed Container'),
                    ('Trailer', 'Trailer'),
                    ('Tanker', 'Tanker'),
                    ('Tipper', 'Tipper'),
                    ('Other', 'Other')]
    
    ownershipChoices = [('Market Truck', 'Market Truck'),
                        ('My Truck', 'My Truck')]

    STATUS_CHOICES = [
            ('available', 'Available'),
            ('on_trip', 'On Trip'),
            ('off_duty', 'Off Duty'),
        ]

    truckNo = models.CharField(max_length=10)

    truckType = models.CharField(choices=truckChoices, default='Tanker')

    ownership = models.CharField(choices=ownershipChoices, default='My Truck')

    truckStatus = models.CharField(max_length=20, choices=STATUS_CHOICES, default='available')
