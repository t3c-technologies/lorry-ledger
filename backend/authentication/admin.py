from django.contrib import admin
from .models import OTPSession, OTPLog
from django.contrib.auth.admin import UserAdmin as BaseUserAdmin
from .models import User
from django import forms

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
        'resend_count',
        'log_status'
    )
    list_filter = ('mobile_number','otp_sent','otp_log','log_status','resend_count','validated', 'created_at', 'expiry')
    search_fields = ('mobile_number', 'otp_sent','log_status', 'ip_address', 'region', 'browser')
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

# Custom User Creation Form (No Password Required)
class UserCreationForm(forms.ModelForm):
    class Meta:
        model = User
        fields = ('mobile_number', 'first_name', 'last_name', 'email', 'company_name')

    def save(self, commit=True):
        user = super().save(commit=False)
        if commit:
            user.save()
        return user


# Custom User Change Form (For Editing Existing Users)
class UserChangeForm(forms.ModelForm):
    class Meta:
        model = User
        fields = ('mobile_number', 'first_name', 'last_name', 'email', 'company_name', 'is_active', 'is_staff', 'is_superuser')


# Custom User Admin (Overrides Default Behavior)
class CustomUserAdmin(admin.ModelAdmin):  # Replacing UserAdmin
    # Use the custom forms
    form = UserChangeForm
    add_form = UserCreationForm

    # Display fields in admin list view
    list_display = ('mobile_number', 'first_name', 'last_name', 'email', 'company_name', 'is_active', 'is_staff', 'created_at')
    list_filter = ('is_active', 'is_staff', 'created_at')

    # Fields to edit in detail view
    fieldsets = (
        ('Personal Info', {'fields': ('mobile_number', 'first_name', 'last_name', 'email', 'company_name')}),
        ('Permissions', {'fields': ('is_active', 'is_staff', 'is_superuser', 'groups', 'user_permissions')}),
        ('Important Dates', {'fields': ('last_login', 'created_at')}),
    )

    # Fields to show in the add user form
    add_fieldsets = (
        (None, {
            'classes': ('wide',),
            'fields': ('mobile_number', 'first_name', 'last_name', 'email', 'company_name', 'is_staff', 'is_superuser'),
        }),
    )

    # Make 'created_at' read-only instead of editable
    readonly_fields = ('created_at',)

    # Search and ordering options
    search_fields = ('mobile_number', 'email', 'first_name', 'last_name')
    ordering = ('-created_at',)
    filter_horizontal = ('groups', 'user_permissions')


# Register the User model with the custom admin
admin.site.register(User, CustomUserAdmin)

admin.site.site_header = "Lorry Ledger Admin"
admin.site.site_title = "Lorry Ledger Admin Portal"
admin.site.index_title = "Welcome to Lorry Ledger Portal"
