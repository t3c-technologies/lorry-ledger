from django.urls import path
from .views import generate, validate

urlpatterns = [
    path('generate/', generate, name='generate_otp'),
    path('validate/', validate, name='validate_otp'),
]
