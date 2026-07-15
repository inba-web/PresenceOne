from rest_framework.test import APITestCase
from django.contrib.auth import get_user_model
from datetime import date, time
from apps.departments.models import Department
from apps.courses.models import Course
from apps.subjects.models import Subject
from apps.faculty.models import FacultyProfile
from apps.students.models import StudentProfile
from apps.attendance.models import AttendanceSession, AttendanceRecord

User = get_user_model()

class AttendanceTests(APITestCase):
    def setUp(self):
        self.dept = Department.objects.create(name="CS", code="CS")
        self.course = Course.objects.create(name="BTech CS", code="BTECH_CS", department=self.dept)
        self.subject = Subject.objects.create(name="Programming", code="CS101", course=self.course)
        
        # Users
        self.fac_user = User.objects.create_user(
            email="fac@presencone.com",
            password="password123",
            role="FACULTY",
            first_name="Fac",
            last_name="User"
        )
        self.fac_profile = FacultyProfile.objects.create(
            user=self.fac_user,
            employee_id="FAC001",
            department=self.dept
        )

        self.stud_user = User.objects.create_user(
            email="stud@presencone.com",
            password="password123",
            role="STUDENT",
            first_name="Stud",
            last_name="User"
        )
        self.stud_profile = StudentProfile.objects.create(
            user=self.stud_user,
            roll_number="STU001",
            admission_number="ADM001",
            department=self.dept,
            course=self.course
        )

    def test_attendance_session_and_record_creation(self):
        session = AttendanceSession.objects.create(
            subject=self.subject,
            faculty=self.fac_profile,
            date=date.today(),
            start_time=time(9, 0),
            end_time=time(10, 0),
            room_number="101"
        )
        self.assertEqual(session.subject.code, "CS101")
        self.assertEqual(session.faculty.employee_id, "FAC001")

        record = AttendanceRecord.objects.create(
            student=self.stud_profile,
            session=session,
            status="PRESENT",
            marked_by=self.fac_user
        )
        self.assertEqual(record.status, "PRESENT")
        self.assertEqual(record.student.roll_number, "STU001")
        
        # Test unique together constraint
        from django.db import IntegrityError
        with self.assertRaises(IntegrityError):
            AttendanceRecord.objects.create(
                student=self.stud_profile,
                session=session,
                status="ABSENT"
            )

    def test_faculty_subjects_list_api(self):
        from django.urls import reverse
        self.client.force_authenticate(user=self.fac_user)
        url = reverse('faculty-subjects')
        response = self.client.get(url)
        self.assertEqual(response.status_code, 200)
        self.assertEqual(len(response.data['results']), 1)
        self.assertEqual(response.data['results'][0]['code'], "CS101")

    def test_faculty_students_list_api(self):
        from django.urls import reverse
        self.client.force_authenticate(user=self.fac_user)
        url = reverse('faculty-students') + f"?subject_id={self.subject.id}"
        response = self.client.get(url)
        self.assertEqual(response.status_code, 200)
        self.assertEqual(len(response.data['results']), 1)
        self.assertEqual(response.data['results'][0]['roll_number'], "STU001")

    def test_bulk_attendance_mark_api(self):
        from django.urls import reverse
        self.client.force_authenticate(user=self.fac_user)
        
        session = AttendanceSession.objects.create(
            subject=self.subject,
            faculty=self.fac_profile,
            date=date.today(),
            start_time=time(9, 0),
            end_time=time(10, 0)
        )
        
        url = reverse('bulk-mark-attendance', kwargs={"session_id": session.id})
        data = {
            "records": [
                {
                    "student_id": self.stud_profile.id,
                    "status": "PRESENT",
                    "remarks": "On time"
                }
            ]
        }
        response = self.client.post(url, data, format='json')
        self.assertEqual(response.status_code, 200)
        
        # Verify the record was created
        record = AttendanceRecord.objects.get(student=self.stud_profile, session=session)
        self.assertEqual(record.status, "PRESENT")
        self.assertEqual(record.remarks, "On time")

    def test_student_attendance_summary_api(self):
        from django.urls import reverse
        # Create some attendance session and record
        session = AttendanceSession.objects.create(
            subject=self.subject,
            faculty=self.fac_profile,
            date=date.today(),
            start_time=time(9, 0),
            end_time=time(10, 0)
        )
        AttendanceRecord.objects.create(
            student=self.stud_profile,
            session=session,
            status="PRESENT",
            marked_by=self.fac_user
        )
        
        self.client.force_authenticate(user=self.stud_user)
        url = reverse('student-attendance-summary')
        response = self.client.get(url)
        self.assertEqual(response.status_code, 200)
        self.assertIn('overall', response.data)
        self.assertEqual(response.data['overall']['total_sessions'], 1)
        self.assertEqual(response.data['overall']['percentage'], 100.0)

    def test_export_attendance_csv_api(self):
        from django.urls import reverse
        # Create some sessions and records
        session = AttendanceSession.objects.create(
            subject=self.subject,
            faculty=self.fac_profile,
            date=date.today(),
            start_time=time(9, 0),
            end_time=time(10, 0)
        )
        AttendanceRecord.objects.create(
            student=self.stud_profile,
            session=session,
            status="PRESENT",
            marked_by=self.fac_user
        )

        self.client.force_authenticate(user=self.fac_user)
        url = reverse('export-attendance-csv') + f"?subject_id={self.subject.id}"
        response = self.client.get(url)
        self.assertEqual(response.status_code, 200)
        self.assertEqual(response['Content-Type'], 'text/csv')
        self.assertIn('attachment; filename=', response['Content-Disposition'])
        
        # Verify content
        content = response.content.decode('utf-8')
        self.assertIn('Roll Number,Student Name', content)
        self.assertIn(self.stud_profile.roll_number, content)

    def test_attendance_analytics_summary_api(self):
        from django.urls import reverse
        session = AttendanceSession.objects.create(
            subject=self.subject,
            faculty=self.fac_profile,
            date=date.today(),
            start_time=time(9, 0),
            end_time=time(10, 0)
        )
        AttendanceRecord.objects.create(
            student=self.stud_profile,
            session=session,
            status="PRESENT",
            marked_by=self.fac_user
        )

        self.client.force_authenticate(user=self.fac_user)
        url = reverse('attendance-analytics-summary')
        response = self.client.get(url)
        self.assertEqual(response.status_code, 200)
        self.assertIn('status_distribution', response.data)
        self.assertIn('subject_averages', response.data)
        self.assertIn('daily_trends', response.data)
        self.assertEqual(response.data['total_records'], 1)


