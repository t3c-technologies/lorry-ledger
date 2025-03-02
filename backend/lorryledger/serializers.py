# drivers/serializers.py

from rest_framework import serializers
from .models import Driver

class DriverSerializer(serializers.ModelSerializer):
    status_display = serializers.SerializerMethodField()

    class Meta:
        model = Driver
        fields = ['id', 'name', 'phone_number', 'status', 'status_display', 'created_at', 'updated_at']
        read_only_fields = ['id', 'created_at', 'updated_at', 'status_display']

    def get_status_display(self, obj):
        return obj.get_status_display()
