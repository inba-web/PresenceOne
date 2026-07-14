from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import (
    FacultySubjectsListView,
    FacultyStudentsListView,
    AttendanceSessionViewSet,
    BulkAttendanceMarkView,
    StudentAttendanceSummaryView,
)

router = DefaultRouter()
router.register('sessions', AttendanceSessionViewSet, basename='attendance-session')

urlpatterns = [
    path('', include(router.urls)),
    path('faculty/subjects/', FacultySubjectsListView.as_view(), name='faculty-subjects'),
    path('faculty/students/', FacultyStudentsListView.as_view(), name='faculty-students'),
    path('sessions/<int:session_id>/bulk-mark/', BulkAttendanceMarkView.as_view(), name='bulk-mark-attendance'),
    path('student/summary/', StudentAttendanceSummaryView.as_view(), name='student-attendance-summary'),
]
