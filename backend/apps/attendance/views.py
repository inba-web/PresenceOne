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


import csv
from django.http import HttpResponse

class ExportAttendanceCSVView(generics.GenericAPIView):
    """
    Export attendance matrix for a subject to CSV format.
    - Columns: Roll Number, Name, Class Session Dates
    - Rows: Individual students and their status characters (P/A/L/E)
    """
    permission_classes = [permissions.IsAuthenticated]

    def get(self, request, *args, **kwargs):
        user = request.user
        if user.role not in ['FACULTY', 'ADMIN', 'SUPER_ADMIN']:
            return Response({"detail": "Permission denied."}, status=status.HTTP_403_FORBIDDEN)

        subject_id = request.query_params.get('subject_id')
        if not subject_id:
            return Response({"detail": "subject_id parameter is required."}, status=status.HTTP_400_BAD_REQUEST)

        try:
            subject = Subject.objects.get(pk=subject_id)
        except Subject.DoesNotExist:
            return Response({"detail": "Subject not found."}, status=status.HTTP_404_NOT_FOUND)

        # Get all sessions for this subject
        sessions = AttendanceSession.objects.filter(subject=subject).order_by('date', 'start_time')
        # Get all students enrolled
        students = StudentProfile.objects.filter(course=subject.course, current_semester=subject.semester).order_by('roll_number')

        # Initialize CSV response
        response = HttpResponse(content_type='text/csv')
        response['Content-Disposition'] = f'attachment; filename="attendance_{subject.code}.csv"'

        writer = csv.writer(response)

        # Build Headers
        headers = ['Roll Number', 'Student Name']
        for sess in sessions:
            headers.append(f"{sess.date} {sess.start_time.strftime('%H:%M')}")
        writer.writerow(headers)

        # Build Rows
        for std in students:
            row = [std.roll_number, std.user.get_full_name()]
            for sess in sessions:
                rec = AttendanceRecord.objects.filter(student=std, session=sess).first()
                if rec:
                    status_map = {'PRESENT': 'P', 'ABSENT': 'A', 'LATE': 'L', 'EXCUSED': 'E'}
                    row.append(status_map.get(rec.status, '-'))
                else:
                    row.append('-')
            writer.writerow(row)

        return response


class AttendanceAnalyticsView(generics.GenericAPIView):
    """
    Retrieves aggregated summary statistics for dashboard charts (pie share, line trends, subject comparisons).
    """
    permission_classes = [permissions.IsAuthenticated]

    def get(self, request, *args, **kwargs):
        user = request.user
        
        # Filter records based on role
        if user.role == 'STUDENT':
            try:
                student_profile = user.student_profile
                records = AttendanceRecord.objects.filter(student=student_profile)
            except AttributeError:
                return Response({"detail": "Student profile not found."}, status=status.HTTP_400_BAD_REQUEST)
        elif user.role == 'FACULTY':
            try:
                faculty_profile = user.faculty_profile
                records = AttendanceRecord.objects.filter(session__faculty=faculty_profile)
            except AttributeError:
                return Response({"detail": "Faculty profile not found."}, status=status.HTTP_400_BAD_REQUEST)
        else:
            records = AttendanceRecord.objects.all()

        # 1. Status Distribution
        total = records.count()
        present_count = records.filter(status='PRESENT').count()
        absent_count = records.filter(status='ABSENT').count()
        late_count = records.filter(status='LATE').count()
        excused_count = records.filter(status='EXCUSED').count()

        status_distribution = [
            {"name": "Present", "value": present_count},
            {"name": "Absent", "value": absent_count},
            {"name": "Late", "value": late_count},
            {"name": "Excused", "value": excused_count},
        ]

        # 2. Subject Averages
        subject_ids = records.values_list('session__subject_id', flat=True).distinct()
        subjects = Subject.objects.filter(id__in=subject_ids)
        
        subject_averages = []
        for sub in subjects:
            sub_records = records.filter(session__subject=sub)
            sub_total = sub_records.count()
            sub_present = sub_records.filter(status__in=['PRESENT', 'LATE']).count()
            sub_pct = (sub_present / sub_total * 100) if sub_total > 0 else 100.0
            subject_averages.append({
                "subject_name": sub.name,
                "subject_code": sub.code,
                "percentage": round(sub_pct, 1)
            })

        # 3. Daily trends (past 7 distinct session dates with records)
        session_dates = records.values_list('session__date', flat=True).distinct().order_by('-session__date')[:7]
        session_dates = sorted(list(session_dates))
        
        daily_trends = []
        for d in session_dates:
            day_records = records.filter(session__date=d)
            day_total = day_records.count()
            day_present = day_records.filter(status__in=['PRESENT', 'LATE']).count()
            day_pct = (day_present / day_total * 100) if day_total > 0 else 100.0
            daily_trends.append({
                "date": str(d),
                "percentage": round(day_pct, 1)
            })

        return Response({
            "total_records": total,
            "status_distribution": status_distribution,
            "subject_averages": subject_averages,
            "daily_trends": daily_trends
        }, status=status.HTTP_200_OK)

