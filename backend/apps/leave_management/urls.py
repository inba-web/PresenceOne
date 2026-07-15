from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import LeaveRequestViewSet, LeaveApprovalView

router = DefaultRouter()
router.register('requests', LeaveRequestViewSet, basename='leave-request')

urlpatterns = [
    path('', include(router.urls)),
    path('requests/<int:pk>/approve/', LeaveApprovalView.as_view(), name='leave-approve'),
]
