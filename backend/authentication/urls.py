from django.urls import path
from .views import generate, validate, check_session, logout, verify

from rest_framework_simplejwt.views import (
    TokenObtainPairView,
    TokenRefreshView,
    TokenVerifyView,
)


urlpatterns = [

    path('generate/', generate, name='generate_otp'),
    path('validate/', validate, name='validate_otp'),
    path('refreshToken/', validate, name='refresh_token'),
    path('verify/', verify, name='verify_session'),
    path('logout/', logout, name='logout'),
    
]
