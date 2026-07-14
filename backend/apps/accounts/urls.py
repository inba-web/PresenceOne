from django.urls import path
from rest_framework_simplejwt.views import TokenRefreshView
from .views import (
    CustomTokenObtainPairView,
    UserRegistrationView,
    UserProfileView,
    LogoutView,
    PasswordChangeView,
    PasswordResetRequestView,
    PasswordResetConfirmView,
)

urlpatterns = [
    path('login/', CustomTokenObtainPairView.as_view(), name='token_obtain_pair'),
    path('refresh/', TokenRefreshView.as_view(), name='token_refresh'),
    path('logout/', LogoutView.as_view(), name='auth_logout'),
    path('register/', UserRegistrationView.as_view(), name='auth_register'),
    path('profile/', UserProfileView.as_view(), name='user_profile'),
    path('change-password/', PasswordChangeView.as_view(), name='change_password'),
    path('reset-password/', PasswordResetRequestView.as_view(), name='reset_password_request'),
    path('reset-password/confirm/', PasswordResetConfirmView.as_view(), name='reset_password_confirm'),
]
