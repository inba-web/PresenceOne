import random
from datetime import datetime, timedelta
from django.core.management.base import BaseCommand
from django.contrib.auth import get_user_model
from django.utils import timezone
from apps.departments.models import Department
from apps.courses.models import Course
from apps.subjects.models import Subject
from apps.faculty.models import FacultyProfile
from apps.students.models import StudentProfile
from apps.attendance.models import AttendanceSession, AttendanceRecord
from apps.leave_management.models import LeaveRequest
from apps.notifications.models import Notification

User = get_user_model()

class Command(BaseCommand):
    help = 'Seeds initial core system database with departments, courses, subjects, profiles, and attendance data'

    def handle(self, *args, **kwargs):
        self.stdout.write("Initializing system database seeding...")

        # 1. Create Departments
        depts_data = [
            {"code": "CSE", "name": "Computer Science & Engineering", "description": "Department of CS & AI"},
            {"code": "ECE", "name": "Electronics & Communication Engineering", "description": "Department of ECE & IoT"},
        ]
        departments = {}
        for dept in depts_data:
            obj, created = Department.objects.get_or_create(code=dept["code"], defaults=dept)
            departments[dept["code"]] = obj
            if created:
                self.stdout.write(self.style.SUCCESS(f"Created Department: {dept['code']}"))

        # 2. Create Courses
        courses_data = [
            {
                "code": "BTECH_CSE",
                "name": "B.Tech Computer Science",
                "department": departments["CSE"],
                "duration_years": 4,
                "total_semesters": 8
            },
            {
                "code": "BTECH_ECE",
                "name": "B.Tech Electronics",
                "department": departments["ECE"],
                "duration_years": 4,
                "total_semesters": 8
            },
        ]
        courses = {}
        for course in courses_data:
            obj, created = Course.objects.get_or_create(code=course["code"], defaults=course)
            courses[course["code"]] = obj
            if created:
                self.stdout.write(self.style.SUCCESS(f"Created Course: {course['code']}"))

        # 3. Create Subjects
        subjects_data = [
            {"code": "CS101", "name": "Introduction to Programming", "course": courses["BTECH_CSE"], "semester": 1, "credit_hours": 4},
            {"code": "MA101", "name": "Engineering Mathematics I", "course": courses["BTECH_CSE"], "semester": 1, "credit_hours": 4},
            {"code": "CS201", "name": "Data Structures & Algorithms", "course": courses["BTECH_CSE"], "semester": 2, "credit_hours": 4},
            {"code": "CS202", "name": "Digital Electronics", "course": courses["BTECH_CSE"], "semester": 2, "credit_hours": 3},
            {"code": "EC101", "name": "Basic Electronics", "course": courses["BTECH_ECE"], "semester": 1, "credit_hours": 4},
            {"code": "EC201", "name": "Signals & Systems", "course": courses["BTECH_ECE"], "semester": 2, "credit_hours": 4},
        ]
        subjects = {}
        for sub in subjects_data:
            obj, created = Subject.objects.get_or_create(code=sub["code"], defaults=sub)
            subjects[sub["code"]] = obj
            if created:
                self.stdout.write(self.style.SUCCESS(f"Created Subject: {sub['code']}"))

        # 4. Faculty Profiles
        # Check primary faculty
        marcus_user = User.objects.filter(email="faculty@presencone.com").first()
        if marcus_user:
            marcus_profile, created = FacultyProfile.objects.get_or_create(
                user=marcus_user,
                defaults={
                    "employee_id": "EMP_CSE_01",
                    "designation": "Associate Professor",
                    "department": departments["CSE"],
                    "joining_date": datetime.now().date() - timedelta(days=365)
                }
            )
            if created:
                self.stdout.write(self.style.SUCCESS(f"Linked profile for primary Faculty: {marcus_user.email}"))
        else:
            self.stdout.write(self.style.WARNING("Primary faculty user not found. Ensure seed_users ran first."))

        # Create ECE faculty
        ece_fac_email = "faculty2@presencone.com"
        ece_fac_user, created = User.objects.get_or_create(
            email=ece_fac_email,
            defaults={
                "username": ece_fac_email,
                "role": "FACULTY",
                "first_name": "Diana",
                "last_name": "Professor",
                "phone": "+15550250",
            }
        )
        if created:
            ece_fac_user.set_password("faculty_password_123")
            ece_fac_user.save()
        ece_fac_profile, created = FacultyProfile.objects.get_or_create(
            user=ece_fac_user,
            defaults={
                "employee_id": "EMP_ECE_02",
                "designation": "Senior Lecturer",
                "department": departments["ECE"],
                "joining_date": datetime.now().date() - timedelta(days=200)
            }
        )
        if created:
            self.stdout.write(self.style.SUCCESS(f"Created ECE Faculty: {ece_fac_email}"))

        # 5. Student Profiles
        # Link primary student
        emily_user = User.objects.filter(email="student@presencone.com").first()
        primary_student_profile = None
        if emily_user:
            primary_student_profile, created = StudentProfile.objects.get_or_create(
                user=emily_user,
                defaults={
                    "roll_number": "STU_CSE_2026_01",
                    "admission_number": "ADM_2026_1001",
                    "department": departments["CSE"],
                    "course": courses["BTECH_CSE"],
                    "current_semester": 1,
                    "date_of_birth": datetime.now().date() - timedelta(days=365 * 19),
                    "enrollment_date": datetime.now().date() - timedelta(days=120),
                    "guardian_name": "John Learner",
                    "guardian_phone": "+15559876",
                }
            )
            if created:
                self.stdout.write(self.style.SUCCESS(f"Linked profile for primary Student: {emily_user.email}"))
        else:
            self.stdout.write(self.style.WARNING("Primary student user not found."))

        # Create additional student batch for CS class
        first_names = ["James", "Robert", "John", "Michael", "David", "William", "Richard", "Thomas", "Charles", "Daniel", "Matthew", "Anthony", "Patricia", "Jennifer", "Linda", "Elizabeth", "Barbara", "Susan", "Jessica", "Sarah"]
        last_names = ["Smith", "Johnson", "Williams", "Brown", "Jones", "Garcia", "Miller", "Davis", "Rodriguez", "Martinez", "Hernandez", "Lopez", "Gonzalez", "Wilson", "Anderson", "Thomas", "Taylor", "Moore", "Jackson", "Martin"]
        
        student_profiles = []
        if primary_student_profile:
            student_profiles.append(primary_student_profile)

        for i in range(1, 16):
            std_email = f"student{i}@presencone.com"
            std_user, created = User.objects.get_or_create(
                email=std_email,
                defaults={
                    "username": std_email,
                    "role": "STUDENT",
                    "first_name": random.choice(first_names),
                    "last_name": random.choice(last_names),
                    "phone": f"+155510{i:02d}",
                }
            )
            if created:
                std_user.set_password("student_password_123")
                std_user.save()

            std_profile, created = StudentProfile.objects.get_or_create(
                user=std_user,
                defaults={
                    "roll_number": f"STU_CSE_2026_{i+1:02d}",
                    "admission_number": f"ADM_2026_{1001+i}",
                    "department": departments["CSE"],
                    "course": courses["BTECH_CSE"],
                    "current_semester": 1,
                    "date_of_birth": datetime.now().date() - timedelta(days=365 * (18 + random.randint(0, 3))),
                    "enrollment_date": datetime.now().date() - timedelta(days=120),
                    "guardian_name": f"Guardian {i}",
                    "guardian_phone": f"+155590{i:02d}",
                }
            )
            student_profiles.append(std_profile)
            if created:
                self.stdout.write(self.style.SUCCESS(f"Created Student: {std_email}"))

        # 6. Seed Attendance Sessions & Records
        self.stdout.write("Generating mock attendance sessions and records...")
        cse_faculty = FacultyProfile.objects.filter(user__role="FACULTY", department__code="CSE").first()
        cs101_subject = subjects["CS101"]

        # Loop over past 10 weekdays
        current_date = datetime.now().date()
        days_processed = 0
        while days_processed < 10:
            current_date -= timedelta(days=1)
            # Skip weekends (Saturday=5, Sunday=6)
            if current_date.weekday() >= 5:
                continue
            
            # Create session for CS101
            session, session_created = AttendanceSession.objects.get_or_create(
                subject=cs101_subject,
                faculty=cse_faculty,
                date=current_date,
                defaults={
                    "start_time": datetime.strptime("09:00:00", "%H:%M:%S").time(),
                    "end_time": datetime.strptime("10:00:00", "%H:%M:%S").time(),
                    "room_number": "Room 302",
                }
            )
            days_processed += 1

            if session_created:
                # Mark attendance records for all students
                for std_prof in student_profiles:
                    # Random status weighted: 85% Present, 10% Absent, 5% Late
                    status_choice = random.choices(
                        ['PRESENT', 'ABSENT', 'LATE'],
                        weights=[85, 10, 5],
                        k=1
                    )[0]
                    
                    AttendanceRecord.objects.get_or_create(
                        student=std_prof,
                        session=session,
                        defaults={
                            "status": status_choice,
                            "remarks": "Automated seed record",
                            "marked_by": cse_faculty.user if cse_faculty else None
                        }
                    )

        # 7. Seed Leave Requests
        self.stdout.write("Generating leave requests...")
        if len(student_profiles) > 2:
            admin_user = User.objects.filter(role="ADMIN").first()
            for k in range(3):
                std_prof = student_profiles[k]
                leave_start = datetime.now().date() + timedelta(days=random.randint(1, 5))
                leave_end = leave_start + timedelta(days=random.randint(1, 3))
                LeaveRequest.objects.get_or_create(
                    user=std_prof.user,
                    start_date=leave_start,
                    end_date=leave_end,
                    defaults={
                        "leave_type": random.choice(["SICK", "CASUAL", "MEDICAL"]),
                        "reason": f"Need leave due to health issue {k}",
                        "status": "APPROVED" if k < 2 else "PENDING",
                        "approved_by": admin_user if k < 2 else None,
                        "approved_at": timezone.now() if k < 2 else None,
                        "remarks": "Approved by Administrator" if k < 2 else ""
                    }
                )

        # 8. Seed Notifications
        self.stdout.write("Generating notifications...")
        for std_prof in student_profiles[:3]:
            Notification.objects.get_or_create(
                recipient=std_prof.user,
                title="Attendance Shortage Warning",
                defaults={
                    "message": "Your attendance in Engineering Mathematics is below 75%. Please attend classes regularly.",
                    "notification_type": "ATTENDANCE",
                    "is_read": False
                }
            )

        self.stdout.write(self.style.SUCCESS("Database seeding completed successfully!"))
