from django.urls import path, include

urlpatterns = [
    path('auth/', include('apps.accounts.urls')),
    path('attendance/', include('apps.attendance.urls')),
]
