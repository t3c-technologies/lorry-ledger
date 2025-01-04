from django.contrib import admin
from .models import OTPSession

@admin.register(OTPSession)
class OTPSessionAdmin(admin.ModelAdmin):
    list_display = (
        'id',
        'mobile_number',
        'otp_sent',
        'expiry',
        'validated',
        'created_at',
        'resend_count'
    )
    list_filter = ('validated', 'created_at', 'expiry')
    search_fields = ('mobile_number', 'otp_sent', 'ip_address', 'region', 'browser')
    readonly_fields = ('created_at', 'updated_at')

admin.site.site_header = "Lorry Ledger Admin"
admin.site.site_title = "Lorry Ledger Admin Portal"
admin.site.index_title = "Welcome to Lorry Ledger Portal"
