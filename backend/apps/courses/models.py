from django.db import models
from apps.departments.models import Department

class Course(models.Model):
    name = models.CharField(max_length=100)
    code = models.CharField(max_length=20, unique=True)
    department = models.ForeignKey(Department, on_delete=models.CASCADE, related_name='courses')
    description = models.TextField(blank=True, null=True)
    duration_years = models.PositiveIntegerField(default=4)
    total_semesters = models.PositiveIntegerField(default=8)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    def __str__(self):
        return f"{self.name} ({self.code})"
