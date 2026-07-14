from django.core.management.base import BaseCommand
from django.contrib.auth import get_user_model

User = get_user_model()

class Command(BaseCommand):
    help = 'Seeds initial test users with different enterprise roles'

    def handle(self, *args, **kwargs):
        users_data = [
            {
                "email": "admin@presencone.com",
                "password": "admin_password_123",
                "role": "ADMIN",
                "first_name": "Sarah",
                "last_name": "Admin",
                "phone": "+15550100",
                "is_superuser": False,
                "is_staff": True,
            },
            {
                "email": "superadmin@presencone.com",
                "password": "super_password_123",
                "role": "SUPER_ADMIN",
                "first_name": "Alex",
                "last_name": "Super",
                "phone": "+15550199",
                "is_superuser": True,
                "is_staff": True,
            },
            {
                "email": "faculty@presencone.com",
                "password": "faculty_password_123",
                "role": "FACULTY",
                "first_name": "Marcus",
                "last_name": "Teacher",
                "phone": "+15550150",
                "is_superuser": False,
                "is_staff": False,
            },
            {
                "email": "student@presencone.com",
                "password": "student_password_123",
                "role": "STUDENT",
                "first_name": "Emily",
                "last_name": "Learner",
                "phone": "+15550122",
                "is_superuser": False,
                "is_staff": False,
            },
            {
                "email": "parent@presencone.com",
                "password": "parent_password_123",
                "role": "PARENT",
                "first_name": "John",
                "last_name": "Guardian",
                "phone": "+15550188",
                "is_superuser": False,
                "is_staff": False,
            }
        ]

        for u_data in users_data:
            email = u_data["email"]
            if not User.objects.filter(email=email).exists():
                user = User.objects.create_user(
                    email=email,
                    password=u_data["password"],
                    role=u_data["role"],
                    first_name=u_data["first_name"],
                    last_name=u_data["last_name"],
                    phone=u_data["phone"],
                    is_superuser=u_data["is_superuser"],
                    is_staff=u_data["is_staff"]
                )
                self.stdout.write(self.style.SUCCESS(f"Created user: {email} with role {u_data['role']}"))
            else:
                self.stdout.write(self.style.WARNING(f"User {email} already exists, skipping..."))
