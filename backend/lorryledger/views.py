# drivers/views.py

from rest_framework import generics, status
import json
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated
from django.db.models import Q
from django.http import HttpResponse
from django.template.loader import render_to_string
from django.shortcuts import get_object_or_404
from rest_framework.decorators import api_view, permission_classes
from weasyprint import HTML

from .models import Driver, Transactions, Truck, Expense, Party, Supplier, Trip, Consigner, Consignee, LR, Invoice
from .serializers import DriverSerializer, TransactionsSerializer, TruckSerializer, ExpenseSerializer, PartySerializer, SupplierSerializer, TripSerializer, ConsignerSerializer, ConsigneeSerializer, LRSerializer, InvoiceSerializer
from common.pagination import CustomPagination  # Assuming we have this in place already


@api_view(['GET'])
def generate_lr_pdf(request, id):
    # Fetch LR Data
    lr = get_object_or_404(LR, pk=id)
    
    # Get related models
    trip = lr.tripId
    consigner = lr.consignerId
    consignee = lr.consigneeId
    driver = trip.driverId
    party = trip.partyId

    partyData = {
        "id": party.id,
        "name": party.partyName,
        "gstNumber": party.gstNumber,
        "mobileNumber": party.mobileNumber,
        "pan": party.pan,
        "companyName": party.companyName,
        "address": party.address,
        "state": party.state,
        "pincode": party.pincode,
    }
    
    # Calculate freight amount
    freight_amount = float(trip.ratePerUnit) * float(lr.numberOfPackages) if hasattr(trip, 'ratePerUnit') else float(trip.partyFreightAmount)
    
    # Calculate GST components - each at 6% of freight amount
    sgst_amount = round(freight_amount * 0.06, 2)
    cgst_amount = round(freight_amount * 0.06, 2)
    
    # IGST is calculated based on state comparison
    # If source state and destination state are different, IGST applies; otherwise it's 0
    if consigner.state != consignee.state:
        igst_amount = round(freight_amount * 0.12, 2)  # 12% IGST (combination of SGST + CGST)
        sgst_amount = 0
        sgstPercentage = 0
        cgst_amount = 0
        cgstPercentage = 0
        igstPercentage = 12
    else:
        igst_amount = 0
        igstPercentage  = 0
        sgstPercentage = 6
        cgstPercentage = 6
    
    # Calculate total amount
    total_amount = freight_amount + sgst_amount + cgst_amount + igst_amount

    if(trip.endKmsReading != "" and trip.startKmsReading != ""):
        totalDistance = float(trip.startKmsReading) - float(trip.endKmsReading)
    else:
        totalDistance = ""

    if(trip.settlementDate != ""):
        paymentTerms = trip.settlementPaymentMode
    else:
        paymentTerms = ""
    
    if lr.unit == "Tonnes":
        weight = float(lr.weight) * 1000
    elif lr.unit == "Quintal":
        weight = float(lr.weight) * 100
    else:
        weight = float(lr.weight)
    
    if trip.tripEndDate != None:
        endDate = trip.tripEndDate.strftime('%d-%m-%Y')
    else:
        endDate = ""
    
    driverData = {
        "id": driver.id,
        "name": driver.name,
        "phoneNumber": driver.phone_number,
        "licenseNumber": driver.license_number,
        "licenseExpDate": driver.license_expiry_date,
        "aadharNumber": driver.aadhar_number
    }
    
    # Get invoice details from trip routes
    invoice_data = {}
    route = {}
    # Check if trip has routes and handle as dictionary
    if hasattr(trip, 'routes') and trip.routes:
        # Find the route with matching LR number
        matching_route = None
        
        # Handle routes based on its type
        if isinstance(trip.routes, list):
            # If routes is a list of dictionaries
            for route in trip.routes:
                if isinstance(route, dict) and 'lrNumber' in route and route['lrNumber'] == id:
                    matching_route = route
                    break
        elif isinstance(trip.routes, dict):
            # If routes is a single dictionary or has route keys
            for route_key, route in trip.routes.items():
                if isinstance(route, dict) and 'lrNumber' in route and route['lrNumber'] == id:
                    matching_route = route
                    break
            
        route = matching_route
        
        # If we found a matching route with invoice number, fetch the invoice
        if matching_route and 'invoiceNumber' in matching_route and matching_route['invoiceNumber']:
            invoice_number = matching_route['invoiceNumber']
            try:
                # Assuming there's an Invoice model
                invoice = get_object_or_404(Invoice, pk=invoice_number)
                
                # Add invoice details to our data
                invoice_data = {
                    "invoiceNumber": invoice.invoiceNumber,
                    "invoiceDate": invoice.invoiceDate.strftime('%d-%m-%Y') if hasattr(invoice, 'invoiceDate') else "",
                    "invoiceAmount": invoice.amount if hasattr(invoice, 'amount') else "",
                    "invoiceStatus": invoice.status if hasattr(invoice, 'status') else "",
                    "paymentDueDate": invoice.dueDate.strftime('%d-%m-%Y') if hasattr(invoice, 'dueDate') else "",
                    # Add any other invoice fields you need
                }
            except:
                # Handle the case where invoice is not found
                pass

    
    # Format data for the template
    data = {
        "lrNumber": lr.lrNumber,
        "lrDate": lr.lrDate.strftime('%d-%m-%Y'),
        "freightPaidBy": lr.freightPaidBy,
        "materialCategory": lr.materialCategory,
        "noOfPackages": lr.numberOfPackages,
        "unit": lr.unit,
        "weight": lr.weight,
        "gstPaidBy": lr.freightPaidBy,  # Assuming GST is paid by the same entity
        "gstPercentage": lr.gstPercentage,
        
        # Trip information
        "freightAmount": freight_amount,
        "vehicle": trip.truckId.truckNo if hasattr(trip, 'truckId') and hasattr(trip.truckId, 'truckNo') else "",
        "vehicleType": trip.truckId.truckType,
        "from": trip.origin,
        "to": trip.destination,
        "startDate":trip.startDate.strftime('%d-%m-%Y'),
        "endDate": endDate,
        "distance": totalDistance,
        "paymentTerms": paymentTerms,
        "ratePerUnit": trip.ratePerUnit if hasattr(trip, 'ratePerUnit') else "",
        "partyBillingType": trip.partyBillingType,

        # Amount calculations
        "sgst": sgst_amount,
        "sgstPercentage": sgstPercentage,
        "cgst": cgst_amount,
        "cgstPercentage": cgstPercentage,
        "igst": igst_amount,
        "igstPercentage": igstPercentage,
        "totalAmount": total_amount,
        
        # Consigner information
        "consigner": {
            "name": consigner.name,
            "address": f"{consigner.addressLine1}, {consigner.addressLine2}",
            "state": consigner.state,
            "mobileNumber": consigner.mobileNumber,
            "gstNumber": consigner.gstNumber
        },
        
        # Consignee information
        "consignee": {
            "name": consignee.name,
            "address": f"{consignee.addressLine1}, {consignee.addressLine2}",
            "state": consignee.state,
            "pincode": consignee.pincode,
            "mobileNumber": consignee.mobileNumber
        },
        
        # Additional details
        "eWayBillNo": lr.eWayBillNo if hasattr(lr, 'eWayBillNo') else "",
        "invoiceNo": lr.invoiceNo if hasattr(lr, 'invoiceNo') else "",
        "invoiceValue": lr.invoiceValue if hasattr(lr, 'invoiceValue') else "",
        
        # Add invoice details to the main data dictionary
        "invoice": invoice_data,
        "driver": driverData,
        "party": partyData,
    }


    
    # Render template and generate PDF
    html_content = render_to_string('lr_template.html', {'data': data})
    pdf = HTML(string=html_content).write_pdf()
    
    # Return PDF response
    response = HttpResponse(pdf, content_type='application/pdf')
    response['Content-Disposition'] = f'inline; filename="LR_{id}.pdf"'
    return response


@api_view(['GET'])
def generate_invoice_pdf(request, id):
    # Fetch LR Data
    lr = get_object_or_404(Invoice, pk=id)
    
    # Get related models
    trip = lr.tripId
    consigner = lr.consignerId
    consignee = lr.consigneeId
    party = trip.partyId

    partyData = {
        "id": party.id,
        "name": party.partyName,
        "gstNumber": party.gstNumber,
        "mobileNumber": party.mobileNumber,
        "pan": party.pan,
        "companyName": party.companyName,
        "address": party.address,
        "state": party.state,
        "pincode": party.pincode,
    }
    
    # Calculate freight amount
    freight_amount = float(trip.ratePerUnit) * float(lr.numberOfPackages) if hasattr(trip, 'ratePerUnit') else float(trip.partyFreightAmount)
    
    # Calculate GST components - each at 6% of freight amount
    sgst_amount = round(freight_amount * 0.06, 2)
    cgst_amount = round(freight_amount * 0.06, 2)
    
    # IGST is calculated based on state comparison
    # If source state and destination state are different, IGST applies; otherwise it's 0
    if consigner.state != consignee.state:
        igst_amount = round(freight_amount * 0.12, 2)  # 12% IGST (combination of SGST + CGST)
        sgst_amount = 0
        sgstPercentage = 0
        cgst_amount = 0
        cgstPercentage = 0
        igstPercentage = 12
    else:
        igst_amount = 0
        igstPercentage  = 0
        sgstPercentage = 6
        cgstPercentage = 6
    
    # Calculate total amount
    total_amount = freight_amount + sgst_amount + cgst_amount + igst_amount

    if(trip.endKmsReading != "" and trip.startKmsReading != ""):
        totalDistance = float(trip.startKmsReading) - float(trip.endKmsReading)
    else:
        totalDistance = ""

    if(trip.settlementDate != ""):
        paymentTerms = trip.settlementPaymentMode
    else:
        paymentTerms = ""
    
    if lr.unit == "Tonnes":
        weight = float(lr.weight) * 1000
    elif lr.unit == "Quintal":
        weight = float(lr.weight) * 100
    else:
        weight = float(lr.weight)
    
    if trip.tripEndDate != None:
        endDate = trip.tripEndDate.strftime('%d-%m-%Y')
    else:
        endDate = ""
    
    # Get invoice details from trip routes
    lrData = {}
    route = {}
    # Check if trip has routes and handle as dictionary
    if hasattr(trip, 'routes') and trip.routes:
        # Find the route with matching LR number
        matching_route = None
        
        # Handle routes based on its type
        if isinstance(trip.routes, list):
            # If routes is a list of dictionaries
            for route in trip.routes:
                if isinstance(route, dict) and 'invoiceNumber' in route and route['invoiceNumber'] == id:
                    matching_route = route
                    break
        elif isinstance(trip.routes, dict):
            # If routes is a single dictionary or has route keys
            for route_key, route in trip.routes.items():
                if isinstance(route, dict) and 'invoiceNumber' in route and route['invoiceNumber'] == id:
                    matching_route = route
                    break
            
        route = matching_route
        
        # If we found a matching route with invoice number, fetch the invoice
        if matching_route and 'lrNumber' in matching_route and matching_route['lrNumber']:
            lrNumber = matching_route['lrNumber']
            try:
                # Assuming there's an Invoice model
                lr = get_object_or_404(Invoice, pk=lrNumber)
                
                # Add invoice details to our data
                lrData = {
                    "invoiceNumber": lr.lrNumber,
                    "invoiceDate": lr.lrDate.strftime('%d-%m-%Y') if hasattr(lr, 'invoiceDate') else "",
                    "invoiceAmount": lr.amount if hasattr(lr, 'amount') else "",
                    "invoiceStatus": lr.status if hasattr(lr, 'status') else "",
                    "paymentDueDate": lr.dueDate.strftime('%d-%m-%Y') if hasattr(lr, 'dueDate') else "",
                    # Add any other invoice fields you need
                }
            except:
                # Handle the case where invoice is not found
                pass

    
    # Format data for the template
    data = {
        "invoiceNumber": lr.invoiceNumber,
        "invoiceDate": lr.invoiceDate.strftime('%d-%m-%Y'),
        "freightPaidBy": lr.freightPaidBy,
        "materialCategory": lr.materialCategory,
        "noOfPackages": lr.numberOfPackages,
        "unit": lr.unit,
        "weight": lr.weight,
        "gstPaidBy": lr.freightPaidBy,  # Assuming GST is paid by the same entity
        "gstPercentage": lr.gstPercentage,
        
        # Trip information
        "freightAmount": freight_amount,
        "vehicle": trip.truckId.truckNo if hasattr(trip, 'truckId') and hasattr(trip.truckId, 'truckNo') else "",
        "vehicleType": trip.truckId.truckType,
        "from": trip.origin,
        "to": trip.destination,
        "startDate":trip.startDate.strftime('%d-%m-%Y'),
        "endDate": endDate,
        "distance": totalDistance,
        "paymentTerms": paymentTerms,
        "ratePerUnit": trip.ratePerUnit if hasattr(trip, 'ratePerUnit') else "",

        # Amount calculations
        "sgst": sgst_amount,
        "sgstPercentage": sgstPercentage,
        "cgst": cgst_amount,
        "cgstPercentage": cgstPercentage,
        "igst": igst_amount,
        "igstPercentage": igstPercentage,
        "totalAmount": total_amount,
        
        # Consigner information
        "consigner": {
            "name": consigner.name,
            "address": f"{consigner.addressLine1}, {consigner.addressLine2}",
            "state": consigner.state,
            "mobileNumber": consigner.mobileNumber,
            "gstNumber": consigner.gstNumber
        },
        
        # Consignee information
        "consignee": {
            "name": consignee.name,
            "address": f"{consignee.addressLine1}, {consignee.addressLine2}",
            "state": consignee.state,
            "pincode": consignee.pincode,
            "mobileNumber": consignee.mobileNumber
        },
        
        # Additional details
        "eWayBillNo": lr.eWayBillNo if hasattr(lr, 'eWayBillNo') else "",
        "invoiceNo": lr.invoiceNo if hasattr(lr, 'invoiceNo') else "",
        "invoiceValue": lr.invoiceValue if hasattr(lr, 'invoiceValue') else "",
        
        # Add invoice details to the main data dictionary
        "lr": lrData,
        "party": partyData,
    }

    #return Response(data)
    
    # Render template and generate PDF
    html_content = render_to_string('invoice_template.html', {'data': data})
    pdf = HTML(string=html_content).write_pdf()
    
    # Return PDF response
    response = HttpResponse(pdf, content_type='application/pdf')
    response['Content-Disposition'] = f'inline; filename="Invoice_{id}.pdf"'
    return response

# CREATE
class DriverCreateView(generics.CreateAPIView):
    permission_classes = [IsAuthenticated]
    queryset = Driver.objects.all()
    serializer_class = DriverSerializer

    def create(self, request, *args, **kwargs):
        serializer = self.get_serializer(data=request.data)
        if serializer.is_valid():
            instance = serializer.save()
            return Response({
                "status": "success",
                "message": "Driver created successfully",
                "data": serializer.data
            }, status=status.HTTP_201_CREATED)
        return Response({
            "status": "error",
            "message": "Invalid data",
            "errors": serializer.errors
        }, status=status.HTTP_400_BAD_REQUEST)


# LIST (Paginated)
class DriverListView(generics.ListAPIView):

    queryset = Driver.objects.all().order_by('name')
    serializer_class = DriverSerializer
    pagination_class = CustomPagination

    def get_queryset(self):
        queryset = Driver.objects.all().order_by('name')
        
        # Get filters from query params
        filters_json = self.request.query_params.get('filters', '[]')

        try:
            # Parse JSON string into Python list
            filters = json.loads(filters_json)

            if filters:
                main_query = Q()
                
                # Group filters by key
                grouped_filters = {}
                for f in filters:
                    for key, value in f.items():
                        if key not in grouped_filters:
                            grouped_filters[key] = []
                        grouped_filters[key].append(value)
                
                # OR filtering within same key
                for key, values in grouped_filters.items():
                    key_query = Q()
                    for value in values:
                        key_query |= Q(**{key: value})
                    main_query &= key_query

                queryset = queryset.filter(main_query)

        except json.JSONDecodeError:
            pass
        
        return queryset

    def list(self, request, *args, **kwargs):
        response = super().list(request, *args, **kwargs)

        if isinstance(response.data, dict):  # Pagination applied
            return Response({
                "status": "success",
                "message": "Drivers retrieved successfully",
                "count": response.data.get("count", len(response.data.get("results", []))),
                "total_pages": response.data.get("total_pages", 1),
                "next": response.data.get("next"),
                "previous": response.data.get("previous"),
                "data": response.data.get("results", [])
            }, status=status.HTTP_200_OK)

        return Response({
            "status": "success",
            "message": "Drivers retrieved successfully",
            "count": len(response.data),
            "data": response.data
        }, status=status.HTTP_200_OK)


# RETRIEVE (Single driver by ID)
class DriverDetailView(generics.RetrieveAPIView):
    permission_classes = [IsAuthenticated]
    queryset = Driver.objects.all()
    serializer_class = DriverSerializer
    lookup_field = 'id'

    def retrieve(self, request, *args, **kwargs):
        try:
            instance = self.get_object()
            serializer = self.get_serializer(instance)
            return Response({
                "status": "success",
                "message": "Driver retrieved successfully",
                "data": serializer.data
            }, status=status.HTTP_200_OK)
        except:
            return Response({
                "status": "error",
                "message": "No driver found with the given ID"
            }, status=status.HTTP_404_NOT_FOUND)


# UPDATE
class DriverUpdateView(generics.UpdateAPIView):
    permission_classes = [IsAuthenticated]
    queryset = Driver.objects.all()
    serializer_class = DriverSerializer
    lookup_field = 'id'

    def update(self, request, *args, **kwargs):
        try:
            instance = self.get_object()
            serializer = self.get_serializer(instance, data=request.data, partial=True)
            if serializer.is_valid():
                serializer.save()
                return Response({
                    "status": "success",
                    "message": "Driver updated successfully",
                    "data": serializer.data
                }, status=status.HTTP_200_OK)
            return Response({
                "status": "error",
                "message": "Invalid data",
                "errors": serializer.errors
            }, status=status.HTTP_400_BAD_REQUEST)
        except:
            return Response({
                "status": "error",
                "message": "No driver found with the given ID"
            }, status=status.HTTP_404_NOT_FOUND)


# DELETE
class DriverDeleteView(generics.DestroyAPIView):
    permission_classes = [IsAuthenticated]
    queryset = Driver.objects.all()
    serializer_class = DriverSerializer
    lookup_field = 'id'

    def destroy(self, request, *args, **kwargs):
        try:
            instance = self.get_object()
            self.perform_destroy(instance)
            return Response({
                "status": "success",
                "message": "Driver deleted successfully"
            }, status=status.HTTP_200_OK)
        except:
            return Response({
                "status": "error",
                "message": "No driver found with the given ID"
            }, status=status.HTTP_404_NOT_FOUND)


# CREATE
class TransactionCreateView(generics.CreateAPIView):
    permission_classes = [IsAuthenticated]
    queryset = Transactions.objects.all()
    serializer_class = TransactionsSerializer

    def create(self, request, *args, **kwargs):
        serializer = self.get_serializer(data=request.data)
        if serializer.is_valid():
            instance = serializer.save()
            return Response({
                "status": "success",
                "message": "Transaction created successfully",
                "data": serializer.data
            }, status=status.HTTP_201_CREATED)
        return Response({
            "status": "error",
            "message": "Invalid data",
            "errors": serializer.errors
        }, status=status.HTTP_400_BAD_REQUEST)
    

# LIST (Paginated)
class TransactionListView(generics.ListAPIView):
    permission_classes = [IsAuthenticated]
    serializer_class = TransactionsSerializer
    pagination_class = CustomPagination
    lookup_field = 'driverId'

    def get_queryset(self):
        driver_id = self.kwargs.get('driverId')  # Get from URL parameter
        return Transactions.objects.filter(driverId=driver_id) if driver_id else Transactions.objects.all()

    def list(self, request, *args, **kwargs):
        response = super().list(request, *args, **kwargs)

        if isinstance(response.data, dict):
            return Response({
                "status": "success",
                "message": "Transactions retrieved successfully",
                "count": response.data.get("count", len(response.data.get("results", []))),
                "total_pages": response.data.get("total_pages", 1),
                "next": response.data.get("next"),
                "previous": response.data.get("previous"),
                "data": response.data.get("results", [])
            }, status=status.HTTP_200_OK)

        return Response({
            "status": "success",
            "message": "Transactions retrieved successfully",
            "count": len(response.data),
            "data": response.data
        }, status=status.HTTP_200_OK)
    

# UPDATE
class TransactionUpdateView(generics.UpdateAPIView):
    permission_classes = [IsAuthenticated]
    queryset = Transactions.objects.all()
    serializer_class = TransactionsSerializer
    lookup_field = 'id'

    def update(self, request, *args, **kwargs):
        try:
            instance = self.get_object()
            serializer = self.get_serializer(instance, data=request.data, partial=True)
            if serializer.is_valid():
                serializer.save()
                return Response({
                    "status": "success",
                    "message": "Transaction updated successfully",
                    "data": serializer.data
                }, status=status.HTTP_200_OK)
            return Response({
                "status": "error",
                "message": "Invalid data",
                "errors": serializer.errors
            }, status=status.HTTP_400_BAD_REQUEST)
        except:
            return Response({
                "status": "error",
                "message": "No Transaction found with the given ID"
            }, status=status.HTTP_404_NOT_FOUND)
        
# DELETE
class TransactionDeleteView(generics.DestroyAPIView):
    permission_classes = [IsAuthenticated]
    queryset = Transactions.objects.all()
    serializer_class = TransactionsSerializer
    lookup_field = 'id'

    def destroy(self, request, *args, **kwargs):
        try:
            instance = self.get_object()
            self.perform_destroy(instance)
            return Response({
                "status": "success",
                "message": "Transaction deleted successfully"
            }, status=status.HTTP_200_OK)
        except:
            return Response({
                "status": "error",
                "message": "No Transaction found with the given ID"
            }, status=status.HTTP_404_NOT_FOUND)


# CREATE
class TruckCreateView(generics.CreateAPIView):
    #permission_classes = [IsAuthenticated]
    queryset = Truck.objects.all()
    serializer_class = TruckSerializer

    def create(self, request, *args, **kwargs):
        serializer = self.get_serializer(data=request.data)
        if serializer.is_valid():
            instance = serializer.save()
            return Response({
                "status": "success",
                "message": "Truck created successfully",
                "data": serializer.data
            }, status=status.HTTP_201_CREATED)
        return Response({
            "status": "error",
            "message": "Invalid data",
            "errors": serializer.errors
        }, status=status.HTTP_400_BAD_REQUEST)

#LIST (Paginated)
class TruckListView(generics.ListAPIView):

    queryset = Truck.objects.all().order_by('truckNo')
    serializer_class = TruckSerializer
    pagination_class = CustomPagination

    def get_queryset(self):
        queryset = Truck.objects.all().order_by('truckNo')
        
        # Get filters from query params
        search_query = self.request.query_params.get('search', '')
        filters_json = self.request.query_params.get('filters', '[]')
        sorting_json = self.request.query_params.get("sorting", "{}")

        if search_query:
            queryset = queryset.filter(
                Q(truckNo__icontains=search_query) |  # Example: Search in truck number
                Q(truckType__icontains=search_query)  # Example: Search in truck type
            )

        try:
            # Parse JSON string into Python list
            filters = json.loads(filters_json)

            if filters:
                main_query = Q()
                
                # Group filters by key
                grouped_filters = {}
                for f in filters:
                    for key, value in f.items():
                        if key not in grouped_filters:
                            grouped_filters[key] = []
                        grouped_filters[key].append(value)
                
                # OR filtering within same key
                for key, values in grouped_filters.items():
                    key_query = Q()
                    for value in values:
                        key_query |= Q(**{key: value})
                    main_query &= key_query

                queryset = queryset.filter(main_query)

        except json.JSONDecodeError:
            pass

        try:
            # Parse sorting
            sorting = json.loads(sorting_json)
            sort_key = sorting.get("key")
            sort_direction = sorting.get("direction", "ascending")

            if sort_key and hasattr(Truck, sort_key):
                if sort_direction == "descending":
                    sort_key = f"-{sort_key}"
                queryset = queryset.order_by(sort_key)

        except json.JSONDecodeError:
            pass
        
        return queryset

    def list(self, request, *args, **kwargs):
        response = super().list(request, *args, **kwargs)

        total_items = self.paginator.page.paginator.count  # Get total items
        page_size = self.paginator.get_page_size(request)  # Get current page size
        total_pages = (total_items + page_size - 1) // page_size 

        if isinstance(response.data, dict):  # Pagination applied
            return Response({
                "status": "success",
                "message": "Trucks retrieved successfully",
                "count": response.data.get("count", len(response.data.get("results", []))),
                "total_pages": total_pages,
                "next": response.data.get("next"),
                "previous": response.data.get("previous"),
                "data": response.data.get("results", [])
            }, status=status.HTTP_200_OK)

        return Response({
            "status": "success",
            "message": "Trucks retrieved successfully",
            "count": len(response.data),
            "data": response.data
        }, status=status.HTTP_200_OK)
    
# RETRIEVE (Single driver by ID)
class TruckDetailView(generics.RetrieveAPIView):
    queryset = Truck.objects.all()
    serializer_class = TruckSerializer
    lookup_field = 'id'

    def retrieve(self, request, *args, **kwargs):
        try:
            instance = self.get_object()
            serializer = self.get_serializer(instance)
            return Response({
                "status": "success",
                "message": "Truck retrieved successfully",
                "data": serializer.data
            }, status=status.HTTP_200_OK)
        except:
            return Response({
                "status": "error",
                "message": "No Truck found with the given ID"
            }, status=status.HTTP_404_NOT_FOUND)
    
#UPDATE
class TruckUpdateView(generics.UpdateAPIView):
    queryset = Truck.objects.all()
    serializer_class = TruckSerializer
    lookup_field = 'id'

    def update(self, request, *args, **kwargs):
        try:
            instance = self.get_object()
            serializer = self.get_serializer(instance, data=request.data, partial=True)
            if serializer.is_valid():
                serializer.save()
                return Response({
                    "status": "success",
                    "message": "Truck updated successfully",
                    "data": serializer.data
                }, status=status.HTTP_200_OK)
            return Response({
                "status": "error",
                "message": "Invalid data",
                "errors": serializer.errors
            }, status=status.HTTP_400_BAD_REQUEST)
        except:
            return Response({
                "status": "error",
                "message": "No Truck found with the given ID"
            }, status=status.HTTP_404_NOT_FOUND)
        
# DELETE
class TruckDeleteView(generics.DestroyAPIView):
    queryset = Truck.objects.all()
    serializer_class = TruckSerializer
    lookup_field = 'id'

    def destroy(self, request, *args, **kwargs):
        try:
            instance = self.get_object()
            self.perform_destroy(instance)
            return Response({
                "status": "success",
                "message": "Truck deleted successfully"
            }, status=status.HTTP_200_OK)
        except:
            return Response({
                "status": "error",
                "message": "No Truck found with the given ID"
            }, status=status.HTTP_404_NOT_FOUND)
        

# CREATE
class ExpenseCreateView(generics.CreateAPIView):
    #permission_classes = [IsAuthenticated]
    queryset = Expense.objects.all()
    serializer_class = ExpenseSerializer

    def create(self, request, *args, **kwargs):
        serializer = self.get_serializer(data=request.data)
        if serializer.is_valid():
            instance = serializer.save()
            return Response({
                "status": "success",
                "message": "Expense created successfully",
                "data": serializer.data
            }, status=status.HTTP_201_CREATED)
        return Response({
            "status": "error",
            "message": "Invalid data",
            "errors": serializer.errors
        }, status=status.HTTP_400_BAD_REQUEST)
        
# LIST (Paginated)
class ExpenseListView(generics.ListAPIView):
    #permission_classes = [IsAuthenticated]
    serializer_class = ExpenseSerializer
    pagination_class = CustomPagination
    lookup_field = 'truckId'

    def get_queryset(self):
        truckId = self.kwargs.get('truckId')  # Get from URL parameter
        return Expense.objects.filter(truckId=truckId) if truckId else Expense.objects.all()

    def list(self, request, *args, **kwargs):
        response = super().list(request, *args, **kwargs)

        if isinstance(response.data, dict):
            return Response({
                "status": "success",
                "message": "Expenses retrieved successfully",
                "count": response.data.get("count", len(response.data.get("results", []))),
                "total_pages": response.data.get("total_pages", 1),
                "next": response.data.get("next"),
                "previous": response.data.get("previous"),
                "data": response.data.get("results", [])
            }, status=status.HTTP_200_OK)

        return Response({
            "status": "success",
            "message": "Expenses retrieved successfully",
            "count": len(response.data),
            "data": response.data
        }, status=status.HTTP_200_OK)
    
# UPDATE
class ExpenseUpdateView(generics.UpdateAPIView):
    #permission_classes = [IsAuthenticated]
    queryset = Expense.objects.all()
    serializer_class = ExpenseSerializer
    lookup_field = 'id'

    def update(self, request, *args, **kwargs):
        try:
            instance = self.get_object()
            serializer = self.get_serializer(instance, data=request.data, partial=True)
            if serializer.is_valid():
                serializer.save()
                return Response({
                    "status": "success",
                    "message": "Expense updated successfully",
                    "data": serializer.data
                }, status=status.HTTP_200_OK)
            return Response({
                "status": "error",
                "message": "Invalid data",
                "errors": serializer.errors
            }, status=status.HTTP_400_BAD_REQUEST)
        except:
            return Response({
                "status": "error",
                "message": "No Expense found with the given ID"
            }, status=status.HTTP_404_NOT_FOUND)
        
# DELETE
class ExpenseDeleteView(generics.DestroyAPIView):
    #permission_classes = [IsAuthenticated]
    queryset = Expense.objects.all()
    serializer_class = ExpenseSerializer
    lookup_field = 'id'

    def destroy(self, request, *args, **kwargs):
        try:
            instance = self.get_object()
            self.perform_destroy(instance)
            return Response({
                "status": "success",
                "message": "Expense deleted successfully"
            }, status=status.HTTP_200_OK)
        except:
            return Response({
                "status": "error",
                "message": "No Expense found with the given ID"
            }, status=status.HTTP_404_NOT_FOUND)
        
# CREATE
class PartyCreateView(generics.CreateAPIView):
    #permission_classes = [IsAuthenticated]
    queryset = Party.objects.all()
    serializer_class = PartySerializer

    def create(self, request, *args, **kwargs):
        serializer = self.get_serializer(data=request.data)
        if serializer.is_valid():
            instance = serializer.save()
            return Response({
                "status": "success",
                "message": "Party created successfully",
                "data": serializer.data
            }, status=status.HTTP_201_CREATED)
        return Response({
            "status": "error",
            "message": "Invalid data",
            "errors": serializer.errors
        }, status=status.HTTP_400_BAD_REQUEST)

#LIST (Paginated)
class PartyListView(generics.ListAPIView):

    queryset = Party.objects.all().order_by('partyName')
    serializer_class = PartySerializer
    pagination_class = CustomPagination

    def get_queryset(self):
        queryset = Party.objects.all().order_by('partyName')
        
        # Get filters from query params
        search_query = self.request.query_params.get('search', '')
        filters_json = self.request.query_params.get('filters', '[]')
        sorting_json = self.request.query_params.get("sorting", "{}")

        if search_query:
            queryset = queryset.filter(
                Q(partyName__icontains=search_query) |  # Example: Search in truck number
                Q(openingBalance__icontains=search_query)  # Example: Search in truck type
            )

        try:
            # Parse JSON string into Python list
            filters = json.loads(filters_json)

            if filters:
                main_query = Q()
                
                # Group filters by key
                grouped_filters = {}
                for f in filters:
                    for key, value in f.items():
                        if key not in grouped_filters:
                            grouped_filters[key] = []
                        grouped_filters[key].append(value)
                
                # OR filtering within same key
                for key, values in grouped_filters.items():
                    key_query = Q()
                    for value in values:
                        key_query |= Q(**{key: value})
                    main_query &= key_query

                queryset = queryset.filter(main_query)

        except json.JSONDecodeError:
            pass

        try:
            # Parse sorting
            sorting = json.loads(sorting_json)
            sort_key = sorting.get("key")
            sort_direction = sorting.get("direction", "ascending")

            if sort_key and hasattr(Party, sort_key):
                if sort_direction == "descending":
                    sort_key = f"-{sort_key}"
                queryset = queryset.order_by(sort_key)

        except json.JSONDecodeError:
            pass
        
        return queryset

    def list(self, request, *args, **kwargs):
        response = super().list(request, *args, **kwargs)

        total_items = self.paginator.page.paginator.count  # Get total items
        page_size = self.paginator.get_page_size(request)  # Get current page size
        total_pages = (total_items + page_size - 1) // page_size 

        if isinstance(response.data, dict):  # Pagination applied
            return Response({
                "status": "success",
                "message": "Party retrieved successfully",
                "count": response.data.get("count", len(response.data.get("results", []))),
                "total_pages": total_pages,
                "next": response.data.get("next"),
                "previous": response.data.get("previous"),
                "data": response.data.get("results", [])
            }, status=status.HTTP_200_OK)

        return Response({
            "status": "success",
            "message": "Party retrieved successfully",
            "count": len(response.data),
            "data": response.data
        }, status=status.HTTP_200_OK)
    
# RETRIEVE (Single driver by ID)
class PartyDetailView(generics.RetrieveAPIView):
    queryset = Party.objects.all()
    serializer_class = PartySerializer
    lookup_field = 'id'

    def retrieve(self, request, *args, **kwargs):
        try:
            instance = self.get_object()
            serializer = self.get_serializer(instance)
            return Response({
                "status": "success",
                "message": "Party retrieved successfully",
                "data": serializer.data
            }, status=status.HTTP_200_OK)
        except:
            return Response({
                "status": "error",
                "message": "No Party found with the given ID"
            }, status=status.HTTP_404_NOT_FOUND)
    
#UPDATE
class PartyUpdateView(generics.UpdateAPIView):
    queryset = Party.objects.all()
    serializer_class = PartySerializer
    lookup_field = 'id'

    def update(self, request, *args, **kwargs):
        try:
            instance = self.get_object()
            serializer = self.get_serializer(instance, data=request.data, partial=True)
            if serializer.is_valid():
                serializer.save()
                return Response({
                    "status": "success",
                    "message": "Party updated successfully",
                    "data": serializer.data
                }, status=status.HTTP_200_OK)
            return Response({
                "status": "error",
                "message": "Invalid data",
                "errors": serializer.errors
            }, status=status.HTTP_400_BAD_REQUEST)
        except:
            return Response({
                "status": "error",
                "message": "No Party found with the given ID"
            }, status=status.HTTP_404_NOT_FOUND)
        
# DELETE
class PartyDeleteView(generics.DestroyAPIView):
    queryset = Party.objects.all()
    serializer_class = PartySerializer
    lookup_field = 'id'

    def destroy(self, request, *args, **kwargs):
        try:
            instance = self.get_object()
            self.perform_destroy(instance)
            return Response({
                "status": "success",
                "message": "Party deleted successfully"
            }, status=status.HTTP_200_OK)
        except:
            return Response({
                "status": "error",
                "message": "No Party found with the given ID"
            }, status=status.HTTP_404_NOT_FOUND)
        
# CREATE
class SupplierCreateView(generics.CreateAPIView):
    #permission_classes = [IsAuthenticated]
    queryset = Supplier.objects.all()
    serializer_class = SupplierSerializer

    def create(self, request, *args, **kwargs):
        serializer = self.get_serializer(data=request.data)
        if serializer.is_valid():
            instance = serializer.save()
            return Response({
                "status": "success",
                "message": "Supplier created successfully",
                "data": serializer.data
            }, status=status.HTTP_201_CREATED)
        return Response({
            "status": "error",
            "message": "Invalid data",
            "errors": serializer.errors
        }, status=status.HTTP_400_BAD_REQUEST)

#LIST (Paginated)
class SupplierListView(generics.ListAPIView):

    queryset = Supplier.objects.all().order_by('supplierName')
    serializer_class = SupplierSerializer
    pagination_class = CustomPagination

    def get_queryset(self):
        queryset = Supplier.objects.all().order_by('supplierName')
        
        # Get filters from query params
        search_query = self.request.query_params.get('search', '')
        filters_json = self.request.query_params.get('filters', '[]')
        sorting_json = self.request.query_params.get("sorting", "{}")

        if search_query:
            queryset = queryset.filter(
                Q(supplierName__icontains=search_query) |  # Example: Search in truck number
                Q(mobileNumber__icontains=search_query)  # Example: Search in truck type
            )

        try:
            # Parse JSON string into Python list
            filters = json.loads(filters_json)

            if filters:
                main_query = Q()
                
                # Group filters by key
                grouped_filters = {}
                for f in filters:
                    for key, value in f.items():
                        if key not in grouped_filters:
                            grouped_filters[key] = []
                        grouped_filters[key].append(value)
                
                # OR filtering within same key
                for key, values in grouped_filters.items():
                    key_query = Q()
                    for value in values:
                        key_query |= Q(**{key: value})
                    main_query &= key_query

                queryset = queryset.filter(main_query)

        except json.JSONDecodeError:
            pass

        try:
            # Parse sorting
            sorting = json.loads(sorting_json)
            sort_key = sorting.get("key")
            sort_direction = sorting.get("direction", "ascending")

            if sort_key and hasattr(Supplier, sort_key):
                if sort_direction == "descending":
                    sort_key = f"-{sort_key}"
                queryset = queryset.order_by(sort_key)

        except json.JSONDecodeError:
            pass
        
        return queryset

    def list(self, request, *args, **kwargs):
        response = super().list(request, *args, **kwargs)

        total_items = self.paginator.page.paginator.count  # Get total items
        page_size = self.paginator.get_page_size(request)  # Get current page size
        total_pages = (total_items + page_size - 1) // page_size 

        if isinstance(response.data, dict):  # Pagination applied
            return Response({
                "status": "success",
                "message": "Supplier retrieved successfully",
                "count": response.data.get("count", len(response.data.get("results", []))),
                "total_pages": total_pages,
                "next": response.data.get("next"),
                "previous": response.data.get("previous"),
                "data": response.data.get("results", [])
            }, status=status.HTTP_200_OK)

        return Response({
            "status": "success",
            "message": "Supplier retrieved successfully",
            "count": len(response.data),
            "data": response.data
        }, status=status.HTTP_200_OK)
    
# RETRIEVE (Single driver by ID)
class SupplierDetailView(generics.RetrieveAPIView):
    queryset = Supplier.objects.all()
    serializer_class = SupplierSerializer
    lookup_field = 'id'

    def retrieve(self, request, *args, **kwargs):
        try:
            instance = self.get_object()
            serializer = self.get_serializer(instance)
            return Response({
                "status": "success",
                "message": "Supplier retrieved successfully",
                "data": serializer.data
            }, status=status.HTTP_200_OK)
        except:
            return Response({
                "status": "error",
                "message": "No Supplier found with the given ID"
            }, status=status.HTTP_404_NOT_FOUND)
    
#UPDATE
class SupplierUpdateView(generics.UpdateAPIView):
    queryset = Supplier.objects.all()
    serializer_class = SupplierSerializer
    lookup_field = 'id'

    def update(self, request, *args, **kwargs):
        try:
            instance = self.get_object()
            serializer = self.get_serializer(instance, data=request.data, partial=True)
            if serializer.is_valid():
                serializer.save()
                return Response({
                    "status": "success",
                    "message": "Supplier updated successfully",
                    "data": serializer.data
                }, status=status.HTTP_200_OK)
            return Response({
                "status": "error",
                "message": "Invalid data",
                "errors": serializer.errors
            }, status=status.HTTP_400_BAD_REQUEST)
        except:
            return Response({
                "status": "error",
                "message": "No Supplier found with the given ID"
            }, status=status.HTTP_404_NOT_FOUND)
        
# DELETE
class SupplierDeleteView(generics.DestroyAPIView):
    queryset = Supplier.objects.all()
    serializer_class = SupplierSerializer
    lookup_field = 'id'

    def destroy(self, request, *args, **kwargs):
        try:
            instance = self.get_object()
            self.perform_destroy(instance)
            return Response({
                "status": "success",
                "message": "Supplier deleted successfully"
            }, status=status.HTTP_200_OK)
        except:
            return Response({
                "status": "error",
                "message": "No Supplier found with the given ID"
            }, status=status.HTTP_404_NOT_FOUND)
        
# CREATE
class TripCreateView(generics.CreateAPIView):
    #permission_classes = [IsAuthenticated]
    queryset = Trip.objects.all()
    serializer_class = TripSerializer

    def create(self, request, *args, **kwargs):
        serializer = self.get_serializer(data=request.data)
        if serializer.is_valid():
            instance = serializer.save()
            return Response({
                "status": "success",
                "message": "Trip created successfully",
                "data": serializer.data
            }, status=status.HTTP_201_CREATED)
        return Response({
            "status": "error",
            "message": "Invalid data",
            "errors": serializer.errors
        }, status=status.HTTP_400_BAD_REQUEST)

#LIST (Paginated)
class TripListView(generics.ListAPIView):

    queryset = Trip.objects.all()
    serializer_class = TripSerializer
    pagination_class = CustomPagination

    def get_queryset(self):
        queryset = Trip.objects.all()
        
        # Get filters from query params
        search_query = self.request.query_params.get('search', '')
        filters_json = self.request.query_params.get('filters', '[]')
        sorting_json = self.request.query_params.get("sorting", "{}")

        if search_query:
            queryset = queryset.filter(
                Q(origin__icontains=search_query) |  # Example: Search in truck number
                Q(destination__icontains=search_query)  # Example: Search in truck type
            )

        try:
            # Parse JSON string into Python list
            filters = json.loads(filters_json)

            if filters:
                main_query = Q()
                
                # Group filters by key
                grouped_filters = {}
                for f in filters:
                    for key, value in f.items():
                        if key not in grouped_filters:
                            grouped_filters[key] = []
                        grouped_filters[key].append(value)
                
                # OR filtering within same key
                for key, values in grouped_filters.items():
                    key_query = Q()
                    for value in values:
                        key_query |= Q(**{key: value})
                    main_query &= key_query

                queryset = queryset.filter(main_query)

        except json.JSONDecodeError:
            pass

        try:
            # Parse sorting
            sorting = json.loads(sorting_json)
            sort_key = sorting.get("key")
            sort_direction = sorting.get("direction", "ascending")

            if sort_key and hasattr(Trip, sort_key):
                if sort_direction == "descending":
                    sort_key = f"-{sort_key}"
                queryset = queryset.order_by(sort_key)

        except json.JSONDecodeError:
            pass
        
        return queryset

    def list(self, request, *args, **kwargs):
        response = super().list(request, *args, **kwargs)

        total_items = self.paginator.page.paginator.count  # Get total items
        page_size = self.paginator.get_page_size(request)  # Get current page size
        total_pages = (total_items + page_size - 1) // page_size 

        if isinstance(response.data, dict):  # Pagination applied
            return Response({
                "status": "success",
                "message": "Trip retrieved successfully",
                "count": response.data.get("count", len(response.data.get("results", []))),
                "total_pages": total_pages,
                "next": response.data.get("next"),
                "previous": response.data.get("previous"),
                "data": response.data.get("results", [])
            }, status=status.HTTP_200_OK)

        return Response({
            "status": "success",
            "message": "Trip retrieved successfully",
            "count": len(response.data),
            "data": response.data
        }, status=status.HTTP_200_OK)

#UPDATE
class TripUpdateView(generics.UpdateAPIView):
    queryset = Trip.objects.all()
    serializer_class = TripSerializer
    lookup_field = 'id'

    def update(self, request, *args, **kwargs):
        try:
            instance = self.get_object()
            serializer = self.get_serializer(instance, data=request.data, partial=True)
            if serializer.is_valid():
                serializer.save()
                return Response({
                    "status": "success",
                    "message": "Trip updated successfully",
                    "data": serializer.data
                }, status=status.HTTP_200_OK)
            return Response({
                "status": "error",
                "message": "Invalid data",
                "errors": serializer.errors
            }, status=status.HTTP_400_BAD_REQUEST)
        except:
            return Response({
                "status": "error",
                "message": "No Trip found with the given ID"
            }, status=status.HTTP_404_NOT_FOUND)
        
# DELETE
class TripDeleteView(generics.DestroyAPIView):
    queryset = Trip.objects.all()
    serializer_class = TripSerializer
    lookup_field = 'id'

    def destroy(self, request, *args, **kwargs):
        try:
            instance = self.get_object()
            self.perform_destroy(instance)
            return Response({
                "status": "success",
                "message": "Trip deleted successfully"
            }, status=status.HTTP_200_OK)
        except:
            return Response({
                "status": "error",
                "message": "No Trip found with the given ID"
            }, status=status.HTTP_404_NOT_FOUND)
        
# CREATE
class ConsginerCreateView(generics.CreateAPIView):
    #permission_classes = [IsAuthenticated]
    queryset = Consigner.objects.all()
    serializer_class = ConsignerSerializer

    def create(self, request, *args, **kwargs):
        serializer = self.get_serializer(data=request.data)
        if serializer.is_valid():
            instance = serializer.save()
            return Response({
                "status": "success",
                "message": "Consigner created successfully",
                "data": serializer.data
            }, status=status.HTTP_201_CREATED)
        return Response({
            "status": "error",
            "message": "Invalid data",
            "errors": serializer.errors
        }, status=status.HTTP_400_BAD_REQUEST)

#LIST (Paginated)
class ConsignerListView(generics.ListAPIView):

    queryset = Consigner.objects.all()
    serializer_class = ConsignerSerializer
    pagination_class = CustomPagination

    def get_queryset(self):
        queryset = Consigner.objects.all()
        
        # Get filters from query params
        search_query = self.request.query_params.get('search', '')
        filters_json = self.request.query_params.get('filters', '[]')
        sorting_json = self.request.query_params.get("sorting", "{}")

        if search_query:
            queryset = queryset.filter(
                Q(gstNumber__icontains=search_query) |  # Example: Search in truck number
                Q(name__icontains=search_query)  # Example: Search in truck type
            )

        try:
            # Parse JSON string into Python list
            filters = json.loads(filters_json)

            if filters:
                main_query = Q()
                
                # Group filters by key
                grouped_filters = {}
                for f in filters:
                    for key, value in f.items():
                        if key not in grouped_filters:
                            grouped_filters[key] = []
                        grouped_filters[key].append(value)
                
                # OR filtering within same key
                for key, values in grouped_filters.items():
                    key_query = Q()
                    for value in values:
                        key_query |= Q(**{key: value})
                    main_query &= key_query

                queryset = queryset.filter(main_query)

        except json.JSONDecodeError:
            pass

        try:
            # Parse sorting
            sorting = json.loads(sorting_json)
            sort_key = sorting.get("key")
            sort_direction = sorting.get("direction", "ascending")

            if sort_key and hasattr(Consigner, sort_key):
                if sort_direction == "descending":
                    sort_key = f"-{sort_key}"
                queryset = queryset.order_by(sort_key)

        except json.JSONDecodeError:
            pass
        
        return queryset

    def list(self, request, *args, **kwargs):
        response = super().list(request, *args, **kwargs)

        total_items = self.paginator.page.paginator.count  # Get total items
        page_size = self.paginator.get_page_size(request)  # Get current page size
        total_pages = (total_items + page_size - 1) // page_size 

        if isinstance(response.data, dict):  # Pagination applied
            return Response({
                "status": "success",
                "message": "Consigners retrieved successfully",
                "count": response.data.get("count", len(response.data.get("results", []))),
                "total_pages": total_pages,
                "next": response.data.get("next"),
                "previous": response.data.get("previous"),
                "data": response.data.get("results", [])
            }, status=status.HTTP_200_OK)

        return Response({
            "status": "success",
            "message": "Consigners retrieved successfully",
            "count": len(response.data),
            "data": response.data
        }, status=status.HTTP_200_OK)
    
# CREATE
class ConsgineeCreateView(generics.CreateAPIView):
    #permission_classes = [IsAuthenticated]
    queryset = Consignee.objects.all()
    serializer_class = ConsigneeSerializer

    def create(self, request, *args, **kwargs):
        serializer = self.get_serializer(data=request.data)
        if serializer.is_valid():
            instance = serializer.save()
            return Response({
                "status": "success",
                "message": "Consignee created successfully",
                "data": serializer.data
            }, status=status.HTTP_201_CREATED)
        return Response({
            "status": "error",
            "message": "Invalid data",
            "errors": serializer.errors
        }, status=status.HTTP_400_BAD_REQUEST)

#LIST (Paginated)
class ConsigneeListView(generics.ListAPIView):

    queryset = Consignee.objects.all()
    serializer_class = ConsigneeSerializer
    pagination_class = CustomPagination

    def get_queryset(self):
        queryset = Consignee.objects.all()
        
        # Get filters from query params
        search_query = self.request.query_params.get('search', '')
        filters_json = self.request.query_params.get('filters', '[]')
        sorting_json = self.request.query_params.get("sorting", "{}")

        if search_query:
            queryset = queryset.filter(
                Q(gstNumber__icontains=search_query) |  # Example: Search in truck number
                Q(name__icontains=search_query)  # Example: Search in truck type
            )

        try:
            # Parse JSON string into Python list
            filters = json.loads(filters_json)

            if filters:
                main_query = Q()
                
                # Group filters by key
                grouped_filters = {}
                for f in filters:
                    for key, value in f.items():
                        if key not in grouped_filters:
                            grouped_filters[key] = []
                        grouped_filters[key].append(value)
                
                # OR filtering within same key
                for key, values in grouped_filters.items():
                    key_query = Q()
                    for value in values:
                        key_query |= Q(**{key: value})
                    main_query &= key_query

                queryset = queryset.filter(main_query)

        except json.JSONDecodeError:
            pass

        try:
            # Parse sorting
            sorting = json.loads(sorting_json)
            sort_key = sorting.get("key")
            sort_direction = sorting.get("direction", "ascending")

            if sort_key and hasattr(Consignee, sort_key):
                if sort_direction == "descending":
                    sort_key = f"-{sort_key}"
                queryset = queryset.order_by(sort_key)

        except json.JSONDecodeError:
            pass
        
        return queryset

    def list(self, request, *args, **kwargs):
        response = super().list(request, *args, **kwargs)

        total_items = self.paginator.page.paginator.count  # Get total items
        page_size = self.paginator.get_page_size(request)  # Get current page size
        total_pages = (total_items + page_size - 1) // page_size 

        if isinstance(response.data, dict):  # Pagination applied
            return Response({
                "status": "success",
                "message": "Consignees retrieved successfully",
                "count": response.data.get("count", len(response.data.get("results", []))),
                "total_pages": total_pages,
                "next": response.data.get("next"),
                "previous": response.data.get("previous"),
                "data": response.data.get("results", [])
            }, status=status.HTTP_200_OK)

        return Response({
            "status": "success",
            "message": "Consignees retrieved successfully",
            "count": len(response.data),
            "data": response.data
        }, status=status.HTTP_200_OK)
    
# CREATE
class LRCreateView(generics.CreateAPIView):
    #permission_classes = [IsAuthenticated]
    queryset = LR.objects.all()
    serializer_class = LRSerializer

    def create(self, request, *args, **kwargs):
        serializer = self.get_serializer(data=request.data)
        if serializer.is_valid():
            instance = serializer.save()
            return Response({
                "status": "success",
                "message": "LR created successfully",
                "data": serializer.data
            }, status=status.HTTP_201_CREATED)
        return Response({
            "status": "error",
            "message": "Invalid data",
            "errors": serializer.errors
        }, status=status.HTTP_400_BAD_REQUEST)

#LIST (Paginated)
class LRListView(generics.ListAPIView):

    queryset = LR.objects.all()
    serializer_class = LRSerializer
    pagination_class = CustomPagination

    def get_queryset(self):
        trip_id = self.kwargs.get('tripId')  # Get from URL parameter
        queryset = LR.objects.filter(tripId=trip_id) if trip_id else LR.objects.all()
        
        # Get filters from query params
        search_query = self.request.query_params.get('search', '')
        filters_json = self.request.query_params.get('filters', '[]')
        sorting_json = self.request.query_params.get("sorting", "{}")

        if search_query:
            queryset = queryset.filter(
                Q(lrNumber__icontains=search_query) |  # Example: Search in truck number
                Q(materialCategory__icontains=search_query)  # Example: Search in truck type
            )

        try:
            # Parse JSON string into Python list
            filters = json.loads(filters_json)

            if filters:
                main_query = Q()
                
                # Group filters by key
                grouped_filters = {}
                for f in filters:
                    for key, value in f.items():
                        if key not in grouped_filters:
                            grouped_filters[key] = []
                        grouped_filters[key].append(value)
                
                # OR filtering within same key
                for key, values in grouped_filters.items():
                    key_query = Q()
                    for value in values:
                        key_query |= Q(**{key: value})
                    main_query &= key_query

                queryset = queryset.filter(main_query)

        except json.JSONDecodeError:
            pass

        try:
            # Parse sorting
            sorting = json.loads(sorting_json)
            sort_key = sorting.get("key")
            sort_direction = sorting.get("direction", "ascending")

            if sort_key and hasattr(LR, sort_key):
                if sort_direction == "descending":
                    sort_key = f"-{sort_key}"
                queryset = queryset.order_by(sort_key)

        except json.JSONDecodeError:
            pass
        
        return queryset

    def list(self, request, *args, **kwargs):
        response = super().list(request, *args, **kwargs)

        total_items = self.paginator.page.paginator.count  # Get total items
        page_size = self.paginator.get_page_size(request)  # Get current page size
        total_pages = (total_items + page_size - 1) // page_size 

        if isinstance(response.data, dict):  # Pagination applied
            return Response({
                "status": "success",
                "message": "LRs retrieved successfully",
                "count": response.data.get("count", len(response.data.get("results", []))),
                "total_pages": total_pages,
                "next": response.data.get("next"),
                "previous": response.data.get("previous"),
                "data": response.data.get("results", [])
            }, status=status.HTTP_200_OK)

        return Response({
            "status": "success",
            "message": "LRs retrieved successfully",
            "count": len(response.data),
            "data": response.data
        }, status=status.HTTP_200_OK)


#UPDATE
class LRUpdateView(generics.UpdateAPIView):
    queryset = LR.objects.all()
    serializer_class = LRSerializer
    lookup_field = 'id'

    def update(self, request, *args, **kwargs):
        try:
            instance = self.get_object()
            serializer = self.get_serializer(instance, data=request.data, partial=True)
            if serializer.is_valid():
                serializer.save()
                return Response({
                    "status": "success",
                    "message": "LR updated successfully",
                    "data": serializer.data
                }, status=status.HTTP_200_OK)
            return Response({
                "status": "error",
                "message": "Invalid data",
                "errors": serializer.errors
            }, status=status.HTTP_400_BAD_REQUEST)
        except:
            return Response({
                "status": "error",
                "message": "No LR found with the given ID"
            }, status=status.HTTP_404_NOT_FOUND)

# DELETE
class LRDeleteView(generics.DestroyAPIView):
    queryset = LR.objects.all()
    serializer_class = LRSerializer
    lookup_field = 'id'

    def destroy(self, request, *args, **kwargs):
        try:
            instance = self.get_object()
            self.perform_destroy(instance)
            return Response({
                "status": "success",
                "message": "LR deleted successfully"
            }, status=status.HTTP_200_OK)
        except:
            return Response({
                "status": "error",
                "message": "No LR found with the given ID"
            }, status=status.HTTP_404_NOT_FOUND)
        
# CREATE
class InvoiceCreateView(generics.CreateAPIView):
    #permission_classes = [IsAuthenticated]
    queryset = Invoice.objects.all()
    serializer_class = InvoiceSerializer

    def create(self, request, *args, **kwargs):
        serializer = self.get_serializer(data=request.data)
        if serializer.is_valid():
            instance = serializer.save()
            return Response({
                "status": "success",
                "message": "Invoice created successfully",
                "data": serializer.data
            }, status=status.HTTP_201_CREATED)
        return Response({
            "status": "error",
            "message": "Invalid data",
            "errors": serializer.errors
        }, status=status.HTTP_400_BAD_REQUEST)

#LIST (Paginated)
class InvoiceListView(generics.ListAPIView):

    queryset = Invoice.objects.all()
    serializer_class = InvoiceSerializer
    pagination_class = CustomPagination

    def get_queryset(self):
        trip_id = self.kwargs.get('tripId')  # Get from URL parameter
        queryset = Invoice.objects.filter(tripId=trip_id) if trip_id else Invoice.objects.all()
        
        # Get filters from query params
        search_query = self.request.query_params.get('search', '')
        filters_json = self.request.query_params.get('filters', '[]')
        sorting_json = self.request.query_params.get("sorting", "{}")

        if search_query:
            queryset = queryset.filter(
                Q(invoiceNumber__icontains=search_query) |  # Example: Search in truck number
                Q(materialCategory__icontains=search_query)  # Example: Search in truck type
            )

        try:
            # Parse JSON string into Python list
            filters = json.loads(filters_json)

            if filters:
                main_query = Q()
                
                # Group filters by key
                grouped_filters = {}
                for f in filters:
                    for key, value in f.items():
                        if key not in grouped_filters:
                            grouped_filters[key] = []
                        grouped_filters[key].append(value)
                
                # OR filtering within same key
                for key, values in grouped_filters.items():
                    key_query = Q()
                    for value in values:
                        key_query |= Q(**{key: value})
                    main_query &= key_query

                queryset = queryset.filter(main_query)

        except json.JSONDecodeError:
            pass

        try:
            # Parse sorting
            sorting = json.loads(sorting_json)
            sort_key = sorting.get("key")
            sort_direction = sorting.get("direction", "ascending")

            if sort_key and hasattr(Invoice, sort_key):
                if sort_direction == "descending":
                    sort_key = f"-{sort_key}"
                queryset = queryset.order_by(sort_key)

        except json.JSONDecodeError:
            pass
        
        return queryset

    def list(self, request, *args, **kwargs):
        response = super().list(request, *args, **kwargs)

        total_items = self.paginator.page.paginator.count  # Get total items
        page_size = self.paginator.get_page_size(request)  # Get current page size
        total_pages = (total_items + page_size - 1) // page_size 

        if isinstance(response.data, dict):  # Pagination applied
            return Response({
                "status": "success",
                "message": "Invoices retrieved successfully",
                "count": response.data.get("count", len(response.data.get("results", []))),
                "total_pages": total_pages,
                "next": response.data.get("next"),
                "previous": response.data.get("previous"),
                "data": response.data.get("results", [])
            }, status=status.HTTP_200_OK)

        return Response({
            "status": "success",
            "message": "Invoices retrieved successfully",
            "count": len(response.data),
            "data": response.data
        }, status=status.HTTP_200_OK)


#UPDATE
class InvoiceUpdateView(generics.UpdateAPIView):
    queryset = Invoice.objects.all()
    serializer_class = InvoiceSerializer
    lookup_field = 'id'

    def update(self, request, *args, **kwargs):
        try:
            instance = self.get_object()
            serializer = self.get_serializer(instance, data=request.data, partial=True)
            if serializer.is_valid():
                serializer.save()
                return Response({
                    "status": "success",
                    "message": "Invoice updated successfully",
                    "data": serializer.data
                }, status=status.HTTP_200_OK)
            return Response({
                "status": "error",
                "message": "Invalid data",
                "errors": serializer.errors
            }, status=status.HTTP_400_BAD_REQUEST)
        except:
            return Response({
                "status": "error",
                "message": "No Invoice found with the given ID"
            }, status=status.HTTP_404_NOT_FOUND)

# DELETE
class InvoiceDeleteView(generics.DestroyAPIView):
    queryset = Invoice.objects.all()
    serializer_class = InvoiceSerializer
    lookup_field = 'id'

    def destroy(self, request, *args, **kwargs):
        try:
            instance = self.get_object()
            self.perform_destroy(instance)
            return Response({
                "status": "success",
                "message": "Invoice deleted successfully"
            }, status=status.HTTP_200_OK)
        except:
            return Response({
                "status": "error",
                "message": "No Invoice found with the given ID"
            }, status=status.HTTP_404_NOT_FOUND)