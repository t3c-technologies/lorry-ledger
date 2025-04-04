# drivers/views.py

from rest_framework import generics, status
import json
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated
from django.db.models import Q

from .models import Driver, Transactions, Truck
from .serializers import DriverSerializer, TransactionsSerializer, TruckSerializer
from common.pagination import CustomPagination  # Assuming we have this in place already

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