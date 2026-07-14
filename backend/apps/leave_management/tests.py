from rest_framework.test import APITestCase
from django.contrib.auth import get_user_model
from django.urls import reverse
from datetime import date, timedelta, time
from apps.departments.models import Department
from apps.courses.models import Course
from apps.subjects.models import Subject
from apps.faculty.models import FacultyProfile
from apps.students.models import StudentProfile
from apps.attendance.models import AttendanceSession, AttendanceRecord
from apps.leave_management.models import LeaveRequest

User = get_user_model()

class LeaveManagementAPITests(APITestCase):
    def setUp(self):
        self.dept = Department.objects.create(name="CS", code="CS")
        self.course = Course.objects.create(name="BTech CS", code="BTECH_CS", department=self.dept)
        self.subject = Subject.objects.create(name="Programming", code="CS101", course=self.course)

        # Student
        self.stud_user = User.objects.create_user(
            email="student@presencone.com",
            password="student_password_123",
            role="STUDENT",
            first_name="Emily",
            last_name="Learner"
        )
        self.stud_profile = StudentProfile.objects.create(
            user=self.stud_user,
            roll_number="STU_01",
            admission_number="ADM_01",
            department=self.dept,
            course=self.course
        )

        # Faculty
        self.fac_user = User.objects.create_user(
            email="faculty@presencone.com",
            password="faculty_password_123",
            role="FACULTY",
            first_name="Marcus",
            last_name="Teacher"
        )
        self.fac_profile = FacultyProfile.objects.create(
            user=self.fac_user,
            employee_id="EMP_01",
            department=self.dept
        )

        # Attendance Setup
        self.session = AttendanceSession.objects.create(
            subject=self.subject,
            faculty=self.fac_profile,
            date=date.today() + timedelta(days=1),
            start_time=time(9, 0),
            end_time=time(10, 0)
        )
        self.record = AttendanceRecord.objects.create(
            student=self.stud_profile,
            session=self.session,
            status="ABSENT",
            marked_by=self.fac_user
        )

    def test_student_apply_leave_success(self):
        self.client.force_authenticate(user=self.stud_user)
        url = reverse('leave-request-list')
        data = {
            "leave_type": "SICK",
            "start_date": str(date.today() + timedelta(days=1)),
            "end_date": str(date.today() + timedelta(days=2)),
            "reason": "Feeling unwell"
        }
        response = self.client.post(url, data, format='json')
        self.assertEqual(response.status_code, 201)
        self.assertEqual(response.data['status'], 'PENDING')
        self.assertEqual(response.data['reason'], 'Feeling unwell')

    def test_faculty_approve_leave_and_excuse_attendance(self):
        # Create Leave Request
        leave = LeaveRequest.objects.create(
            user=self.stud_user,
            leave_type="SICK",
            start_date=date.today() + timedelta(days=1),
            end_date=date.today() + timedelta(days=2),
            reason="Feeling unwell",
            status="PENDING"
        )

        self.client.force_authenticate(user=self.fac_user)
        url = reverse('leave-approve', kwargs={"pk": leave.id})
        data = {
            "status": "APPROVED",
            "remarks": "Get well soon"
        }
        response = self.client.put(url, data, format='json')
        self.assertEqual(response.status_code, 200)

        # Verify Leave request status updated
        leave.refresh_from_db()
        self.assertEqual(leave.status, "APPROVED")
        self.assertEqual(leave.remarks, "Get well soon")
        self.assertEqual(leave.approved_by, self.fac_user)

        # Verify Attendance Record updated to EXCUSED
        self.record.refresh_from_db()
        self.assertEqual(self.record.status, "EXCUSED")

    def test_student_cannot_approve_leave(self):
        leave = LeaveRequest.objects.create(
            user=self.stud_user,
            leave_type="SICK",
            start_date=date.today() + timedelta(days=1),
            end_date=date.today() + timedelta(days=2),
            reason="Feeling unwell",
            status="PENDING"
        )

        self.client.force_authenticate(user=self.stud_user)
        url = reverse('leave-approve', kwargs={"pk": leave.id})
        data = {
            "status": "APPROVED",
            "remarks": "Self-approved"
        }
        response = self.client.put(url, data, format='json')
        self.assertEqual(response.status_code, 403)
