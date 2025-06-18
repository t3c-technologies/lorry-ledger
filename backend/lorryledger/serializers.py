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
        fields = ['id', 'truckNo', 'truckType', 'ownership', 'truckStatus', 'truckStatus_display', 'documents', 'emi']
        read_only_fields = ['id', 'truckStatus_display']
    
    def get_truckStatus_display(self, obj):
        return obj.get_truckStatus_display()
    
    def create(self, validated_data):
        documents_data = validated_data.pop('documents', {})
        emi_data = validated_data.pop('emi', [])
        truck = Truck.objects.create(**validated_data)
        
        # Process and save document files
        if documents_data:
            processed_documents = {}
            for doc_type, doc_data in documents_data.items():
                processed_doc = doc_data.copy()
                
                # Save file and store file path
                if 'uploadedFile' in processed_doc:
                    file_path = truck.save_document_file(processed_doc)
                    if file_path:
                        processed_doc['filePath'] = file_path
                        # Remove the original file data to save space
                        processed_doc.pop('uploadedFile', None)
                
                processed_documents[doc_type] = processed_doc
            
            truck.documents = processed_documents
        
        # Process EMI data
        if emi_data:
            truck.emi = emi_data
        
        truck.save()
        return truck
    
    def update(self, instance, validated_data):
        documents_data = validated_data.pop('documents', None)
        emi_data = validated_data.pop('emi', None)
        
        # Update truck fields
        for attr, value in validated_data.items():
            setattr(instance, attr, value)
        
        # Process documents if provided
        if documents_data is not None:
            processed_documents = {}
            
            for doc_type, doc_data in documents_data.items():
                processed_doc = doc_data.copy()
                
                # Only process file if uploadedFile is present (new upload)
                if 'uploadedFile' in processed_doc:
                    file_path = instance.save_document_file(processed_doc)
                    if file_path:
                        processed_doc['filePath'] = file_path
                        processed_doc.pop('uploadedFile', None)
                # If no uploadedFile, keep existing filePath
                elif 'filePath' not in processed_doc:
                    # Handle case where document exists but no file path
                    existing_doc = instance.documents.get(doc_type, {}) if instance.documents else {}
                    if 'filePath' in existing_doc:
                        processed_doc['filePath'] = existing_doc['filePath']
                
                processed_documents[doc_type] = processed_doc
            
            instance.documents = processed_documents
        
        # Process EMI data if provided
        if emi_data is not None:
            instance.emi = emi_data
        
        instance.save()
        return instance

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
    
    LRCount = serializers.IntegerField(read_only=True)

    # Make JSON fields optional and provide defaults
    routes = serializers.JSONField(required=False, default=list)
    expenses = serializers.JSONField(required=False, default=list, allow_null=True)
    advances = serializers.JSONField(required=False, default=list, allow_null=True)
    charges = serializers.JSONField(required=False, default=list, allow_null=True)
    payments = serializers.JSONField(required=False, default=list, allow_null=True)
    
    class Meta:
        model = Trip
        fields = [
            'id', 'LRCount', 'origin', 'destination', 'partyBillingType', 
            'ratePerUnit', 'noOfUnits', 'partyFreightAmount', 'tripStatus', 'startDate', 
            'startKmsReading', 'tripEndDate', 'endKmsReading', 'PODReceivedDate', 
            'PODSubmittedDate', 'settlementDate', 'settlementPaymentMode', 
            'settlementNotes', 'receivedByDriver', 'routes', 'expenses', 'advances', 'charges', 'payments',
            'party', 'truck', 'driver', 'party_id', 'truck_id', 'driver_id'
        ]
        read_only_fields = ['id', 'LRCount']

    def validate_routes(self, value):
        """
        Validate that routes is properly formatted JSON
        """
        if value is None:
            return []
        if not isinstance(value, list):
            try:
                import json
                return json.loads(value)
            except (json.JSONDecodeError, TypeError):
                raise serializers.ValidationError("Routes must be valid JSON")
        return value

    def validate_expenses(self, value):
        """
        Validate that expenses is properly formatted JSON
        """
        if value is None:
            return []
        if not isinstance(value, list):
            try:
                import json
                return json.loads(value)
            except (json.JSONDecodeError, TypeError):
                raise serializers.ValidationError("Expenses must be valid JSON")
        return value

    def validate_advances(self, value):
        """
        Validate that advances is properly formatted JSON
        """
        if value is None:
            return []
        if not isinstance(value, list):
            try:
                import json
                return json.loads(value)
            except (json.JSONDecodeError, TypeError):
                raise serializers.ValidationError("Advances must be valid JSON")
        return value

    def validate_charges(self, value):
        """
        Validate that charges is properly formatted JSON
        """
        if value is None:
            return []
        if not isinstance(value, list):
            try:
                import json
                return json.loads(value)
            except (json.JSONDecodeError, TypeError):
                raise serializers.ValidationError("Charges must be valid JSON")
        return value

    def validate_payments(self, value):
        """
        Validate that payments is properly formatted JSON
        """
        if value is None:
            return []
        if not isinstance(value, list):
            try:
                import json
                return json.loads(value)
            except (json.JSONDecodeError, TypeError):
                raise serializers.ValidationError("Payments must be valid JSON")
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