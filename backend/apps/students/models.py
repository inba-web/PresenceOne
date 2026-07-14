from django.db import models
from django.conf import settings
from apps.departments.models import Department
from apps.courses.models import Course

class StudentProfile(models.Model):
    user = models.OneToOneField(settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name='student_profile')
    roll_number = models.CharField(max_length=20, unique=True)
    admission_number = models.CharField(max_length=20, unique=True)
    department = models.ForeignKey(Department, on_delete=models.SET_NULL, null=True, blank=True, related_name='students')
    course = models.ForeignKey(Course, on_delete=models.SET_NULL, null=True, blank=True, related_name='students')
    current_semester = models.PositiveIntegerField(default=1)
    date_of_birth = models.DateField(blank=True, null=True)
    enrollment_date = models.DateField(blank=True, null=True)
    guardian_name = models.CharField(max_length=100, blank=True, null=True)
    guardian_phone = models.CharField(max_length=15, blank=True, null=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    def __str__(self):
        return f"{self.user.get_full_name()} ({self.roll_number})"
