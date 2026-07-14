from django.db import models
from django.conf import settings
from apps.subjects.models import Subject
from apps.faculty.models import FacultyProfile
from apps.students.models import StudentProfile

class AttendanceSession(models.Model):
    subject = models.ForeignKey(Subject, on_delete=models.CASCADE, related_name='attendance_sessions')
    faculty = models.ForeignKey(FacultyProfile, on_delete=models.SET_NULL, null=True, related_name='attendance_sessions')
    date = models.DateField()
    start_time = models.TimeField()
    end_time = models.TimeField()
    room_number = models.CharField(max_length=20, blank=True, null=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        ordering = ['-date', '-start_time']

    def __str__(self):
        return f"{self.subject.code} on {self.date} ({self.start_time}-{self.end_time})"

class AttendanceRecord(models.Model):
    STATUS_CHOICES = (
        ('PRESENT', 'Present'),
        ('ABSENT', 'Absent'),
        ('LATE', 'Late'),
        ('EXCUSED', 'Excused'),
    )
    student = models.ForeignKey(StudentProfile, on_delete=models.CASCADE, related_name='attendance_records')
    session = models.ForeignKey(AttendanceSession, on_delete=models.CASCADE, related_name='records')
    status = models.CharField(max_length=15, choices=STATUS_CHOICES, default='PRESENT')
    remarks = models.CharField(max_length=255, blank=True, null=True)
    marked_by = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.SET_NULL, null=True, related_name='marked_attendance_records')
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        unique_together = ('student', 'session')

    def __str__(self):
        return f"{self.student.roll_number} - {self.session.subject.code} : {self.status}"
