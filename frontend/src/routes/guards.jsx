import React from 'react'
import { Navigate, useLocation, Outlet } from 'react-router-dom'
import { useSelector } from 'react-redux'

// Helper to get default dashboard path by user role
export const getDashboardPath = (role) => {
  switch (role) {
    case 'SUPER_ADMIN':
    case 'ADMIN':
      return '/dashboard' // We can have separate sub-routes or single dashboard that adapts
    case 'PRINCIPAL':
      return '/dashboard'
    case 'FACULTY':
      return '/dashboard'
    case 'STUDENT':
      return '/dashboard'
    case 'PARENT':
      return '/dashboard'
    default:
      return '/login'
  }
}

export const PrivateRoute = ({ allowedRoles = [] }) => {
  const { isAuthenticated, user } = useSelector((state) => state.auth)
  const location = useLocation()

  if (!isAuthenticated) {
    // Redirect to login but save the current location they tried to access
    return <Navigate to="/login" state={{ from: location }} replace />
  }

  if (allowedRoles.length > 0 && user && !allowedRoles.includes(user.role)) {
    // Authenticated but does not have the required role - redirect to unauthorized
    return <Navigate to="/unauthorized" replace />
  }

  return <Outlet />
}

export const PublicRoute = () => {
  const { isAuthenticated, user } = useSelector((state) => state.auth)
  const location = useLocation()

  if (isAuthenticated && user) {
    // Redirect to appropriate dashboard based on role
    const redirectPath = location.state?.from?.pathname || getDashboardPath(user.role)
    return <Navigate to={redirectPath} replace />
  }

  return <Outlet />
}
