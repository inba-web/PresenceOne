from rest_framework import serializers
from .models import AttendanceSession, AttendanceRecord
from apps.subjects.models import Subject
from apps.students.models import StudentProfile

class SubjectSerializer(serializers.ModelSerializer):
    course_name = serializers.CharField(source='course.name', read_only=True)
    
    class Meta:
        model = Subject
        fields = ('id', 'name', 'code', 'course', 'course_name', 'semester', 'credit_hours', 'description')


class AttendanceSessionSerializer(serializers.ModelSerializer):
    subject_code = serializers.CharField(source='subject.code', read_only=True)
    subject_name = serializers.CharField(source='subject.name', read_only=True)
    faculty_name = serializers.CharField(source='faculty.user.get_full_name', read_only=True)

    class Meta:
        model = AttendanceSession
        fields = ('id', 'subject', 'subject_code', 'subject_name', 'faculty', 'faculty_name', 'date', 'start_time', 'end_time', 'room_number', 'created_at')


class AttendanceRecordSerializer(serializers.ModelSerializer):
    student_name = serializers.CharField(source='student.user.get_full_name', read_only=True)
    student_roll = serializers.CharField(source='student.roll_number', read_only=True)
    student_email = serializers.CharField(source='student.user.email', read_only=True)

    class Meta:
        model = AttendanceRecord
        fields = ('id', 'student', 'student_name', 'student_roll', 'student_email', 'session', 'status', 'remarks', 'marked_by', 'created_at')


class BulkAttendanceRecordSerializer(serializers.Serializer):
    student_id = serializers.IntegerField(required=True)
    status = serializers.ChoiceField(choices=AttendanceRecord.STATUS_CHOICES, required=True)
    remarks = serializers.CharField(required=False, allow_blank=True, default='')


class BulkAttendanceMarkSerializer(serializers.Serializer):
    records = BulkAttendanceRecordSerializer(many=True, required=True)


class StudentProfileSerializer(serializers.ModelSerializer):
    student_name = serializers.CharField(source='user.get_full_name', read_only=True)
    student_email = serializers.CharField(source='user.email', read_only=True)
    department_name = serializers.CharField(source='department.name', read_only=True)
    course_name = serializers.CharField(source='course.name', read_only=True)

    class Meta:
        model = StudentProfile
        fields = ('id', 'student_name', 'student_email', 'roll_number', 'admission_number', 'department', 'department_name', 'course', 'course_name', 'current_semester')

