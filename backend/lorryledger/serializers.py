# drivers/serializers.py

from rest_framework import serializers
from .models import Driver, Transactions, Truck, Expense, Party, Supplier, Trip, Consigner, Consignee, LR, Invoice

class DriverSerializer(serializers.ModelSerializer):
    status_display = serializers.SerializerMethodField()
    documents = serializers.SerializerMethodField()
    photo = serializers.SerializerMethodField()

    class Meta:
        model = Driver
        fields = [
            'id', 'name', 'phone_number', 'photo',
            'aadhar_number', 'license_number', 'license_expiry_date',
            'documents', 'status', 'status_display', 'created_at', 'updated_at'
        ]
        read_only_fields = ['id', 'created_at', 'updated_at', 'status_display']

    def get_status_display(self, obj):
        return obj.get_status_display()

    def get_photo(self, obj):
        if obj.photo:
            return obj.photo.url  # Returns relative URL
        return None

    def get_documents(self, obj):
        if obj.documents:
            return obj.documents.url  # Returns relative URL
        return None

class TransactionsSerializer(serializers.ModelSerializer):
    class Meta:
        model = Transactions
        fields = [
            'id', 'amount', 'amountType', 'reason', 'date', 'driverId'
        ]
        read_only_fields = ['id']

class TruckSerializer(serializers.ModelSerializer):
    truckStatus_display = serializers.SerializerMethodField()
    
    
    class Meta:
        model = Truck
        fields = ['id', 'truckNo', 'truckType', 'ownership', 'truckStatus', 'truckStatus_display']
        read_only_fields = ['id', 'truckStatus_display']
    
    def get_truckStatus_display(self, obj):
        return obj.get_truckStatus_display()

class ExpenseSerializer(serializers.ModelSerializer):
    class Meta:
        model = Expense
        fields = ['id', 'expenseType', 'amountPaid', 'expenseDate', 'paymentMode', 'currentKmReading', 'fuelQuantity', 'notes', 'truckId']
        read_only_fields = ['id']

class PartySerializer(serializers.ModelSerializer):
    class Meta:
        model = Party
        fields = ['id', 'partyName', 'openingBalance', 'openingBalanceDate', 'mobileNumber', 'gstNumber', 'pan', 'companyName', 'address', 'state', 'pincode']
        read_only_fields = ['id']

class SupplierSerializer(serializers.ModelSerializer):
    class Meta:
        model = Supplier
        fields = ['id', 'supplierName', 'mobileNumber']
        read_only_fields = ['id']

class TripSerializer(serializers.ModelSerializer):
    # Nested serializers for read operations
    party = PartySerializer(source='partyId', read_only=True)
    truck = TruckSerializer(source='truckId', read_only=True)
    driver = DriverSerializer(source='driverId', read_only=True)
    
    # Fields for write operations
    party_id = serializers.PrimaryKeyRelatedField(
        source='partyId',
        queryset=Party.objects.all(),
        write_only=True
    )
    truck_id = serializers.PrimaryKeyRelatedField(
        source='truckId',
        queryset=Truck.objects.all(),
        write_only=True
    )
    driver_id = serializers.PrimaryKeyRelatedField(
        source='driverId',
        queryset=Driver.objects.all(),
        write_only=True
    )
    
    # Since LRCount is now a property, it will be treated as read-only by default
    # If you want to make it explicit, you could add:
    LRCount = serializers.IntegerField(read_only=True)

    routes = serializers.JSONField()
    
    class Meta:
        model = Trip
        fields = [
            'id', 'LRCount', 'origin', 'destination', 'partyBillingType', 
            'ratePerUnit', 'noOfUnits', 'partyFreightAmount', 'tripStatus', 'startDate', 
            'startKmsReading', 'tripEndDate', 'endKmsReading', 'PODReceivedDate', 
            'PODSubmittedDate', 'settlementDate', 'settlementPaymentMode', 
            'settlementNotes', 'receivedByDriver', 'routes',
            'party', 'truck', 'driver', 'party_id', 'truck_id', 'driver_id'
        ]
        read_only_fields = ['id', 'LRCount']

        def validate_routes(self, value):
            """
            Validate that routes is properly formatted JSON
            """
            if not isinstance(value, list):
                try:
                    # If it's a string, try to parse it as JSON
                    import json
                    return json.loads(value)
                except (json.JSONDecodeError, TypeError):
                    raise serializers.ValidationError("Routes must be valid JSON")
            return value

class ConsignerSerializer(serializers.ModelSerializer):
    class Meta:
        model = Consigner
        fields = ['id', 'gstNumber', 'name', 'addressLine1', 'addressLine2', 'state', 'pincode', 'mobileNumber']
        read_only_fields = ['id']

class ConsigneeSerializer(serializers.ModelSerializer):
    class Meta:
        model = Consignee
        fields = ['id', 'gstNumber', 'name', 'addressLine1', 'addressLine2', 'state', 'pincode', 'mobileNumber']
        read_only_fields = ['id']

class LRSerializer(serializers.ModelSerializer):
    # Nested serializers for read operations
    consigner = ConsignerSerializer(source='consignerId', read_only=True)
    consignee = ConsigneeSerializer(source='consigneeId', read_only=True)
    trip = TripSerializer(source= 'tripId', read_only = True)

    # Fields for write operations
    consigner_id = serializers.PrimaryKeyRelatedField(
        source='consignerId',
        queryset=Consigner.objects.all(),
        write_only=True
    )
    consignee_id = serializers.PrimaryKeyRelatedField(
        source='consigneeId',
        queryset=Consignee.objects.all(),
        write_only=True
    )

    trip_id = serializers.PrimaryKeyRelatedField(
        source='tripId',
        queryset=Trip.objects.all(),
        write_only=True
    )
    
    class Meta:
        model = LR
        fields = [
            'id', 'freightPaidBy', 'gstPercentage', 'lrDate', 'lrNumber', 'materialCategory', 'numberOfPackages', 'unit', 'weight', 'consigner', 'consignee', 'trip', 'consigner_id', 'consignee_id', 'trip_id'
        ]
        read_only_fields = ['id']

class InvoiceSerializer(serializers.ModelSerializer):
    # Nested serializers for read operations
    consigner = ConsignerSerializer(source='consignerId', read_only=True)
    consignee = ConsigneeSerializer(source='consigneeId', read_only=True)
    trip = TripSerializer(source= 'tripId', read_only = True)

    # Fields for write operations
    consigner_id = serializers.PrimaryKeyRelatedField(
        source='consignerId',
        queryset=Consigner.objects.all(),
        write_only=True
    )
    consignee_id = serializers.PrimaryKeyRelatedField(
        source='consigneeId',
        queryset=Consignee.objects.all(),
        write_only=True
    )

    trip_id = serializers.PrimaryKeyRelatedField(
        source='tripId',
        queryset=Trip.objects.all(),
        write_only=True
    )
    
    class Meta:
        model = Invoice
        fields = [
            'id', 'freightPaidBy', 'gstPercentage', 'invoiceDate', 'invoiceNumber', 'materialCategory', 'numberOfPackages', 'unit', 'weight', 'consigner', 'consignee', 'trip', 'consigner_id', 'consignee_id', 'trip_id'
        ]
        read_only_fields = ['id']