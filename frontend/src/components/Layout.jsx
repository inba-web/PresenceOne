import React, { useState, useEffect, useRef } from 'react';
import { Outlet, Link, useLocation, useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { motion, AnimatePresence } from 'framer-motion';
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
  Bell,
  BarChart2,
  Search,
  Sparkles,
  Command,
  HelpCircle,
  PlusCircle,
  FileText
} from 'lucide-react';
import { logout } from '../store/slices/authSlice';
import { toast } from 'react-hot-toast';
import Logo from './Logo';

export default function Layout() {
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false);
  const [notificationsOpen, setNotificationsOpen] = useState(false);
  const [quickActionsOpen, setQuickActionsOpen] = useState(false);
  const [selectedWorkspace, setSelectedWorkspace] = useState('University Main Campus');
  const [showWorkspaceMenu, setShowWorkspaceMenu] = useState(false);
  
  const [darkMode, setDarkMode] = useState(localStorage.getItem('theme') === 'dark');
  const { user } = useSelector((state) => state.auth);
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const location = useLocation();

  const workspaceRef = useRef(null);
  const notifRef = useRef(null);
  const quickActionsRef = useRef(null);

  useEffect(() => {
    if (darkMode) {
      document.documentElement.classList.add('dark');
      localStorage.setItem('theme', 'dark');
    } else {
      document.documentElement.classList.remove('dark');
      localStorage.setItem('theme', 'light');
    }
  }, [darkMode]);

  // Click outside listener for dropdowns
  useEffect(() => {
    function handleClickOutside(event) {
      if (workspaceRef.current && !workspaceRef.current.contains(event.target)) {
        setShowWorkspaceMenu(false);
      }
      if (notifRef.current && !notifRef.current.contains(event.target)) {
        setNotificationsOpen(false);
      }
      if (quickActionsRef.current && !quickActionsRef.current.contains(event.target)) {
        setQuickActionsOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  useEffect(() => {
    const handleGlobalLogout = () => {
      dispatch(logout());
      navigate('/login');
    };
    window.addEventListener('auth-logout', handleGlobalLogout);
    return () => window.removeEventListener('auth-logout', handleGlobalLogout);
  }, [dispatch, navigate]);

  const handleLogout = () => {
    dispatch(logout());
    toast.success('Signed out successfully');
    navigate('/login');
  };

  const navItems = [
    { name: 'Dashboard', path: '/dashboard', icon: LayoutDashboard },
    { name: 'Students', path: '/students', icon: Users, role: ['SUPER_ADMIN', 'ADMIN', 'PRINCIPAL', 'FACULTY'] },
    { name: 'Faculty', path: '/faculty', icon: Users, role: ['SUPER_ADMIN', 'ADMIN', 'PRINCIPAL'] },
    { name: 'Departments', path: '/departments', icon: Building2, role: ['SUPER_ADMIN', 'ADMIN'] },
    { name: 'Courses', path: '/courses', icon: BookOpen, role: ['SUPER_ADMIN', 'ADMIN'] },
    { name: 'Attendance', path: '/attendance', icon: CalendarDays },
    { name: 'Leave Requests', path: '/leaves', icon: FileSpreadsheet },
    { name: 'Analytics', path: '/analytics', icon: BarChart2 },
    { name: 'Profile Settings', path: '/profile', icon: SettingsIcon },
  ];

  const filteredNavItems = navItems.filter(
    (item) => !item.role || (user && item.role.includes(user.role))
  );

  const workspaces = [
    'University Main Campus',
    'North Engineering Block',
    'Health Science Center',
    'Distance Education Dept'
  ];

  const mockNotifications = [
    { id: 1, text: 'Marcus Teacher created a new Attendance session for CS-301', time: '10m ago', unread: true },
    { id: 2, text: 'Emily Learner requested a Medical Exemption request (3 days)', time: '1h ago', unread: true },
    { id: 3, text: 'System compliance check: 4 students fell below 75% threshold', time: '4h ago', unread: false }
  ];

  return (
    <div className="min-h-screen bg-bg-light dark:bg-bg-dark text-slate-800 dark:text-slate-100 flex flex-col md:flex-row transition-colors duration-200">
      
      {/* MOBILE TOP BAR */}
      <div className="md:hidden bg-white dark:bg-slate-900 border-b border-slate-200 dark:border-slate-800 px-4 h-16 flex items-center justify-between sticky top-0 z-50">
        <Logo variant="horizontal" theme={darkMode ? 'dark' : 'light'} />
        <button
          onClick={() => setMobileSidebarOpen(!mobileSidebarOpen)}
          className="p-2 rounded-xl bg-slate-50 dark:bg-slate-850 hover:bg-slate-100 text-slate-650"
        >
          {mobileSidebarOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
        </button>
      </div>

      {/* MOBILE ASIDE (Overlay menu on mobile) */}
      <AnimatePresence>
        {mobileSidebarOpen && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 0.4 }}
              exit={{ opacity: 0 }}
              onClick={() => setMobileSidebarOpen(false)}
              className="fixed inset-0 bg-slate-950 z-40 md:hidden"
            />
            <motion.aside
              initial={{ x: '-100%' }}
              animate={{ x: 0 }}
              exit={{ x: '-100%' }}
              transition={{ type: 'spring', damping: 25 }}
              className="fixed inset-y-0 left-0 w-72 bg-white dark:bg-slate-900 border-r border-slate-200 dark:border-slate-800/80 flex flex-col justify-between z-50 p-6 md:hidden"
            >
              <div className="space-y-6">
                <Logo variant="horizontal" theme={darkMode ? 'dark' : 'light'} className="px-2" />
                
                <nav className="space-y-1">
                  {filteredNavItems.map((item) => {
                    const Icon = item.icon;
                    const isActive = location.pathname === item.path;
                    return (
                      <Link
                        key={item.name}
                        to={item.path}
                        onClick={() => setMobileSidebarOpen(false)}
                        className={`flex items-center gap-3 px-4 py-2.5 rounded-xl text-sm font-semibold transition-all ${
                          isActive
                            ? 'bg-primary/10 text-primary dark:bg-primary/20 dark:text-primary-light'
                            : 'text-slate-500 hover:bg-slate-50 hover:text-slate-900 dark:text-slate-400 dark:hover:bg-slate-800/50 dark:hover:text-white'
                        }`}
                      >
                        <Icon className="w-4.5 h-4.5" />
                        <span>{item.name}</span>
                      </Link>
                    );
                  })}
                </nav>
              </div>

              <div className="space-y-4 pt-6 border-t border-slate-100 dark:border-slate-850">
                <div className="flex justify-between items-center px-4">
                  <span className="text-xs font-bold text-slate-400">Dark Mode</span>
                  <button
                    onClick={() => setDarkMode(!darkMode)}
                    className="p-2 rounded-xl border border-slate-200 dark:border-slate-800"
                  >
                    {darkMode ? <Sun className="w-4 h-4 text-yellow-500" /> : <Moon className="w-4 h-4 text-slate-500" />}
                  </button>
                </div>
                <div className="flex items-center gap-3 px-4">
                  <div className="w-10 h-10 rounded-full bg-primary/10 text-primary flex items-center justify-center font-bold text-sm">
                    {user?.first_name?.[0]?.toUpperCase() || 'U'}
                  </div>
                  <div className="text-left flex-grow">
                    <p className="text-xs font-bold truncate">{user?.first_name} {user?.last_name}</p>
                    <p className="text-[10px] text-slate-400 truncate">{user?.email}</p>
                  </div>
                  <button
                    onClick={handleLogout}
                    className="p-2 text-slate-400 hover:text-danger rounded-lg"
                  >
                    <LogOut className="w-4.5 h-4.5" />
                  </button>
                </div>
              </div>
            </motion.aside>
          </>
        )}
      </AnimatePresence>

      {/* DESKTOP SIDEBAR */}
      <motion.aside
        animate={{ width: sidebarCollapsed ? '80px' : '260px' }}
        transition={{ type: 'spring', damping: 20, stiffness: 120 }}
        className="hidden md:flex flex-col justify-between bg-white dark:bg-slate-900 border-r border-slate-200 dark:border-slate-800/80 sticky top-0 h-screen z-40"
      >
        <div className="flex flex-col overflow-hidden h-full">
          
          {/* Logo Header */}
          <div className={`h-16 flex items-center border-b border-slate-100 dark:border-slate-800/50 px-5 overflow-hidden ${
            sidebarCollapsed ? 'justify-center' : 'justify-between'
          }`}>
            <Link to="/dashboard">
              {sidebarCollapsed ? (
                <Logo variant="icon" theme={darkMode ? 'dark' : 'light'} />
              ) : (
                <Logo variant="horizontal" theme={darkMode ? 'dark' : 'light'} />
              )}
            </Link>
          </div>

          {/* Institution/Workspace Switcher */}
          {!sidebarCollapsed && (
            <div ref={workspaceRef} className="px-4 pt-4 relative">
              <button
                onClick={() => setShowWorkspaceMenu(!showWorkspaceMenu)}
                className="w-full flex items-center justify-between p-2.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-950/20 text-left text-xs font-bold hover:bg-slate-100 dark:hover:bg-slate-850 transition-all active:scale-[0.98]"
              >
                <div className="truncate max-w-[150px] flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                  <span className="truncate">{selectedWorkspace}</span>
                </div>
                <ChevronDown className="w-3.5 h-3.5 text-slate-450" />
              </button>

              <AnimatePresence>
                {showWorkspaceMenu && (
                  <motion.div
                    initial={{ opacity: 0, y: -4 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -4 }}
                    className="absolute left-4 right-4 mt-2 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl shadow-lg z-50 py-1.5 px-1 space-y-0.5"
                  >
                    {workspaces.map((ws) => (
                      <button
                        key={ws}
                        onClick={() => {
                          setSelectedWorkspace(ws);
                          setShowWorkspaceMenu(false);
                        }}
                        className={`w-full text-left px-3 py-2 text-xs font-semibold rounded-lg transition-colors ${
                          selectedWorkspace === ws
                            ? 'bg-primary/5 text-primary'
                            : 'hover:bg-slate-50 dark:hover:bg-slate-850/50'
                        }`}
                      >
                        {ws}
                      </button>
                    ))}
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          )}

          {/* Navigation Links */}
          <nav className="flex-grow px-3 py-6 space-y-1 overflow-y-auto">
            {filteredNavItems.map((item) => {
              const Icon = item.icon;
              const isActive = location.pathname === item.path;
              return (
                <Link
                  key={item.name}
                  to={item.path}
                  title={sidebarCollapsed ? item.name : ''}
                  className={`flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-sm font-semibold transition-all relative ${
                    isActive
                      ? 'bg-primary/10 text-primary dark:bg-primary/20 dark:text-primary-light'
                      : 'text-slate-500 hover:bg-slate-50 hover:text-slate-900 dark:text-slate-400 dark:hover:bg-slate-850/40 dark:hover:text-slate-100'
                  }`}
                >
                  <Icon className="w-4.5 h-4.5 flex-shrink-0" />
                  {!sidebarCollapsed && <span>{item.name}</span>}
                  
                  {/* Left Active border bar */}
                  {isActive && (
                    <motion.div
                      layoutId="active-indicator"
                      className="absolute left-0 w-1 h-6 bg-primary rounded-r-md"
                    />
                  )}
                </Link>
              );
            })}
          </nav>
        </div>

        {/* User Footer settings */}
        <div className="p-4 border-t border-slate-100 dark:border-slate-800/50 space-y-4">
          
          {/* Inline Theme Switcher */}
          {!sidebarCollapsed ? (
            <div className="flex items-center justify-between p-1 rounded-xl bg-slate-100 dark:bg-slate-950/40 border border-slate-200/50 dark:border-slate-850">
              <button
                onClick={() => setDarkMode(false)}
                className={`flex-1 py-1.5 rounded-lg text-xs font-bold transition-all flex items-center justify-center gap-1.5 ${
                  !darkMode
                    ? 'bg-white dark:bg-slate-900 text-slate-950 shadow-soft-sm'
                    : 'text-slate-400 hover:text-slate-650'
                }`}
              >
                <Sun className="w-3.5 h-3.5" /> Light
              </button>
              <button
                onClick={() => setDarkMode(true)}
                className={`flex-1 py-1.5 rounded-lg text-xs font-bold transition-all flex items-center justify-center gap-1.5 ${
                  darkMode
                    ? 'bg-white dark:bg-slate-900 text-white shadow-soft-sm'
                    : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                <Moon className="w-3.5 h-3.5" /> Dark
              </button>
            </div>
          ) : (
            <button
              onClick={() => setDarkMode(!darkMode)}
              className="w-10 h-10 mx-auto rounded-xl border border-slate-200 dark:border-slate-800 flex items-center justify-center hover:bg-slate-50 dark:hover:bg-slate-850"
            >
              {darkMode ? <Sun className="w-4 h-4 text-yellow-500" /> : <Moon className="w-4 h-4" />}
            </button>
          )}

          {/* User Details card */}
          <div className={`flex items-center justify-between gap-2 overflow-hidden ${
            sidebarCollapsed ? 'flex-col items-center gap-3' : ''
          }`}>
            <div className="flex items-center gap-2.5 overflow-hidden text-left">
              <div className="w-9 h-9 rounded-full bg-primary/10 text-primary flex items-center justify-center font-bold text-sm flex-shrink-0 border border-primary/20 shadow-soft-sm">
                {user?.first_name?.[0]?.toUpperCase() || 'U'}
              </div>
              {!sidebarCollapsed && (
                <div className="overflow-hidden">
                  <p className="text-xs font-extrabold truncate max-w-[110px] text-slate-800 dark:text-slate-100">
                    {user?.first_name} {user?.last_name}
                  </p>
                  <p className="text-[10px] text-slate-400 truncate max-w-[110px]">{user?.email}</p>
                </div>
              )}
            </div>

            <button
              onClick={handleLogout}
              className="p-2 rounded-xl text-slate-400 hover:text-danger hover:bg-danger/10 transition-colors flex-shrink-0"
              title="Logout"
            >
              <LogOut className="w-4.5 h-4.5" />
            </button>
          </div>
        </div>
      </motion.aside>

      {/* MAIN MAIN CONTENT CONTAINER */}
      <div className="flex-grow flex flex-col min-w-0">
        
        {/* TOP NAVBAR (Desktop version) */}
        <header className="hidden md:flex bg-white/80 dark:bg-slate-900/60 backdrop-blur-md border-b border-slate-200 dark:border-slate-800/80 px-8 h-16 items-center justify-between sticky top-0 z-35">
          
          {/* Collapse sidebar toggle and status */}
          <div className="flex items-center gap-4">
            <button
              onClick={() => setSidebarCollapsed(!sidebarCollapsed)}
              className="p-2 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-850 text-slate-450 hover:text-slate-800 dark:hover:text-slate-100 transition-colors"
            >
              <Menu className="w-4.5 h-4.5" />
            </button>
            <div className="flex items-center gap-2 bg-slate-50 dark:bg-slate-950/40 border border-slate-200/50 dark:border-slate-850/60 px-3 py-1 rounded-xl">
              <Activity className="w-3.5 h-3.5 text-primary animate-pulse" />
              <span className="text-[10px] font-bold text-slate-450 tracking-wide uppercase">Institutional Grid Online</span>
            </div>
          </div>

          {/* Right side items: Search, bell notifier, profile switcher */}
          <div className="flex items-center gap-4">
            
            {/* Search Input Box */}
            <div className="relative w-64">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
              <input
                type="text"
                placeholder="Search..."
                className="w-full pl-9 pr-8 py-1.5 text-xs rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-950/20 focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all font-medium"
              />
              <div className="absolute right-2.5 top-1/2 -translate-y-1/2 flex items-center gap-0.5 border border-slate-200 dark:border-slate-800 px-1 py-0.5 rounded bg-white dark:bg-slate-900 text-[8px] font-bold text-slate-400 font-mono pointer-events-none">
                <Command className="w-2 h-2" />
                <span>K</span>
              </div>
            </div>

            {/* Quick Actions */}
            <div ref={quickActionsRef} className="relative">
              <button
                onClick={() => setQuickActionsOpen(!quickActionsOpen)}
                className="p-2 rounded-xl text-slate-450 hover:text-slate-800 dark:hover:text-white hover:bg-slate-50 dark:hover:bg-slate-850 transition-colors flex items-center gap-1 text-xs font-semibold border border-slate-200/30 dark:border-slate-850"
              >
                <PlusCircle className="w-4 h-4 text-primary" />
                <span>Actions</span>
              </button>

              <AnimatePresence>
                {quickActionsOpen && (
                  <motion.div
                    initial={{ opacity: 0, y: -4 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -4 }}
                    className="absolute right-0 mt-2 w-48 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl shadow-lg z-50 py-1.5 px-1 space-y-0.5"
                  >
                    <Link
                      to="/attendance"
                      onClick={() => setQuickActionsOpen(false)}
                      className="w-full text-left px-3 py-2 text-xs font-semibold rounded-lg text-slate-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-850/80 transition-colors flex items-center gap-2"
                    >
                      <CalendarDays className="w-3.5 h-3.5 text-primary" />
                      Record Roll Call
                    </Link>
                    <Link
                      to="/leaves"
                      onClick={() => setQuickActionsOpen(false)}
                      className="w-full text-left px-3 py-2 text-xs font-semibold rounded-lg text-slate-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-850/80 transition-colors flex items-center gap-2"
                    >
                      <FileSpreadsheet className="w-3.5 h-3.5 text-emerald-500" />
                      Apply for Exemption
                    </Link>
                    <Link
                      to="/profile"
                      onClick={() => setQuickActionsOpen(false)}
                      className="w-full text-left px-3 py-2 text-xs font-semibold rounded-lg text-slate-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-850/80 transition-colors flex items-center gap-2"
                    >
                      <SettingsIcon className="w-3.5 h-3.5 text-slate-450" />
                      Account Settings
                    </Link>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            {/* Notification Bell with Dropdown */}
            <div ref={notifRef} className="relative">
              <button
                onClick={() => setNotificationsOpen(!notificationsOpen)}
                className="p-2.5 rounded-xl text-slate-450 hover:text-slate-800 dark:hover:text-slate-100 hover:bg-slate-50 dark:hover:bg-slate-850 border border-slate-200/40 dark:border-slate-800/40 transition-colors relative"
              >
                <Bell className="w-4 h-4" />
                <span className="absolute top-2 right-2 w-1.5 h-1.5 rounded-full bg-danger animate-ping" />
                <span className="absolute top-2 right-2 w-1.5 h-1.5 rounded-full bg-danger" />
              </button>

              <AnimatePresence>
                {notificationsOpen && (
                  <motion.div
                    initial={{ opacity: 0, y: -4 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -4 }}
                    className="absolute right-0 mt-2 w-80 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-xl z-50 overflow-hidden"
                  >
                    <div className="p-4 border-b border-slate-100 dark:border-slate-850 bg-slate-50/50 dark:bg-slate-950/20 flex justify-between items-center">
                      <h4 className="font-bold text-xs">Notifications</h4>
                      <span className="text-[10px] font-bold text-primary bg-primary/10 px-2 py-0.5 rounded-full">2 New</span>
                    </div>

                    <div className="divide-y divide-slate-100 dark:divide-slate-850 max-h-[300px] overflow-y-auto">
                      {mockNotifications.map((notif) => (
                        <div key={notif.id} className="p-3.5 hover:bg-slate-50/60 dark:hover:bg-slate-950/20 transition-all text-left">
                          <p className="text-xs text-slate-650 dark:text-slate-350 leading-relaxed font-medium">
                            {notif.text}
                          </p>
                          <span className="text-[9px] text-slate-400 mt-1 block font-semibold">{notif.time}</span>
                        </div>
                      ))}
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
            
          </div>
        </header>

        {/* PAGE OUTLET */}
        <main className="flex-grow px-6 md:px-8 py-8 overflow-y-auto max-w-7xl w-full mx-auto">
          <Outlet />
        </main>
      </div>

    </div>
  );
}
