from django.db import models
from django.core.validators import RegexValidator
from django.core.validators import MinLengthValidator
from django.core.files.storage import default_storage
from django.core.files.base import ContentFile
from django.core.exceptions import ValidationError
import base64
import os
import uuid
from datetime import datetime, timedelta
from dateutil.relativedelta import relativedelta
from django.utils import timezone
from datetime import timedelta

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
    truckChoices = [
        ('Mini Truck / LCV','Mini Truck / LCV'), 
        ('Open Body Truck', 'Open Body Truck'), 
        ('Closed Container', 'Closed Container'), 
        ('Trailer', 'Trailer'), 
        ('Tanker', 'Tanker'), 
        ('Tipper', 'Tipper'), 
        ('Other', 'Other')
    ]
    ownershipChoices = [
        ('Market Truck', 'Market Truck'), 
        ('My Truck', 'My Truck')
    ]
    STATUS_CHOICES = [
        ('available', 'Available'), 
        ('on_trip', 'On Trip'), 
        ('off_duty', 'Off Duty'),
    ]
    
    truckNo = models.CharField(max_length=10)
    truckType = models.CharField(choices=truckChoices, default='Tanker')
    ownership = models.CharField(choices=ownershipChoices, default='My Truck')
    truckStatus = models.CharField(max_length=20, choices=STATUS_CHOICES, default='available')
    
    # Add documents field as JSONField
    documents = models.JSONField(default=dict, blank=True)
    
    # Add EMI field as JSONField
    emi = models.JSONField(default=list, blank=True)

    # Add these new fields to track reminder history (optional)
    last_document_reminder_sent = models.DateTimeField(null=True, blank=True)
    last_emi_reminder_sent = models.DateTimeField(null=True, blank=True)
    
    def save_document_file(self, document_data):
        """
        Save uploaded file and return file path
        """
        if 'uploadedFile' in document_data and document_data['uploadedFile']:
            file_data = document_data['uploadedFile']
            
            # If it's base64 data
            if isinstance(file_data, dict) and 'data' in file_data:
                file_content = base64.b64decode(file_data['data'])
                file_name = file_data.get('name', f"{uuid.uuid4()}.pdf")
                
                # Create directory path
                file_path = f"truck_documents/{self.truckNo}/{document_data['type']}/{file_name}"
                
                # Save file
                saved_path = default_storage.save(file_path, ContentFile(file_content))
                return saved_path
                
        return None
    
    def get_document_file_url(self, file_path):
        """
        Get URL for downloading document file
        """
        if file_path and default_storage.exists(file_path):
            return default_storage.url(file_path)
        return None
    
    def update_upcoming_payments(self):
        """
        Update upcoming payments for all EMIs based on due dates
        """
        if not self.emi:
            return
        
        current_date = datetime.now().date()
        updated_emis = []
        
        for emi in self.emi:
            due_day = int(emi.get('dueOn', 1))
            
            # Check if we need to generate new upcoming payments
            upcoming_payments = emi.get('upcomingPayments', [])
            
            # Find the latest upcoming payment date
            latest_due_date = None
            if upcoming_payments:
                latest_due_date = max([
                    datetime.strptime(payment['dueDate'], '%Y-%m-%d').date()
                    for payment in upcoming_payments
                ])
            
            # Generate next payment if within 20 days
            next_due_date = self._get_next_due_date(due_day, latest_due_date)
            
            if next_due_date and (next_due_date - current_date).days <= 20:
                # Check if this payment already exists
                payment_exists = any(
                    payment['dueDate'] == next_due_date.strftime('%Y-%m-%d')
                    for payment in upcoming_payments
                )
                
                if not payment_exists:
                    new_payment = {
                        'id': int(datetime.now().timestamp() * 1000),
                        'amount': float(emi.get('monthlyEMI', 0)),
                        'dueDate': next_due_date.strftime('%Y-%m-%d'),
                        'status': 'due'
                    }
                    upcoming_payments.append(new_payment)
            
            emi['upcomingPayments'] = upcoming_payments
            updated_emis.append(emi)
        
        self.emi = updated_emis
    
    def _get_next_due_date(self, due_day, last_due_date=None):
        """
        Get the next due date based on the due day of the month
        """
        current_date = datetime.now().date()
        
        if last_due_date:
            # Get next month from the last due date
            next_month = last_due_date + relativedelta(months=1)
            next_due_date = next_month.replace(day=min(due_day, 28))  # Ensure valid day
        else:
            # Calculate next due date from current date
            current_month = current_date.replace(day=min(due_day, 28))
            if current_month <= current_date:
                next_due_date = current_month + relativedelta(months=1)
            else:
                next_due_date = current_month
        
        return next_due_date
    
    def save(self, *args, **kwargs):
        # Update upcoming payments before saving
        self.update_upcoming_payments()
        super().save(*args, **kwargs)
    
    def get_owner_phone(self):
        """Override this method to return actual owner's phone number"""
        # Implement based on your User/Owner model structure
        # Example: return self.owner.phone if hasattr(self, 'owner') else None
        return "+919876543210"  # Placeholder
    
    def get_documents_needing_reminder(self):
        """Get documents that need reminders sent"""
        current_date = timezone.now().date()
        documents_needing_reminder = []
        
        if not self.documents:
            return documents_needing_reminder
            
        for doc_type, doc_data in self.documents.items():
            if not doc_data.get('expiryDate') or not doc_data.get('reminderDays'):
                continue
                
            try:
                expiry_date = datetime.strptime(doc_data['expiryDate'], '%Y-%m-%d').date()
                reminder_days = int(doc_data['reminderDays'])
                reminder_start_date = expiry_date - timedelta(days=reminder_days)
                
                if reminder_start_date <= current_date <= expiry_date:
                    documents_needing_reminder.append({
                        'type': doc_type,
                        'data': doc_data,
                        'days_until_expiry': (expiry_date - current_date).days
                    })
            except (ValueError, TypeError):
                continue
                
        return documents_needing_reminder
    
    def get_emis_needing_reminder(self):
        """Get EMIs that need payment reminders"""
        current_date = timezone.now().date()
        emis_needing_reminder = []
        
        if not self.emi:
            return emis_needing_reminder
            
        for emi_data in self.emi:
            if emi_data.get('status') != 'active':
                continue
                
            # Parse reminder day
            reminder_day_str = emi_data.get('reminderDay', '1st')
            try:
                reminder_day = int(''.join(filter(str.isdigit, str(reminder_day_str))))
            except (ValueError, TypeError):
                reminder_day = 1
                
            # Check if today is the reminder day
            if current_date.day == reminder_day:
                upcoming_payments = emi_data.get('upcomingPayments', [])
                
                for payment in upcoming_payments:
                    if payment.get('status') == 'due':
                        try:
                            due_date = datetime.strptime(payment['dueDate'], '%Y-%m-%d').date()
                            days_until_due = (due_date - current_date).days
                            
                            if 0 <= days_until_due <= 30:
                                emis_needing_reminder.append({
                                    'emi_data': emi_data,
                                    'payment': payment,
                                    'days_until_due': days_until_due
                                })
                        except (ValueError, TypeError):
                            continue
                            
        return emis_needing_reminder

class Expense(models.Model):
    expenseTypeChoices = [('Showroom Service', 'Showroom Service'),('Regular Service','Regular Service'),('Minor Repair','Minor Repair'),('Gear Maintenance','Gear Maintenance'),('Brake Oil Change', 'Brake Oil Change'), ('Grease Oil Change', 'Grease Oil Change'), ('Engine Oil Change', 'Engine Oil Change'),
                          ('Spare Parts Purhcase', 'Spare Parts Purhcase'), ('Air Filter Change', 'Air Filter Change'), ('Tyre Purchase', 'Tyre Purchase'), ('Tyre Retread', 'Tyre Retread'), ('Tyre Puncture', 'Tyre Puncture'), ('Roof Top Repair', 'Roof Top Repair'), ('Driver Batta', 'Driver Batta'),
                          ('Driver Payment', 'Driver Payment'), ('Loading Charges', 'Loading Charges'), ('Unloading Charges', 'Unloading Charges'), ('Detention Charges', 'Detention Charges'), ('Union Charges', 'Union Charges'), ('Toll Expense', 'Toll Expense'), ('Police Expense', 'Police Expense'),
                          ('RTO Expense', 'RTO Expense'), ('Brokerage Expense', 'Brokerage Expense'), ('Other Expense', 'Other Expense'), ('Fuel Expense', 'Fuel Expense')]
    paymentModeChoices = [("Cash", 'Cash'), ("Credit", 'Credit'), ("Paid by Driver", 'Paid by Driver'), ("Online", 'Online')]

    truckId = models.CharField()
    expenseType = models.CharField(choices= expenseTypeChoices)
    amountPaid = models.CharField(
        validators=[RegexValidator(regex=r'^\d*$', message="Amount should contain only number")]
    )
    expenseDate = models.DateField(default="2025-01-01")
    paymentMode = models.CharField(choices=paymentModeChoices, default='Cash')
    currentKmReading = models.CharField(
        validators=[RegexValidator(regex=r'^\d*$', message="Reading should contain only number")], blank=True
    )
    fuelQuantity = models.CharField(
        validators=[RegexValidator(regex=r'^\d*$', message="Quantity should contain only number")], blank=True
    )
    notes = models.CharField(max_length=100, blank=True)

class Party(models.Model):
    stateChoices = [('Andhra Pradesh','Andhra Pradesh'),('Arunachal Pradesh','Arunachal Pradesh'),('Assam','Assam'),('Bihar','Bihar'),('Chhattisgarh','Chhattisgarh'),('Delhi','Delhi'),('Goa','Goa'),('Gujarat','Gujarat'),
                ('Haryana','Haryana'),('Himachal Pradesh','Himachal Pradesh'),('Jammu and Kashmir','Jammu and Kashmir'),('Jharkhand','Jharkhand'),('Karnataka','Karnataka'),('Kerala','Kerala'),('Madhya Pradesh','Madhya Pradesh'),
                ('Maharashtra','Maharashtra'),('Manipur','Manipur'),('Meghalaya','Meghalaya'),('Mizoram','Mizoram'),('Nagaland','Nagaland'),('Orissa','Orissa'),('Punjab','Punjab'),('Rajasthan','Rajasthan'),('Sikkim','Sikkim'),('Tamil Nadu','Tamil Nadu'),
                ('Tripura','Tripura'),('Uttar Pradesh','Uttar Pradesh'),('Uttarakhand','Uttarakhand'),('West Bengal','West Bengal'),('Other','Other')]
    partyName = models.CharField(max_length=100)
    openingBalance = models.CharField(
        validators=[RegexValidator(regex=r'^\d*$', message="Opening balance should contain only number")]
    )
    openingBalanceDate = models.DateField(default="2025-01-01")
    mobileNumber = models.CharField(
        max_length=10,
        validators=[RegexValidator(regex=r'^\d{10}$', message="Phone number must be exactly 10 digits.")], 
        blank= True
    )

    gstNumber = models.CharField(max_length=15, blank=True)
    pan = models.CharField(max_length=10, blank=True)
    companyName = models.CharField(max_length=100, blank= True)
    address = models.CharField(max_length=300, blank=True)
    state = models.CharField(choices= stateChoices, blank=True)
    pincode = models.CharField(
        max_length=6,
        validators=[RegexValidator(regex=r'^\d{6}$', message="Pincode must be exactly 6 digits.")],
        blank= True
    )

class Supplier(models.Model):
    supplierName = models.CharField(max_length=100)
    mobileNumber = models.CharField(
        max_length=10,
        validators=[RegexValidator(regex=r'^\d{10}$', message="Phone number must be exactly 10 digits.")], 
        blank= True
    )

class Trip(models.Model):
    partyBillingOptions = [ ("Fixed",'Fixed'),
    ("Per Tonne","Per Tonne"),
    ("Per Kg","Per Kg"),
    ("Per Km","Per Km"),
    ("Per Trip","Per Trip"),
    ("Per Day","Per Day"),
    ("Per Hour","Per Hour"),
    ("Per Litre","Per Litre"),
    ("Per Bag","Per Bag")]

    tripTypeChoices = [('Single Route', 'Single Route'), ('Multiple Routes', 'Multiple Routes')]

    paymentModeChoices = [('Cash','Cash'), ('Cheque', 'Cheque'), ('UPI', 'UPI'), ('Bank Transfer', 'Bank Transfer'), ('Fuel', 'Fuel'), ('Others', 'Others')]

    tripStatusChoices = [('Started','Started'), ('Completed', 'Completed'), ('POD Received', 'POD Received'), ('POD Submitted', 'POD Submitted'), ('Settled', 'Settled')]

    partyId = models.ForeignKey(
        'Party',
        on_delete= models.PROTECT,
        related_name= 'trips'
    )
    truckId = models.ForeignKey(
        'Truck',
        on_delete= models.PROTECT,
        related_name= 'trips'
    )
    driverId = models.ForeignKey(
        'Driver',
        on_delete= models.PROTECT,
        related_name= 'trips',
        default='1'
    )
    origin = models.CharField(max_length=100)
    destination = models.CharField(max_length=100)
    tripType = models.CharField(choices=tripTypeChoices, default='Single Route')
    partyBillingType = models.CharField(choices=partyBillingOptions)
    ratePerUnit = models.CharField(
        validators=[RegexValidator(regex=r'^\d+(\.\d+)?$', message="Rate must be in digits.")], default=0 
    )
    noOfUnits = models.CharField(
        validators=[RegexValidator(regex=r'^\d+$', message="Number of Units must be in digits.")], default=0
    )
    partyFreightAmount = models.CharField(
        validators=[RegexValidator(regex=r'^\d+(\.\d+)?$', message="Amount must be in digits.")], 
    )
    tripStatus = models.CharField(choices=tripStatusChoices, default='Started')
    startDate = models.DateField(default="2025-01-01")
    startKmsReading = models.CharField(
        validators=[RegexValidator(regex=r'^\d*$', message="Reading should contain only number")], blank=True
    )
    tripEndDate = models.DateField(blank=True, null=True)
    endKmsReading = models.CharField(
        validators=[RegexValidator(regex=r'^\d*$', message="Reading should contain only number")], blank=True
    )
    PODReceivedDate = models.DateField(blank=True, null=True)
    PODSubmittedDate = models.DateField(blank=True, null=True)
    settlementDate = models.DateField(blank=True, null=True)
    settlementPaymentMode = models.CharField(choices=paymentModeChoices, default='Cash', blank=True)
    settlementNotes = models.CharField(max_length=200, blank=True)
    receivedByDriver = models.BooleanField(default=False)

    # Add JSONField for consigner-consignee data
    routes = models.JSONField(default=list, blank=True)

    #Trip Expenses
    expenses = models.JSONField(default=list, blank=True, null=True)

    #Party Bill Charges
    advances = models.JSONField(default=list, blank=True, null=True)
    charges = models.JSONField(default=list, blank=True, null=True)
    payments = models.JSONField(default=list, blank=True, null=True)

    @property
    def LRCount(self):
        """Return the number of LRs associated with this trip"""
        return self.LR.all().count()




class Consigner(models.Model):
    stateChoices = [('Andhra Pradesh','Andhra Pradesh'),('Arunachal Pradesh','Arunachal Pradesh'),('Assam','Assam'),('Bihar','Bihar'),('Chhattisgarh','Chhattisgarh'),('Delhi','Delhi'),('Goa','Goa'),('Gujarat','Gujarat'),
                ('Haryana','Haryana'),('Himachal Pradesh','Himachal Pradesh'),('Jammu and Kashmir','Jammu and Kashmir'),('Jharkhand','Jharkhand'),('Karnataka','Karnataka'),('Kerala','Kerala'),('Madhya Pradesh','Madhya Pradesh'),
                ('Maharashtra','Maharashtra'),('Manipur','Manipur'),('Meghalaya','Meghalaya'),('Mizoram','Mizoram'),('Nagaland','Nagaland'),('Orissa','Orissa'),('Punjab','Punjab'),('Rajasthan','Rajasthan'),('Sikkim','Sikkim'),('Tamil Nadu','Tamil Nadu'),
                ('Tripura','Tripura'),('Uttar Pradesh','Uttar Pradesh'),('Uttarakhand','Uttarakhand'),('West Bengal','West Bengal'),('Other','Other')]
    gstNumber = models.CharField(max_length=15, validators=[MinLengthValidator(15)])
    name = models.CharField(max_length=100)
    addressLine1 = models.CharField(max_length=150)
    addressLine2 = models.CharField(max_length=150, blank=True)
    state = models.CharField(choices=stateChoices)
    pincode = models.CharField(max_length=6,
        validators=[RegexValidator(regex=r'^\d{6}$', message="Pincode must be exactly 6 digits.")],)
    mobileNumber = models.CharField(
        max_length=10,
        validators=[RegexValidator(regex=r'^\d{10}$', message="Phone number must be exactly 10 digits.")]
    )

class Consignee(models.Model):
    stateChoices = [('Andhra Pradesh','Andhra Pradesh'),('Arunachal Pradesh','Arunachal Pradesh'),('Assam','Assam'),('Bihar','Bihar'),('Chhattisgarh','Chhattisgarh'),('Delhi','Delhi'),('Goa','Goa'),('Gujarat','Gujarat'),
                ('Haryana','Haryana'),('Himachal Pradesh','Himachal Pradesh'),('Jammu and Kashmir','Jammu and Kashmir'),('Jharkhand','Jharkhand'),('Karnataka','Karnataka'),('Kerala','Kerala'),('Madhya Pradesh','Madhya Pradesh'),
                ('Maharashtra','Maharashtra'),('Manipur','Manipur'),('Meghalaya','Meghalaya'),('Mizoram','Mizoram'),('Nagaland','Nagaland'),('Orissa','Orissa'),('Punjab','Punjab'),('Rajasthan','Rajasthan'),('Sikkim','Sikkim'),('Tamil Nadu','Tamil Nadu'),
                ('Tripura','Tripura'),('Uttar Pradesh','Uttar Pradesh'),('Uttarakhand','Uttarakhand'),('West Bengal','West Bengal'),('Other','Other')]
    gstNumber = models.CharField(max_length=15, validators=[MinLengthValidator(15)])
    name = models.CharField(max_length=100)
    addressLine1 = models.CharField(max_length=150)
    addressLine2 = models.CharField(max_length=150, blank=True)
    state = models.CharField(choices=stateChoices)
    pincode = models.CharField(max_length=6,
        validators=[RegexValidator(regex=r'^\d{6}$', message="Pincode must be exactly 6 digits.")],)
    mobileNumber = models.CharField(
        max_length=10,
        validators=[RegexValidator(regex=r'^\d{10}$', message="Phone number must be exactly 10 digits.")]
    )

class LR(models.Model):
    paymentOptions = [('Consigner', 'Consigner'), ('Consignee', 'Consignee'), ('Agent', 'Agent')]
    unitChoices = [('Tonnes', 'Tonnes'), ('Kg','Kg'), ('Quintal', 'Quintal')]
    freightPaidBy = models.CharField(choices=paymentOptions, default='Consigner')
    gstPercentage = models.CharField(max_length=3,
        validators=[RegexValidator(regex=r'^\d*$', message="Percentage must be within 100.")], blank=True)
    lrDate = models.DateField(default="2025-01-01")
    lrNumber = models.CharField(max_length = 30)
    materialCategory = models.CharField(max_length=50)
    numberOfPackages = models.CharField(max_length=20, validators=[RegexValidator(regex=r'^\d*$', message="Number of Packages should be a number")], blank=True, null=True)
    unit = models.CharField(choices=unitChoices, default='Tonnes')
    weight = models.CharField(max_length=30, validators=[RegexValidator(regex=r'^\d*$', message="Weight must be a number")], blank=True, null=True)

    routeIndex = models.CharField(max_length = 30, default=-1)

    consignerId = models.ForeignKey(
        'Consigner',
        on_delete= models.PROTECT,
        related_name= 'LR'
    )
    consigneeId = models.ForeignKey(
        'Consignee',
        on_delete= models.PROTECT,
        related_name= 'LR'
    )
    tripId = models.ForeignKey(
        'Trip',
        on_delete= models.PROTECT,
        related_name= 'LR',
        default='1'
    )
    def clean(self):
        super().clean()
        if not self.weight and not self.numberOfPackages:
            raise ValidationError({
                'weight': 'Either weight or number of packages must be provided.',
                'numberOfPackages': 'Either weight or number of packages must be provided.'
            })

class Invoice(models.Model):
    paymentOptions = [('Consigner', 'Consigner'), ('Consignee', 'Consignee'), ('Agent', 'Agent')]
    unitChoices = [('Tonnes', 'Tonnes'), ('Kg','Kg'), ('Quintal', 'Quintal')]
    freightPaidBy = models.CharField(choices=paymentOptions, default='Consigner')
    gstPercentage = models.CharField(max_length=3,
        validators=[RegexValidator(regex=r'^\d*$', message="Percentage must be within 100.")], blank=True)
    invoiceDate = models.DateField(default="2025-01-01")
    invoiceNumber = models.CharField(max_length = 30)
    materialCategory = models.CharField(max_length=50)
    numberOfPackages = models.CharField(max_length=20, validators=[RegexValidator(regex=r'^\d*$', message="Number of Packages should be a number")], blank=True, null=True)
    unit = models.CharField(choices=unitChoices, default='Tonnes')
    weight = models.CharField(max_length=30, validators=[RegexValidator(regex=r'^\d*$', message="Weight must be a number")],blank=True, null=True)

    routeIndex = models.CharField(max_length = 30, default=-1)

    consignerId = models.ForeignKey(
        'Consigner',
        on_delete= models.PROTECT,
        related_name= 'Invoice'
    )
    consigneeId = models.ForeignKey(
        'Consignee',
        on_delete= models.PROTECT,
        related_name= 'Invoice'
    )
    tripId = models.ForeignKey(
        'Trip',
        on_delete= models.PROTECT,
        related_name= 'Invoice',
        default='1'
    )

    def clean(self):
        super().clean()
        if not self.weight and not self.numberOfPackages:
            raise ValidationError({
                'weight': 'Either weight or number of packages must be provided.',
                'numberOfPackages': 'Either weight or number of packages must be provided.'
            })

class Location(models.Model):
    locationName = models.CharField(max_length=100)

class Material(models.Model):
    materialName = models.CharField(max_length=100)