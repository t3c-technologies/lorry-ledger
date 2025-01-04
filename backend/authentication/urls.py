from django.urls import path
from .views import generate, validate, check_session

urlpatterns = [
    path('generate/', generate, name='generate_otp'),
    path('validate/', validate, name='validate_otp'),
    path('checkSession/', check_session, name='check_session'),
]
