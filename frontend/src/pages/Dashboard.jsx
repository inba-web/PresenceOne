import React, { useState, useEffect } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { useNavigate, Link } from 'react-router-dom'
import { LogOut, User, LayoutDashboard, Shield, Activity, Calendar, Award, AlertTriangle, BookOpen, Clock, PlusCircle, CheckCircle, ShieldAlert } from 'lucide-react'
import { logout } from '../store/slices/authSlice'
import { toast } from 'react-hot-toast'
import attendanceService from '../services/attendanceService'

export default function Dashboard() {
  const { user } = useSelector((state) => state.auth)
  const dispatch = useDispatch()
  const navigate = useNavigate()

  // Student Attendance Stats States
  const [stats, setStats] = useState(null)
  const [isLoadingStats, setIsLoadingStats] = useState(false)

  useEffect(() => {
    if (user && user.role === 'STUDENT') {
      const fetchStudentStats = async () => {
        setIsLoadingStats(true)
        try {
          const data = await attendanceService.getStudentSummary()
          setStats(data)
        } catch (err) {
          toast.error('Failed to load attendance metrics.')
        } finally {
          setIsLoadingStats(false)
        }
      }
      fetchStudentStats()
    }
  }, [user])

  const handleLogout = () => {
    dispatch(logout())
    toast.success('Successfully logged out')
    navigate('/login')
  }

  // 1. RENDER STUDENT DASHBOARD
  if (user && user.role === 'STUDENT') {
    return (
      <div className="space-y-8 py-4">
        {/* Banner */}
        <div className="p-8 rounded-2xl bg-gradient-to-r from-primary to-primary-light text-white shadow-soft relative overflow-hidden">
          <div className="absolute top-[-30%] right-[-10%] w-[40%] h-[150%] rounded-full bg-white/10 rotate-12" />
          <div className="space-y-2 relative z-10">
            <span className="text-xs font-semibold uppercase tracking-wider bg-white/20 px-3 py-1 rounded-full">
              Student Dashboard
            </span>
            <h1 className="text-3xl font-extrabold tracking-tight">
              Hello, {user.first_name || 'Student'}!
            </h1>
            <p className="text-sm opacity-90 max-w-md">
              Here is your attendance progress summary for this semester. Maintain at least 75% to stay compliant.
            </p>
          </div>
        </div>

        {isLoadingStats ? (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {[1, 2, 3].map((n) => (
              <div key={n} className="h-32 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 animate-pulse rounded-2xl" />
            ))}
          </div>
        ) : stats ? (
          <>
            {/* Stats Overview */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              
              {/* Overall Pct */}
              <div className="bg-white dark:bg-slate-900 border border-slate-250 dark:border-slate-800 p-6 rounded-2xl shadow-soft flex items-center justify-between">
                <div className="space-y-1">
                  <span className="text-xs font-semibold text-slate-400 dark:text-slate-500 uppercase tracking-wider">Overall Attendance</span>
                  <h2 className="text-3xl font-black text-slate-800 dark:text-slate-100">{stats.overall?.percentage}%</h2>
                  <p className="text-[10px] text-slate-400 font-medium">Goal: 75.0%</p>
                </div>
                <div className="w-16 h-16 flex items-center justify-center relative">
                  <svg className="w-full h-full transform -rotate-90">
                    <circle cx="32" cy="32" r="28" className="stroke-slate-100 dark:stroke-slate-800 fill-none" strokeWidth="4" />
                    <circle
                      cx="32"
                      cy="32"
                      r="28"
                      className="stroke-primary fill-none transition-all duration-500"
                      strokeWidth="4"
                      strokeDasharray={2 * Math.PI * 28}
                      strokeDashoffset={(2 * Math.PI * 28) * (1 - (stats.overall?.percentage || 100) / 100)}
                    />
                  </svg>
                  <span className="absolute text-[10px] font-black text-primary">%</span>
                </div>
              </div>

              {/* Total Lectures */}
              <div className="bg-white dark:bg-slate-900 border border-slate-250 dark:border-slate-800 p-6 rounded-2xl shadow-soft">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-success/15 text-success flex items-center justify-center">
                    <CheckCircle className="w-5 h-5" />
                  </div>
                  <div>
                    <span className="text-xs font-semibold text-slate-400 dark:text-slate-500 uppercase tracking-wider block">Present Sessions</span>
                    <span className="text-2xl font-black">{stats.overall?.present_sessions} <span className="text-xs text-slate-400">/ {stats.overall?.total_sessions}</span></span>
                  </div>
                </div>
              </div>

              {/* Absences */}
              <div className="bg-white dark:bg-slate-900 border border-slate-250 dark:border-slate-800 p-6 rounded-2xl shadow-soft">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-danger/15 text-danger flex items-center justify-center">
                    <ShieldAlert className="w-5 h-5" />
                  </div>
                  <div>
                    <span className="text-xs font-semibold text-slate-400 dark:text-slate-500 uppercase tracking-wider block">Absent Sessions</span>
                    <span className="text-2xl font-black">{stats.overall?.absent_sessions}</span>
                  </div>
                </div>
              </div>

              {/* Compliance Status */}
              <div className="bg-white dark:bg-slate-900 border border-slate-250 dark:border-slate-800 p-6 rounded-2xl shadow-soft">
                <div className="flex items-center gap-3">
                  {stats.overall?.percentage >= 75 ? (
                    <div className="w-10 h-10 rounded-xl bg-success/15 text-success flex items-center justify-center">
                      <Award className="w-5 h-5" />
                    </div>
                  ) : (
                    <div className="w-10 h-10 rounded-xl bg-warning/15 text-warning flex items-center justify-center">
                      <AlertTriangle className="w-5 h-5" />
                    </div>
                  )}
                  <div>
                    <span className="text-xs font-semibold text-slate-400 dark:text-slate-500 uppercase tracking-wider block">Status</span>
                    <span className={`text-base font-bold uppercase ${stats.overall?.percentage >= 75 ? 'text-success' : 'text-danger'}`}>
                      {stats.overall?.percentage >= 75 ? 'Good Standing' : 'Shortage Alert'}
                    </span>
                  </div>
                </div>
              </div>

            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              
              {/* Subject Breakdown */}
              <div className="lg:col-span-2 bg-white dark:bg-slate-900 border border-slate-250 dark:border-slate-800 rounded-2xl p-6 shadow-soft space-y-4">
                <h3 className="font-bold text-lg flex items-center gap-2">
                  <BookOpen className="w-5 h-5 text-primary" />
                  Syllabus Metrics
                </h3>

                <div className="space-y-4">
                  {stats.subjects?.map((sub) => (
                    <div key={sub.subject_id} className="space-y-2">
                      <div className="flex justify-between text-sm">
                        <div>
                          <span className="font-bold text-slate-800 dark:text-slate-100">{sub.subject_name}</span>
                          <span className="ml-2 text-xs font-mono text-slate-400 bg-slate-50 dark:bg-slate-950/40 px-1.5 py-0.5 rounded border border-slate-200/50 dark:border-slate-850">{sub.subject_code}</span>
                        </div>
                        <span className="font-bold text-primary">{sub.percentage}%</span>
                      </div>
                      
                      <div className="w-full bg-slate-100 dark:bg-slate-800/80 rounded-full h-2">
                        <div
                          className={`h-2 rounded-full transition-all ${sub.percentage >= 75 ? 'bg-success' : 'bg-danger'}`}
                          style={{ width: `${sub.percentage}%` }}
                        />
                      </div>
                      <div className="flex justify-between text-[10px] text-slate-400 font-semibold">
                        <span>Attended: {sub.present_sessions} / {sub.total_sessions}</span>
                        <span>{sub.percentage >= 75 ? '✅ Compliant' : '⚠️ Danger'}</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Recent Attendance Logs */}
              <div className="lg:col-span-1 bg-white dark:bg-slate-900 border border-slate-250 dark:border-slate-800 rounded-2xl p-6 shadow-soft space-y-4">
                <h3 className="font-bold text-lg flex items-center gap-2">
                  <Clock className="w-5 h-5 text-primary" />
                  Recent Check-ins
                </h3>

                <div className="space-y-3.5">
                  {stats.recent?.length === 0 ? (
                    <p className="text-xs text-slate-400 text-center py-6">No recent logs available.</p>
                  ) : (
                    stats.recent?.map((log, index) => {
                      let statusBadge = ''
                      if (log.status === 'PRESENT') statusBadge = 'bg-success/15 text-success'
                      if (log.status === 'ABSENT') statusBadge = 'bg-danger/15 text-danger'
                      if (log.status === 'LATE') statusBadge = 'bg-warning/15 text-warning'
                      if (log.status === 'EXCUSED') statusBadge = 'bg-primary/15 text-primary'

                      return (
                        <div key={index} className="flex justify-between items-center p-3 rounded-xl border border-slate-100 dark:border-slate-850 hover:bg-slate-50 dark:hover:bg-slate-950/20 transition-colors">
                          <div className="text-left space-y-0.5">
                            <span className="text-xs font-bold font-mono text-slate-400">{log.subject_code}</span>
                            <p className="text-xs text-slate-500 font-medium">{log.date}</p>
                          </div>
                          <span className={`px-2.5 py-1 text-[10px] font-black uppercase rounded ${statusBadge}`}>
                            {log.status}
                          </span>
                        </div>
                      )
                    })
                  )}
                </div>
              </div>

            </div>
          </>
        ) : (
          <p className="text-sm text-slate-400">Failed to render student summary details.</p>
        )}
      </div>
    )
  }

  // 2. RENDER FACULTY & ADMIN DASHBOARD
  return (
    <div className="space-y-8 py-4">
      {/* Top Banner */}
      <div className="p-8 rounded-2xl bg-gradient-to-r from-primary to-primary-light text-white shadow-soft relative overflow-hidden">
        <div className="absolute top-[-30%] right-[-10%] w-[40%] h-[150%] rounded-full bg-white/10 rotate-12" />
        <div className="space-y-2 relative z-10">
          <span className="text-xs font-semibold uppercase tracking-wider bg-white/20 px-3 py-1 rounded-full">
            Staff Dashboard
          </span>
          <h1 className="text-3xl font-extrabold tracking-tight">
            Welcome back, {user?.first_name || 'Staff'}!
          </h1>
          <p className="text-sm opacity-90 max-w-md">
            Manage attendance sessions, generate reports, and record student logs.
          </p>
        </div>
      </div>

      {/* Main Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        
        {/* Profile Card */}
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-6 rounded-2xl shadow-soft space-y-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-primary/10 text-primary flex items-center justify-center">
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
              <span className="font-semibold text-slate-500">Role:</span> {user?.role?.replace('_', ' ')}
            </div>
          </div>
        </div>

        {/* Permissions */}
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-6 rounded-2xl shadow-soft space-y-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-success/15 text-success flex items-center justify-center">
              <Shield className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-bold text-slate-900 dark:text-slate-100">Permissions (RBAC)</h3>
              <p className="text-xs text-slate-500 dark:text-slate-400">Dynamic authorization</p>
            </div>
          </div>
          <div className="text-sm space-y-2 text-slate-600 dark:text-slate-350">
            <p className="text-xs leading-relaxed">
              Your staff account is configured with full administrative and attendance roll call capabilities.
            </p>
            <div className="p-2.5 bg-slate-50 dark:bg-slate-950/40 rounded-xl border border-slate-200 dark:border-slate-850">
              <code className="text-xs text-primary font-mono">{user?.role}</code>
            </div>
          </div>
        </div>

        {/* Quick Actions */}
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-6 rounded-2xl shadow-soft space-y-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-warning/15 text-warning flex items-center justify-center">
              <Activity className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-bold text-slate-900 dark:text-slate-100">Quick Actions</h3>
              <p className="text-xs text-slate-500 dark:text-slate-400">Common shortcuts</p>
            </div>
          </div>
          <div className="flex flex-col gap-2 pt-2">
            {user && (user.role === 'FACULTY' || user.role === 'ADMIN' || user.role === 'SUPER_ADMIN') && (
              <Link
                to="/attendance"
                className="w-full text-center py-2.5 bg-primary hover:bg-primary-dark text-white rounded-xl border border-primary/10 text-sm font-bold shadow-soft transition-colors flex items-center justify-center gap-1.5"
              >
                <PlusCircle className="w-4 h-4" />
                Record Attendance
              </Link>
            )}
            <button
              onClick={handleLogout}
              className="w-full py-2.5 bg-danger/10 hover:bg-danger/25 text-danger rounded-xl border border-danger/10 text-sm font-bold transition-colors flex items-center justify-center gap-1.5"
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
