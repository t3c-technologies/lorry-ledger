# drivers/views.py

from rest_framework import generics, status
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated

from .models import Driver, Transactions
from .serializers import DriverSerializer, TransactionsSerializer
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
    permission_classes = [IsAuthenticated]
    queryset = Driver.objects.all().order_by('name')
    serializer_class = DriverSerializer
    pagination_class = CustomPagination

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