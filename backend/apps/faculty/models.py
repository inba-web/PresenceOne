from django.db import models
from django.conf import settings
from apps.departments.models import Department

class FacultyProfile(models.Model):
    user = models.OneToOneField(settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name='faculty_profile')
    employee_id = models.CharField(max_length=20, unique=True)
    designation = models.CharField(max_length=100, blank=True, null=True)
    department = models.ForeignKey(Department, on_delete=models.SET_NULL, null=True, blank=True, related_name='faculty')
    joining_date = models.DateField(blank=True, null=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    def __str__(self):
        return f"{self.user.get_full_name()} ({self.employee_id})"
