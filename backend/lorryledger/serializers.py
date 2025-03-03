# drivers/serializers.py

from rest_framework import serializers
from .models import Driver

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
