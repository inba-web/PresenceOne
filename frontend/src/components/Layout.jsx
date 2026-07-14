import React, { useState, useEffect } from 'react'
import { Outlet, Link, useLocation, useNavigate } from 'react-router-dom'
import { useDispatch, useSelector } from 'react-redux'
import { motion, AnimatePresence } from 'framer-motion'
import {
  LayoutDashboard,
  Users,
  Building2,
  BookOpen,
  CalendarDays,
  FileSpreadsheet,
  Settings as SettingsIcon,
  LogOut,
  Menu,
  X,
  Sun,
  Moon,
  ChevronDown,
  Activity,
  Bell
} from 'lucide-react'
import { logout } from '../store/slices/authSlice'
import { toast } from 'react-hot-toast'

export default function Layout() {
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const [userDropdownOpen, setUserDropdownOpen] = useState(false)
  const [darkMode, setDarkMode] = useState(localStorage.getItem('theme') === 'dark')
  
  const { user } = useSelector((state) => state.auth)
  const dispatch = useDispatch()
  const navigate = useNavigate()
  const location = useLocation()

  useEffect(() => {
    if (darkMode) {
      document.documentElement.classList.add('dark')
      localStorage.setItem('theme', 'dark')
    } else {
      document.documentElement.classList.remove('dark')
      localStorage.setItem('theme', 'light')
    }
  }, [darkMode])

  // Custom global logout handler dispatched from axios interceptors
  useEffect(() => {
    const handleGlobalLogout = () => {
      dispatch(logout())
      navigate('/login')
    }
    window.addEventListener('auth-logout', handleGlobalLogout)
    return () => window.removeEventListener('auth-logout', handleGlobalLogout)
  }, [dispatch, navigate])

  const handleLogout = () => {
    dispatch(logout())
    toast.success('Signed out successfully')
    navigate('/login')
  }

  const navItems = [
    { name: 'Dashboard', path: '/dashboard', icon: LayoutDashboard },
    { name: 'Students', path: '/students', icon: Users, role: ['SUPER_ADMIN', 'ADMIN', 'PRINCIPAL', 'FACULTY'] },
    { name: 'Faculty', path: '/faculty', icon: Users, role: ['SUPER_ADMIN', 'ADMIN', 'PRINCIPAL'] },
    { name: 'Departments', path: '/departments', icon: Building2, role: ['SUPER_ADMIN', 'ADMIN'] },
    { name: 'Courses', path: '/courses', icon: BookOpen, role: ['SUPER_ADMIN', 'ADMIN'] },
    { name: 'Attendance', path: '/attendance', icon: CalendarDays },
    { name: 'Leave Requests', path: '/leaves', icon: FileSpreadsheet },
    { name: 'Profile Settings', path: '/profile', icon: SettingsIcon },
  ]

  const filteredNavItems = navItems.filter(
    (item) => !item.role || (user && item.role.includes(user.role))
  )

  return (
    <div className="min-h-screen bg-bg-light dark:bg-bg-dark text-slate-800 dark:text-slate-100 flex flex-col md:flex-row transition-colors duration-200">
      
      {/* Mobile Top Bar */}
      <div className="md:hidden bg-white dark:bg-slate-900 border-b border-slate-200 dark:border-slate-800/80 px-4 h-16 flex items-center justify-between sticky top-0 z-50">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-lg bg-primary flex items-center justify-center text-white font-bold text-lg shadow-soft">
            P
          </div>
          <span className="font-extrabold tracking-tight bg-gradient-to-r from-primary to-primary-light bg-clip-text text-transparent">
            PresencOne
          </span>
        </div>
        <button
          onClick={() => setSidebarOpen(!sidebarOpen)}
          className="p-2 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-850"
        >
          {sidebarOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
        </button>
      </div>

      {/* Sidebar Navigation */}
      <aside
        className={`fixed inset-y-0 left-0 z-40 w-64 bg-white dark:bg-slate-900 border-r border-slate-200 dark:border-slate-800/80 flex flex-col justify-between transform transition-transform duration-300 md:translate-x-0 md:static ${
          sidebarOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        <div className="flex flex-col flex-grow">
          {/* Logo */}
          <div className="h-16 flex items-center gap-2.5 px-6 border-b border-slate-100 dark:border-slate-800/60">
            <div className="w-8 h-8 rounded-lg bg-primary flex items-center justify-center text-white font-bold text-lg shadow-soft">
              P
            </div>
            <span className="text-lg font-bold tracking-tight bg-gradient-to-r from-primary to-primary-light bg-clip-text text-transparent">
              PresencOne
            </span>
          </div>

          {/* Navigation Links */}
          <nav className="flex-grow px-4 py-6 space-y-1.5 overflow-y-auto">
            {filteredNavItems.map((item) => {
              const Icon = item.icon
              const isActive = location.pathname === item.path
              return (
                <Link
                  key={item.name}
                  to={item.path}
                  onClick={() => setSidebarOpen(false)}
                  className={`flex items-center gap-3 px-4 py-2.5 rounded-xl text-sm font-medium transition-all ${
                    isActive
                      ? 'bg-primary/10 text-primary dark:bg-primary/20 dark:text-primary-light shadow-soft-sm'
                      : 'text-slate-500 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-850/50 hover:text-slate-900 dark:hover:text-slate-100'
                  }`}
                >
                  <Icon className="w-4 h-4" />
                  <span>{item.name}</span>
                </Link>
              )
            })}
          </nav>
        </div>

        {/* User Footer Panel */}
        <div className="p-4 border-t border-slate-100 dark:border-slate-800/60 space-y-4">
          {/* Theme Switcher */}
          <div className="flex items-center justify-between p-2 rounded-xl bg-slate-50 dark:bg-slate-950/40 border border-slate-100 dark:border-slate-850">
            <span className="text-xs font-semibold text-slate-400">Theme</span>
            <button
              onClick={() => setDarkMode(!darkMode)}
              className="p-1.5 rounded-lg bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 shadow-soft-sm text-slate-500 hover:text-slate-800 dark:hover:text-white"
            >
              {darkMode ? <Sun className="w-3.5 h-3.5" /> : <Moon className="w-3.5 h-3.5" />}
            </button>
          </div>

          <div className="flex items-center justify-between gap-2 p-1 relative">
            <div className="flex items-center gap-2">
              <div className="w-9 h-9 rounded-full bg-primary/10 text-primary flex items-center justify-center font-bold text-sm">
                {user?.first_name?.[0]?.toUpperCase() || 'U'}
              </div>
              <div className="text-left">
                <p className="text-xs font-bold truncate max-w-[100px]">
                  {user?.first_name} {user?.last_name}
                </p>
                <p className="text-[10px] text-slate-400 truncate max-w-[100px]">{user?.email}</p>
              </div>
            </div>
            
            <button
              onClick={handleLogout}
              className="p-2 rounded-lg text-slate-400 hover:text-danger hover:bg-danger/10 transition-colors"
              title="Logout"
            >
              <LogOut className="w-4 h-4" />
            </button>
          </div>
        </div>
      </aside>

      {/* Main Content Area */}
      <div className="flex-grow flex flex-col min-w-0">
        {/* Top Header Dashboard */}
        <header className="hidden md:flex bg-white/80 dark:bg-slate-900/60 backdrop-blur-md border-b border-slate-200 dark:border-slate-800/80 px-8 h-16 items-center justify-between sticky top-0 z-30">
          <div className="flex items-center gap-2">
            <Activity className="w-4 h-4 text-primary animate-pulse" />
            <span className="text-xs font-semibold text-slate-400">Environment Ready</span>
          </div>

          <div className="flex items-center gap-4">
            {/* Notification Bell */}
            <button className="p-2 rounded-lg text-slate-400 hover:text-slate-600 dark:hover:text-slate-100 hover:bg-slate-50 dark:hover:bg-slate-850 transition-colors relative">
              <Bell className="w-4 h-4" />
              <span className="absolute top-1 right-1 w-1.5 h-1.5 rounded-full bg-danger" />
            </button>
            
            {/* Quick Summary */}
            <div className="px-3 py-1 rounded-full border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950/40 text-xs font-semibold text-slate-500">
              Role: {user?.role}
            </div>
          </div>
        </header>

        {/* Route Pages Render Panel */}
        <main className="flex-grow px-4 md:px-8 py-6 overflow-y-auto">
          <Outlet />
        </main>
      </div>

      {/* Sidebar overlay background on mobile */}
      {sidebarOpen && (
        <div
          onClick={() => setSidebarOpen(false)}
          className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm z-30 md:hidden"
        />
      )}
    </div>
  )
}
