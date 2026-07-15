from rest_framework import generics, permissions
from .models import Department
from .serializers import DepartmentSerializer

class DepartmentListView(generics.ListAPIView):
    """
    Public read-only listing of all academic departments.
    """
    queryset = Department.objects.all().order_by('name')
    serializer_class = DepartmentSerializer
    permission_classes = [permissions.AllowAny]
