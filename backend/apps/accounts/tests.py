from django.urls import reverse
from rest_framework import status
from rest_framework.test import APITestCase
from django.contrib.auth import get_user_model

User = get_user_model()

class AccountsAuthTests(APITestCase):
    def setUp(self):
        # Create standard accounts with different roles
        self.admin_user = User.objects.create_superuser(
            email="admin@presencone.com",
            password="admin_secure_pass123",
            first_name="Admin",
            last_name="User"
        )
        self.student_user = User.objects.create_user(
            email="student@presencone.com",
            password="student_secure_pass123",
            role="STUDENT",
            first_name="Student",
            last_name="User"
        )
        self.faculty_user = User.objects.create_user(
            email="faculty@presencone.com",
            password="faculty_secure_pass123",
            role="FACULTY",
            first_name="Faculty",
            last_name="User"
        )
        
        self.login_url = reverse('token_obtain_pair')
        self.profile_url = reverse('user_profile')
        self.register_url = reverse('auth_register')

    def test_jwt_login_success(self):
        data = {
            "email": "student@presencone.com",
            "password": "student_secure_pass123"
        }
        response = self.client.post(self.login_url, data, format='json')
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertIn('access', response.data)
        self.assertIn('refresh', response.data)
        self.assertIn('user', response.data)
        self.assertEqual(response.data['user']['email'], "student@presencone.com")
        self.assertEqual(response.data['user']['role'], "STUDENT")

    def test_jwt_login_invalid_credentials(self):
        data = {
            "email": "student@presencone.com",
            "password": "wrong_password"
        }
        response = self.client.post(self.login_url, data, format='json')
        self.assertEqual(response.status_code, status.HTTP_401_UNAUTHORIZED)

    def test_profile_retrieval_authenticated(self):
        self.client.force_authenticate(user=self.student_user)
        response = self.client.get(self.profile_url)
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(response.data['email'], "student@presencone.com")
        self.assertEqual(response.data['role'], "STUDENT")

    def test_profile_retrieval_unauthenticated(self):
        response = self.client.get(self.profile_url)
        self.assertEqual(response.status_code, status.HTTP_401_UNAUTHORIZED)

    def test_profile_update(self):
        self.client.force_authenticate(user=self.student_user)
        data = {
            "first_name": "UpdatedName",
            "phone": "9876543210"
        }
        response = self.client.put(self.profile_url, data, format='json')
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(response.data['first_name'], "UpdatedName")
        self.assertEqual(response.data['phone'], "9876543210")
        
        # Verify read-only role protection
        data_attempt_role_change = {
            "role": "SUPER_ADMIN"
        }
        self.client.put(self.profile_url, data_attempt_role_change, format='json')
        self.student_user.refresh_from_db()
        self.assertEqual(self.student_user.role, "STUDENT")

    def test_admin_registration_endpoint_success(self):
        self.client.force_authenticate(user=self.admin_user)
        data = {
            "email": "new_user@presencone.com",
            "password": "new_secure_pass123",
            "role": "FACULTY",
            "first_name": "New",
            "last_name": "Faculty"
        }
        response = self.client.post(self.register_url, data, format='json')
        self.assertEqual(response.status_code, status.HTTP_201_CREATED)
        self.assertTrue(User.objects.filter(email="new_user@presencone.com").exists())

    def test_admin_registration_endpoint_forbidden_for_student(self):
        self.client.force_authenticate(user=self.student_user)
        data = {
            "email": "new_user2@presencone.com",
            "password": "new_secure_pass123",
            "role": "STUDENT"
        }
        response = self.client.post(self.register_url, data, format='json')
        self.assertEqual(response.status_code, status.HTTP_403_FORBIDDEN)
