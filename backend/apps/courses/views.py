from rest_framework import generics, permissions
from .models import Course
from .serializers import CourseSerializer

class CourseListView(generics.ListAPIView):
    """
    Public read-only listing of academic courses.
    Supports filtering by department if provided.
    """
    serializer_class = CourseSerializer
    permission_classes = [permissions.AllowAny]

    def get_queryset(self):
        queryset = Course.objects.all().order_by('name')
        dept_id = self.request.query_params.get('department_id')
        if dept_id:
            queryset = queryset.filter(department_id=dept_id)
        return queryset
