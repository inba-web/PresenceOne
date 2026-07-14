from django.contrib import admin
from .models import Course

@admin.register(Course)
class CourseAdmin(admin.ModelAdmin):
    list_display = ('name', 'code', 'department', 'total_semesters')
    list_filter = ('department',)
    search_fields = ('name', 'code')
