from django.contrib import admin
from .models import OTPSession, OTPLog

@admin.register(OTPSession)
class OTPSessionAdmin(admin.ModelAdmin):
    list_display = (
        'id',
        'mobile_number',
        'otp_sent',
        'otp_log',
        'expiry',
        'validated',
        'created_at',
        'resend_count'
    )
    list_filter = ('mobile_number','otp_sent','otp_log','resend_count','validated', 'created_at', 'expiry')
    search_fields = ('mobile_number', 'otp_sent', 'ip_address', 'region', 'browser')
    readonly_fields = ('created_at', 'updated_at')

@admin.register(OTPLog)
class OTPLogAdmin(admin.ModelAdmin):
    list_display = (
        'id',
        'mobile_number',
        'otp_sent',
        'sent_at',
        'ip_address',
        'device_os',
        'browser',
        'region'
    )
    list_filter = ('mobile_number','otp_sent','ip_address')
    search_fields = ('mobile_number', 'otp_sent')

admin.site.site_header = "Lorry Ledger Admin"
admin.site.site_title = "Lorry Ledger Admin Portal"
admin.site.index_title = "Welcome to Lorry Ledger Portal"
