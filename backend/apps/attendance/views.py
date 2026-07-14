from rest_framework import generics, viewsets, status, permissions
from rest_framework.response import Response
from django.db import transaction
from apps.subjects.models import Subject
from apps.students.models import StudentProfile
from .models import AttendanceSession, AttendanceRecord
from .serializers import (
    SubjectSerializer,
    StudentProfileSerializer,
    AttendanceSessionSerializer,
    AttendanceRecordSerializer,
    BulkAttendanceMarkSerializer,
)

class FacultySubjectsListView(generics.ListAPIView):
    """
    List all subjects in the department of the authenticated Faculty.
    """
    serializer_class = SubjectSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        user = self.request.user
        try:
            profile = user.faculty_profile
        except AttributeError:
            return Subject.objects.none()
        
        if not profile.department:
            return Subject.objects.none()
            
        return Subject.objects.filter(course__department=profile.department).order_by('id')


class FacultyStudentsListView(generics.ListAPIView):
    """
    List students enrolled in the Course and Semester of a specific Subject.
    """
    serializer_class = StudentProfileSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        subject_id = self.request.query_params.get('subject_id')
        if not subject_id:
            return StudentProfile.objects.none()
        try:
            subject = Subject.objects.get(pk=subject_id)
        except Subject.DoesNotExist:
            return StudentProfile.objects.none()
        
        return StudentProfile.objects.filter(course=subject.course, current_semester=subject.semester).order_by('id')


class AttendanceSessionViewSet(viewsets.ModelViewSet):
    """
    ViewSet for listing, creating, retrieving, updating, and deleting attendance sessions.
    """
    queryset = AttendanceSession.objects.all()
    serializer_class = AttendanceSessionSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        # Faculty sees their created sessions, others see all relevant sessions
        user = self.request.user
        if hasattr(user, 'faculty_profile'):
            return self.queryset.filter(faculty=user.faculty_profile)
        return self.queryset


class BulkAttendanceMarkView(generics.CreateAPIView):
    """
    Bulk marks attendance records for a specific session.
    """
    serializer_class = BulkAttendanceMarkSerializer
    permission_classes = [permissions.IsAuthenticated]

    def post(self, request, *args, **kwargs):
        session_id = self.kwargs.get('session_id')
        try:
            session = AttendanceSession.objects.get(pk=session_id)
        except AttendanceSession.DoesNotExist:
            return Response({"detail": "Attendance session not found."}, status=status.HTTP_404_NOT_FOUND)

        serializer = self.get_serializer(data=request.data)
        if serializer.is_valid():
            records_data = serializer.validated_data['records']
            try:
                with transaction.atomic():
                    for record in records_data:
                        student_id = record['student_id']
                        student = StudentProfile.objects.get(pk=student_id)
                        AttendanceRecord.objects.update_or_create(
                            student=student,
                            session=session,
                            defaults={
                                "status": record['status'],
                                "remarks": record.get('remarks', ''),
                                "marked_by": request.user
                            }
                        )
                return Response({"detail": "Attendance marked successfully."}, status=status.HTTP_200_OK)
            except StudentProfile.DoesNotExist:
                return Response({"detail": "One of the student profiles was not found."}, status=status.HTTP_400_BAD_REQUEST)
            except Exception as e:
                return Response({"detail": str(e)}, status=status.HTTP_400_BAD_REQUEST)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


class StudentAttendanceSummaryView(generics.GenericAPIView):
    """
    Returns overall and subject-wise attendance summaries for the logged-in Student.
    """
    permission_classes = [permissions.IsAuthenticated]

    def get(self, request, *args, **kwargs):
        user = request.user
        try:
            student_profile = user.student_profile
        except AttributeError:
            return Response({"detail": "Authenticated user is not a student."}, status=status.HTTP_400_BAD_REQUEST)

        # Overall stats
        records = AttendanceRecord.objects.filter(student=student_profile)
        total_sessions = records.count()
        present_records = records.filter(status__in=['PRESENT', 'LATE']).count()
        absent_records = records.filter(status='ABSENT').count()
        late_records = records.filter(status='LATE').count()
        excused_records = records.filter(status='EXCUSED').count()

        overall_percentage = (present_records / total_sessions * 100) if total_sessions > 0 else 100.0

        # Subject stats
        course = student_profile.course
        semester = student_profile.current_semester
        subjects = Subject.objects.filter(course=course, semester=semester)

        subject_stats = []
        for subject in subjects:
            sub_sessions = AttendanceSession.objects.filter(subject=subject)
            sub_total = sub_sessions.count()
            sub_records = AttendanceRecord.objects.filter(student=student_profile, session__in=sub_sessions)
            sub_present = sub_records.filter(status__in=['PRESENT', 'LATE']).count()
            sub_pct = (sub_present / sub_total * 100) if sub_total > 0 else 100.0

            subject_stats.append({
                "subject_id": subject.id,
                "subject_name": subject.name,
                "subject_code": subject.code,
                "total_sessions": sub_total,
                "present_sessions": sub_present,
                "percentage": round(sub_pct, 1)
            })

        # Recent logs (last 5 sessions)
        recent_records = records.order_by('-session__date', '-session__start_time')[:5]
        recent_logs = []
        for rec in recent_records:
            recent_logs.append({
                "session_id": rec.session.id,
                "date": rec.session.date,
                "subject_code": rec.session.subject.code,
                "subject_name": rec.session.subject.name,
                "status": rec.status,
                "remarks": rec.remarks
            })

        return Response({
            "overall": {
                "total_sessions": total_sessions,
                "present_sessions": present_records,
                "absent_sessions": absent_records,
                "late_sessions": late_records,
                "excused_sessions": excused_records,
                "percentage": round(overall_percentage, 1)
            },
            "subjects": subject_stats,
            "recent": recent_logs
        }, status=status.HTTP_200_OK)
