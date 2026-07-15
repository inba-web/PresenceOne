from rest_framework import serializers
from rest_framework_simplejwt.serializers import TokenObtainPairSerializer
from django.contrib.auth import get_user_model

User = get_user_model()

class CustomTokenObtainPairSerializer(TokenObtainPairSerializer):
    @classmethod
    def get_token(cls, user):
        token = super().get_token(user)
        # Add custom claims to JWT token payload
        token['email'] = user.email
        token['role'] = user.role
        token['first_name'] = user.first_name
        token['last_name'] = user.last_name
        return token

    def validate(self, attrs):
        data = super().validate(attrs)
        # Add extra details in the API JSON response
        data['user'] = {
            'id': self.user.id,
            'email': self.user.email,
            'role': self.user.role,
            'first_name': self.user.first_name,
            'last_name': self.user.last_name,
            'phone': self.user.phone,
        }
        return data


class UserRegistrationSerializer(serializers.ModelSerializer):
    password = serializers.CharField(write_only=True, required=True, style={'input_type': 'password'})

    class Meta:
        model = User
        fields = ('id', 'email', 'password', 'role', 'first_name', 'last_name', 'phone')

    def validate_email(self, value):
        if User.objects.filter(email=value).exists():
            raise serializers.ValidationError("A user with this email already exists.")
        return value

    def create(self, validated_data):
        user = User.objects.create_user(
            email=validated_data['email'],
            password=validated_data['password'],
            role=validated_data.get('role', 'STUDENT'),
            first_name=validated_data.get('first_name', ''),
            last_name=validated_data.get('last_name', ''),
            phone=validated_data.get('phone', ''),
        )
        return user


class UserProfileSerializer(serializers.ModelSerializer):
    class Meta:
        model = User
        fields = ('id', 'email', 'role', 'first_name', 'last_name', 'phone', 'is_two_factor_enabled')
        read_only_fields = ('id', 'email', 'role')


class PasswordChangeSerializer(serializers.Serializer):
    old_password = serializers.CharField(required=True)
    new_password = serializers.CharField(required=True, min_length=8)

    def validate_old_password(self, value):
        user = self.context['request'].user
        if not user.check_password(value):
            raise serializers.ValidationError("Old password is incorrect.")
        return value


class PasswordResetRequestSerializer(serializers.Serializer):
    email = serializers.EmailField(required=True)


class PasswordResetSerializer(serializers.Serializer):
    uidb64 = serializers.CharField(required=True)
    token = serializers.CharField(required=True)
    new_password = serializers.CharField(required=True, min_length=8)

    def validate(self, attrs):
        from django.utils.http import urlsafe_base64_decode
        from django.utils.encoding import force_str
        from django.contrib.auth.tokens import default_token_generator
        
        try:
            uid = force_str(urlsafe_base64_decode(attrs['uidb64']))
            user = User.objects.get(pk=uid)
        except (TypeError, ValueError, OverflowError, User.DoesNotExist):
            raise serializers.ValidationError({"detail": "Invalid reset link."})

        if not default_token_generator.check_token(user, attrs['token']):
            raise serializers.ValidationError({"detail": "Token is invalid or expired."})

        self.context['user'] = user
        return attrs


class StudentSignupSerializer(serializers.Serializer):
    email = serializers.EmailField()
    password = serializers.CharField(write_only=True, min_length=8)
    first_name = serializers.CharField(required=True)
    last_name = serializers.CharField(required=True)
    phone = serializers.CharField(required=False, allow_blank=True, default='')
    
    roll_number = serializers.CharField()
    admission_number = serializers.CharField()
    department = serializers.IntegerField(required=False, allow_null=True)
    course = serializers.IntegerField(required=False, allow_null=True)
    current_semester = serializers.IntegerField(required=False, default=1)
    date_of_birth = serializers.DateField(required=False, allow_null=True)

    def validate_email(self, value):
        if User.objects.filter(email=value).exists():
            raise serializers.ValidationError("A user with this email already exists.")
        return value

    def create(self, validated_data):
        from django.db import transaction
        from apps.students.models import StudentProfile
        from apps.departments.models import Department
        from apps.courses.models import Course

        with transaction.atomic():
            user = User.objects.create_user(
                email=validated_data['email'],
                password=validated_data['password'],
                role='STUDENT',
                first_name=validated_data['first_name'],
                last_name=validated_data['last_name'],
                phone=validated_data.get('phone', ''),
            )
            
            dept = None
            if validated_data.get('department'):
                try:
                    dept = Department.objects.get(pk=validated_data['department'])
                except Department.DoesNotExist:
                    pass

            course = None
            if validated_data.get('course'):
                try:
                    course = Course.objects.get(pk=validated_data['course'])
                except Course.DoesNotExist:
                    pass

            StudentProfile.objects.create(
                user=user,
                roll_number=validated_data['roll_number'],
                admission_number=validated_data['admission_number'],
                department=dept,
                course=course,
                current_semester=validated_data.get('current_semester', 1),
                date_of_birth=validated_data.get('date_of_birth'),
            )
            return user


class FacultySignupSerializer(serializers.Serializer):
    email = serializers.EmailField()
    password = serializers.CharField(write_only=True, min_length=8)
    first_name = serializers.CharField(required=True)
    last_name = serializers.CharField(required=True)
    phone = serializers.CharField(required=False, allow_blank=True, default='')
    
    employee_id = serializers.CharField()
    designation = serializers.CharField(required=False, allow_blank=True, default='')
    department = serializers.IntegerField(required=False, allow_null=True)
    joining_date = serializers.DateField(required=False, allow_null=True)

    def validate_email(self, value):
        if User.objects.filter(email=value).exists():
            raise serializers.ValidationError("A user with this email already exists.")
        return value

    def create(self, validated_data):
        from django.db import transaction
        from apps.faculty.models import FacultyProfile
        from apps.departments.models import Department

        with transaction.atomic():
            user = User.objects.create_user(
                email=validated_data['email'],
                password=validated_data['password'],
                role='FACULTY',
                first_name=validated_data['first_name'],
                last_name=validated_data['last_name'],
                phone=validated_data.get('phone', ''),
            )
            
            dept = None
            if validated_data.get('department'):
                try:
                    dept = Department.objects.get(pk=validated_data['department'])
                except Department.DoesNotExist:
                    pass

            FacultyProfile.objects.create(
                user=user,
                employee_id=validated_data['employee_id'],
                designation=validated_data.get('designation', ''),
                department=dept,
                joining_date=validated_data.get('joining_date'),
            )
            return user


