from django.test import TestCase
from django.contrib.auth import get_user_model
from datetime import date, time
from apps.departments.models import Department
from apps.courses.models import Course
from apps.subjects.models import Subject
from apps.faculty.models import FacultyProfile
from apps.students.models import StudentProfile
from apps.attendance.models import AttendanceSession, AttendanceRecord

User = get_user_model()

class AttendanceTests(TestCase):
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
