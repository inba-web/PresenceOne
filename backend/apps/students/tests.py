from django.test import TestCase
from django.contrib.auth import get_user_model
from apps.departments.models import Department
from apps.courses.models import Course
from apps.students.models import StudentProfile

User = get_user_model()

class StudentProfileTests(TestCase):
    def setUp(self):
        self.dept = Department.objects.create(name="CS", code="CS")
        self.course = Course.objects.create(name="BTech CS", code="BTECH_CS", department=self.dept)
        
        self.user = User.objects.create_user(
            email="test_student@presencone.com",
            password="test_password_123",
            role="STUDENT",
            first_name="Test",
            last_name="Student"
        )

    def test_student_profile_creation_success(self):
        profile = StudentProfile.objects.create(
            user=self.user,
            roll_number="STU001",
            admission_number="ADM001",
            department=self.dept,
            course=self.course,
            current_semester=1
        )
        self.assertEqual(profile.user.email, "test_student@presencone.com")
        self.assertEqual(profile.roll_number, "STU001")
        self.assertEqual(profile.department.code, "CS")
        self.assertEqual(profile.course.code, "BTECH_CS")
        self.assertEqual(str(profile), "Test Student (STU001)")

    def test_student_profile_roll_number_unique_constraint(self):
        StudentProfile.objects.create(
            user=self.user,
            roll_number="STU001",
            admission_number="ADM001",
            department=self.dept,
            course=self.course
        )
        
        # Try to create another student with same roll number
        other_user = User.objects.create_user(
            email="test_student2@presencone.com",
            password="test_password_123",
            role="STUDENT"
        )
        from django.db import IntegrityError
        with self.assertRaises(IntegrityError):
            StudentProfile.objects.create(
                user=other_user,
                roll_number="STU001",
                admission_number="ADM002",
                department=self.dept,
                course=self.course
            )
