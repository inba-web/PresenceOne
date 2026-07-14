from django.db import models
from django.conf import settings

class Notification(models.Model):
    NOTIFICATION_TYPES = (
        ('ATTENDANCE', 'Attendance Alert'),
        ('LEAVE', 'Leave Request Update'),
        ('SYSTEM', 'System Alert'),
        ('GENERAL', 'General Announcement'),
    )
    recipient = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name='notifications')
    title = models.CharField(max_length=150)
    message = models.TextField()
    notification_type = models.CharField(max_length=20, choices=NOTIFICATION_TYPES, default='GENERAL')
    is_read = models.BooleanField(default=False)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ['-created_at']

    def __str__(self):
        return f"{self.recipient.email} - {self.title}"
