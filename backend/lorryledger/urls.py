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
    DriverDeleteView,
    TransactionListView,
    TransactionCreateView,
    TransactionUpdateView,
    TransactionDeleteView,
    TruckListView,
    TruckCreateView,
    TruckDetailView,
    TruckUpdateView,
    TruckDeleteView,
    ExpenseCreateView,
    ExpenseListView,
    ExpenseUpdateView,
    ExpenseDeleteView,
    PartyCreateView,
    PartyListView,
    PartyUpdateView,
    PartyDeleteView,
    SupplierCreateView,
    SupplierListView,
    SupplierUpdateView,
    SupplierDetailView,
    SupplierDeleteView,
    TripCreateView,
    TripListView,
    TripUpdateView,
    TripDeleteView,
    ConsginerCreateView,
    ConsignerListView,
    ConsgineeCreateView,
    ConsigneeListView,
    LRCreateView,
    LRListView,
    LRUpdateView,
    LRDeleteView
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


    #Transactions
    path('api/drivers/<int:driverId>/transactions', TransactionListView.as_view(), name='transaction_list'),
    path('api/drivers/<int:driverId>/transactions/create', TransactionCreateView.as_view(), name='transaction_create'),
    path('api/drivers/transactions/<int:id>/update', TransactionUpdateView.as_view(), name='transaction_update'),
    path('api/drivers/transactions/<int:id>/delete', TransactionDeleteView.as_view(), name='transaction_delete'),

    #Trucks
    path('api/trucks/', TruckListView.as_view(), name='truck_list'),
    path('api/trucks/create/', TruckCreateView.as_view(), name='truck_create'),
    path('api/trucks/<int:id>/', TruckDetailView.as_view(), name='truck_detail'),
    path('api/trucks/<int:id>/update/', TruckUpdateView.as_view(), name='truck_update'),
    path('api/trucks/<int:id>/delete/', TruckDeleteView.as_view(), name='truck_delete'),

    #Expenses
    path('api/trucks/<int:truckId>/expenses', ExpenseListView.as_view(), name='expense_list'),
    path('api/trucks/<int:truckId>/expenses/create', ExpenseCreateView.as_view(), name='expense_create'),
    path('api/trucks/expenses/<int:id>/update', ExpenseUpdateView.as_view(), name='expense_update'),
    path('api/trucks/expenses/<int:id>/delete', ExpenseDeleteView.as_view(), name='expense_delete'),

    #Parties
    path('api/parties/', PartyListView.as_view(), name='party_list'),
    path('api/parties/create/', PartyCreateView.as_view(), name='party_create'),
    path('api/parties/<int:id>/update/', PartyUpdateView.as_view(), name='party_update'),
    path('api/parties/<int:id>/delete/', PartyDeleteView.as_view(), name='party_delete'),

    #Suppliers
    path('api/suppliers/', SupplierListView.as_view(), name='supplier_list'),
    path('api/suppliers/create/', SupplierCreateView.as_view(), name='supplier_create'),
    path('api/suppliers/<int:id>/update/', SupplierUpdateView.as_view(), name='supplier_update'),
    path('api/suppliers/<int:id>/delete/', SupplierDeleteView.as_view(), name='supplier_delete'),

    #Trips
    path('api/trips/', TripListView.as_view(), name='trip_list'),
    path('api/trips/create/', TripCreateView.as_view(), name='trip_create'),
    path('api/trips/<int:id>/update/', TripUpdateView.as_view(), name='trip_update'),
    path('api/trips/<int:id>/delete/', TripDeleteView.as_view(), name='trip_delete'),

    #Consigner
    path('api/consigners/', ConsignerListView.as_view(), name='consigner_list'),
    path('api/consigners/create/', ConsginerCreateView.as_view(), name='consigner_create'),

    #Consignee
    path('api/consignees/', ConsigneeListView.as_view(), name='consignee_list'),
    path('api/consignees/create/', ConsgineeCreateView.as_view(), name='consignee_create'),

    #LR
    path('api/LR/', LRListView.as_view(), name='lr_list'),
    path('api/<int:tripId>/LR/', LRListView.as_view(), name='lr_list'),
    path('api/LR/create/', LRCreateView.as_view(), name='lr_create'),
    path('api/LR/<int:id>/update/', LRUpdateView.as_view(), name='LR_update'),
    path('api/LR/<int:id>/delete/', LRDeleteView.as_view(), name='lr_delete'),
]
