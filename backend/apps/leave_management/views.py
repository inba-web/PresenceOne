from rest_framework import viewsets, generics, status, permissions
from rest_framework.response import Response
from django.db import transaction
from django.utils import timezone
from apps.attendance.models import AttendanceRecord
from apps.students.models import StudentProfile
from .models import LeaveRequest
from .serializers import LeaveRequestSerializer, LeaveApprovalSerializer

class LeaveRequestViewSet(viewsets.ModelViewSet):
    """
    ViewSet for listing, creating, and retrieving leave requests.
    - Students see their own requests.
    - Faculty and Admins see all requests.
    """
    queryset = LeaveRequest.objects.all()
    serializer_class = LeaveRequestSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        user = self.request.user
        if user.role == 'STUDENT':
            return self.queryset.filter(user=user).order_by('-created_at')
        # Staff can filter by status using query parameters if needed
        status_filter = self.request.query_params.get('status')
        qs = self.queryset
        if status_filter:
            qs = qs.filter(status=status_filter)
        return qs.order_by('-created_at')

    def perform_create(self, serializer):
        serializer.save(user=self.request.user, status='PENDING')


class LeaveApprovalView(generics.UpdateAPIView):
    """
    Endpoint for Faculty/Admin to approve or reject leave requests.
    Automatically excuses corresponding attendance records upon approval.
    """
    queryset = LeaveRequest.objects.all()
    serializer_class = LeaveApprovalSerializer
    permission_classes = [permissions.IsAuthenticated]

    def update(self, request, *args, **kwargs):
        user = request.user
        if user.role not in ['FACULTY', 'ADMIN', 'SUPER_ADMIN']:
            return Response({"detail": "You do not have permission to approve leaves."}, status=status.HTTP_403_FORBIDDEN)

        leave_request = self.get_object()
        if leave_request.status != 'PENDING':
            return Response({"detail": "This leave request has already been processed."}, status=status.HTTP_400_BAD_REQUEST)

        serializer = self.get_serializer(data=request.data)
        if serializer.is_valid():
            new_status = serializer.validated_data['status']
            remarks = serializer.validated_data.get('remarks', '')

            try:
                with transaction.atomic():
                    # Update Leave Status
                    leave_request.status = new_status
                    leave_request.remarks = remarks
                    leave_request.approved_by = user
                    leave_request.approved_at = timezone.now()
                    leave_request.save()

                    # Auto-Exemption Logic if APPROVED
                    if new_status == 'APPROVED':
                        # Check if the applicant is a student
                        if hasattr(leave_request.user, 'student_profile'):
                            student_profile = leave_request.user.student_profile
                            # Excuse any attendance records in date range
                            AttendanceRecord.objects.filter(
                                student=student_profile,
                                session__date__range=[leave_request.start_date, leave_request.end_date]
                            ).update(status='EXCUSED', remarks='Excused due to approved leave')

                return Response(LeaveRequestSerializer(leave_request).data, status=status.HTTP_200_OK)
            except Exception as e:
                return Response({"detail": str(e)}, status=status.HTTP_400_BAD_REQUEST)

        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
