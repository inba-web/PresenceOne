from django.urls import path, include

urlpatterns = [
    path('auth/', include('apps.accounts.urls')),
    path('attendance/', include('apps.attendance.urls')),
    path('leaves/', include('apps.leave_management.urls')),
    path('departments/', include('apps.departments.urls')),
    path('courses/', include('apps.courses.urls')),
]
