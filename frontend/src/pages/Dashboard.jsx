import React from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { useNavigate, Link } from 'react-router-dom'
import { LogOut, User, LayoutDashboard, Shield, Activity, Calendar } from 'lucide-react'
import { logout } from '../store/slices/authSlice'
import { toast } from 'react-hot-toast'

export default function Dashboard() {
  const { user } = useSelector((state) => state.auth)
  const dispatch = useDispatch()
  const navigate = useNavigate()

  const handleLogout = () => {
    dispatch(logout())
    toast.success('Successfully logged out', {
      style: {
        borderRadius: '10px',
        background: '#1E293B',
        color: '#fff',
      },
    })
    navigate('/login')
  }

  return (
    <div className="space-y-8 py-8">
      {/* Top Banner */}
      <div className="p-8 rounded-2xl bg-gradient-to-r from-primary to-primary-light text-white shadow-soft relative overflow-hidden">
        <div className="absolute top-[-30%] right-[-10%] w-[40%] h-[150%] rounded-full bg-white/10 rotate-12" />
        <div className="space-y-2 relative z-10">
          <span className="text-xs font-semibold uppercase tracking-wider bg-white/20 px-3 py-1 rounded-full">
            Role: {user?.role?.replace('_', ' ')}
          </span>
          <h1 className="text-3xl font-extrabold tracking-tight">
            Welcome back, {user?.first_name || 'User'}!
          </h1>
          <p className="text-sm opacity-90 max-w-md">
            Enterprise Grade Attendance Management Platform. Switch roles, verify actions, and track user states.
          </p>
        </div>
      </div>

      {/* Main Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Profile summary card */}
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-6 rounded-2xl shadow-soft space-y-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-primary/10 text-primary flex items-center justify-center">
              <User className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-bold text-slate-900 dark:text-slate-100">User Profile</h3>
              <p className="text-xs text-slate-500 dark:text-slate-400">Personal metadata details</p>
            </div>
          </div>
          <div className="text-sm space-y-2 text-slate-600 dark:text-slate-350">
            <div>
              <span className="font-semibold text-slate-500">Name:</span> {user?.first_name} {user?.last_name}
            </div>
            <div>
              <span className="font-semibold text-slate-500">Email:</span> {user?.email}
            </div>
            <div>
              <span className="font-semibold text-slate-500">Phone:</span> {user?.phone || 'Not provided'}
            </div>
          </div>
          <div className="pt-4 border-t border-slate-100 dark:border-slate-800/80">
            <Link
              to="/profile"
              className="text-xs text-primary hover:underline font-semibold"
            >
              Edit Account Settings &rarr;
            </Link>
          </div>
        </div>

        {/* Roles Details */}
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-6 rounded-2xl shadow-soft space-y-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-success/10 text-success flex items-center justify-center">
              <Shield className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-bold text-slate-900 dark:text-slate-100">Permissions (RBAC)</h3>
              <p className="text-xs text-slate-500 dark:text-slate-400">Dynamic authorization</p>
            </div>
          </div>
          <div className="text-sm space-y-2 text-slate-600 dark:text-slate-350">
            <p className="text-xs">
              This sandbox is configured with dynamic auth layers. You can verify role restrictions using custom test accounts.
            </p>
            <div className="p-3 bg-slate-50 dark:bg-slate-950/40 rounded-xl border border-slate-200 dark:border-slate-850">
              <code className="text-xs text-primary font-mono">{user?.role}</code>
            </div>
          </div>
        </div>

        {/* Quick Actions */}
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-6 rounded-2xl shadow-soft space-y-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-warning/10 text-warning flex items-center justify-center">
              <Activity className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-bold text-slate-900 dark:text-slate-100">Quick Actions</h3>
              <p className="text-xs text-slate-500 dark:text-slate-400">Common actions</p>
            </div>
          </div>
          <div className="flex flex-col gap-2 pt-2">
            <Link
              to="/profile"
              className="w-full text-center py-2 bg-slate-50 dark:bg-slate-850 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg border border-slate-200 dark:border-slate-700 text-sm font-medium transition-colors"
            >
              Account Settings
            </Link>
            <button
              onClick={handleLogout}
              className="w-full py-2 bg-danger/10 hover:bg-danger/25 text-danger rounded-lg border border-danger/10 text-sm font-medium transition-colors flex items-center justify-center gap-1.5"
            >
              <LogOut className="w-4 h-4" />
              Sign Out
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
