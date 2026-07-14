from rest_framework import serializers
from .models import LeaveRequest

class LeaveRequestSerializer(serializers.ModelSerializer):
    user_name = serializers.CharField(source='user.get_full_name', read_only=True)
    user_email = serializers.CharField(source='user.email', read_only=True)
    user_role = serializers.CharField(source='user.role', read_only=True)
    approved_by_name = serializers.CharField(source='approved_by.get_full_name', read_only=True)

    class Meta:
        model = LeaveRequest
        fields = (
            'id', 'user', 'user_name', 'user_email', 'user_role',
            'leave_type', 'start_date', 'end_date', 'reason',
            'status', 'approved_by', 'approved_by_name',
            'approved_at', 'remarks', 'created_at', 'updated_at'
        )
        read_only_fields = ('user', 'status', 'approved_by', 'approved_at', 'remarks')


class LeaveApprovalSerializer(serializers.Serializer):
    status = serializers.ChoiceField(choices=(('APPROVED', 'Approved'), ('REJECTED', 'Rejected')), required=True)
    remarks = serializers.CharField(required=False, allow_blank=True, default='')
