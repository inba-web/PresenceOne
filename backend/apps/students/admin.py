from django.contrib import admin
from .models import StudentProfile

@admin.register(StudentProfile)
class StudentProfileAdmin(admin.ModelAdmin):
    list_display = ('user', 'roll_number', 'admission_number', 'department', 'course', 'current_semester')
    list_filter = ('department', 'course', 'current_semester')
    search_fields = ('user__email', 'roll_number', 'admission_number', 'user__first_name', 'user__last_name')
