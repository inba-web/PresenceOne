from rest_framework import permissions

class HasRole(permissions.BasePermission):
    """
    Allows access only to users with specific roles.
    Can be subclassed or instantiated with custom roles.
    """
    allowed_roles = []

    def has_permission(self, request, view):
        if not request.user or not request.user.is_authenticated:
            return False
        return request.user.role in self.allowed_roles


class IsSuperAdmin(permissions.BasePermission):
    def has_permission(self, request, view):
        return request.user and request.user.is_authenticated and request.user.role == 'SUPER_ADMIN'


class IsAdmin(permissions.BasePermission):
    def has_permission(self, request, view):
        return request.user and request.user.is_authenticated and request.user.role in ['SUPER_ADMIN', 'ADMIN']


class IsPrincipal(permissions.BasePermission):
    def has_permission(self, request, view):
        return request.user and request.user.is_authenticated and request.user.role in ['SUPER_ADMIN', 'ADMIN', 'PRINCIPAL']


class IsFaculty(permissions.BasePermission):
    def has_permission(self, request, view):
        return request.user and request.user.is_authenticated and request.user.role in ['SUPER_ADMIN', 'ADMIN', 'PRINCIPAL', 'FACULTY']


class IsStudent(permissions.BasePermission):
    def has_permission(self, request, view):
        return request.user and request.user.is_authenticated and request.user.role == 'STUDENT'


class IsParent(permissions.BasePermission):
    def has_permission(self, request, view):
        return request.user and request.user.is_authenticated and request.user.role == 'PARENT'


from functools import wraps
from django.core.exceptions import PermissionDenied

def role_required(roles):
    """
    Decorator for function-based views to enforce role-based access.
    """
    def decorator(view_func):
        @wraps(view_func)
        def _wrapped_view(request, *args, **kwargs):
            if not request.user or not request.user.is_authenticated or request.user.role not in roles:
                raise PermissionDenied("You do not have permission to access this resource.")
            return view_func(request, *args, **kwargs)
        return _wrapped_view
    return decorator


def RoleRequired(roles):
    """
    Class factory for DRF class-based views.
    """
    class DynamicRolePermission(permissions.BasePermission):
        def has_permission(self, request, view):
            return request.user and request.user.is_authenticated and request.user.role in roles
    return DynamicRolePermission

