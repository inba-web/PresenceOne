from django.contrib import admin
from .models import AttendanceSession, AttendanceRecord

@admin.register(AttendanceSession)
class AttendanceSessionAdmin(admin.ModelAdmin):
    list_display = ('subject', 'faculty', 'date', 'start_time', 'end_time', 'room_number')
    list_filter = ('date', 'subject', 'faculty')
    search_fields = ('subject__name', 'subject__code', 'faculty__user__first_name', 'faculty__user__last_name')

@admin.register(AttendanceRecord)
class AttendanceRecordAdmin(admin.ModelAdmin):
    list_display = ('student', 'session', 'status', 'marked_by', 'created_at')
    list_filter = ('status', 'session__date', 'session__subject')
    search_fields = ('student__user__first_name', 'student__user__last_name', 'student__roll_number')
