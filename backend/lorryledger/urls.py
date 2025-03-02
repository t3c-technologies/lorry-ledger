"""
URL configuration for lorryledger project.

The `urlpatterns` list routes URLs to views. For more information please see:
    https://docs.djangoproject.com/en/5.1/topics/http/urls/
Examples:
Function views
    1. Add an import:  from my_app import views
    2. Add a URL to urlpatterns:  path('', views.home, name='home')
Class-based views
    1. Add an import:  from other_app.views import Home
    2. Add a URL to urlpatterns:  path('', Home.as_view(), name='home')
Including another URLconf
    1. Import the include() function: from django.urls import include, path
    2. Add a URL to urlpatterns:  path('blog/', include('blog.urls'))
"""
from django.contrib import admin
from django.urls import path, include
from .views import (
    DriverCreateView,
    DriverListView,
    DriverDetailView,
    DriverUpdateView,
    DriverDeleteView
)

urlpatterns = [
    path('admin/', admin.site.urls),
    path('api/auth/', include('authentication.urls')),
    
    # Drivers
    path('api/drivers/', DriverListView.as_view(), name='driver_list'),
    path('api/drivers/create/', DriverCreateView.as_view(), name='driver_create'),
    path('api/drivers/<int:id>/', DriverDetailView.as_view(), name='driver_detail'),
    path('api/drivers/<int:id>/update/', DriverUpdateView.as_view(), name='driver_update'),
    path('api/drivers/<int:id>/delete/', DriverDeleteView.as_view(), name='driver_delete'),
]
