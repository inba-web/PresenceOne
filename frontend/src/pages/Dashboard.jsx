import React, { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate, Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  LogOut,
  User,
  Users,
  LayoutDashboard,
  Shield,
  Activity,
  Calendar,
  Award,
  AlertTriangle,
  BookOpen,
  Clock,
  PlusCircle,
  CheckCircle,
  ShieldAlert,
  ArrowRight,
  TrendingUp,
  MapPin,
  ClipboardList
} from 'lucide-react';
import { logout } from '../store/slices/authSlice';
import { toast } from 'react-hot-toast';
import attendanceService from '../services/attendanceService';
import Card from '../components/ui/Card';
import Badge from '../components/ui/Badge';
import Button from '../components/ui/Button';

export default function Dashboard() {
  const { user } = useSelector((state) => state.auth);
  const dispatch = useDispatch();
  const navigate = useNavigate();

  // Student Attendance Stats States
  const [stats, setStats] = useState(null);
  const [isLoadingStats, setIsLoadingStats] = useState(false);

  useEffect(() => {
    if (user && user.role === 'STUDENT') {
      const fetchStudentStats = async () => {
        setIsLoadingStats(true);
        try {
          const data = await attendanceService.getStudentSummary();
          setStats(data);
        } catch (err) {
          toast.error('Failed to load attendance metrics.');
        } finally {
          setIsLoadingStats(false);
        }
      };
      fetchStudentStats();
    }
  }, [user]);

  const handleLogout = () => {
    dispatch(logout());
    toast.success('Successfully logged out');
    navigate('/login');
  };

  // Current Date display
  const formattedDate = new Date().toLocaleDateString('en-US', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  });

  // 1. RENDER STUDENT DASHBOARD
  if (user && user.role === 'STUDENT') {
    return (
      <div className="space-y-8 py-2">
        
        {/* Welcome Section */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 border-b border-slate-200/50 dark:border-slate-800/80 pb-6">
          <div className="text-left">
            <h1 className="text-3xl font-extrabold tracking-tight">Student Dashboard</h1>
            <p className="text-sm text-slate-500 dark:text-slate-400 mt-1 font-medium">
              Welcome back, {user.first_name || 'Student'} • {formattedDate}
            </p>
          </div>
          <Badge variant={stats?.overall?.percentage >= 75 ? 'success' : 'warning'} className="py-1 px-3">
            ● Semester Status: {stats?.overall?.percentage >= 75 ? 'Compliant' : 'Shortage Alert'}
          </Badge>
        </div>

        {/* Banner Card */}
        <div className="relative p-8 rounded-3xl bg-slate-950 text-white overflow-hidden shadow-premium bg-grid-pattern border border-slate-900">
          <div className="absolute top-[-30%] right-[-10%] w-[320px] h-[320px] rounded-full bg-primary/20 blur-[90px] animate-pulse-glow" />
          
          <div className="space-y-3 relative z-10 max-w-lg text-left">
            <span className="inline-flex items-center px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-wider bg-primary/10 text-primary border border-primary/20">
              Attendance Health Meter
            </span>
            <h2 className="text-2xl font-black tracking-tight leading-tight">
              Maintain at least 75% average attendance
            </h2>
            <p className="text-slate-400 text-xs leading-relaxed">
              If your syllabus average falls below 75%, your profile status changes to warning. Contact your department advisor for leave exemptions.
            </p>
          </div>
        </div>

        {isLoadingStats ? (
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            {[1, 2, 3, 4].map((n) => (
              <div key={n} className="h-32 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800/60 animate-pulse rounded-2xl" />
            ))}
          </div>
        ) : stats ? (
          <>
            {/* Stats Overview */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              
              {/* Radial Percentage card */}
              <Card className="p-6 flex items-center justify-between">
                <div className="space-y-1 text-left">
                  <span className="text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-widest block">Syllabus Average</span>
                  <h3 className="text-3xl font-black text-slate-900 dark:text-white">{stats.overall?.percentage}%</h3>
                  <p className="text-[10px] text-slate-400 font-semibold">Min Target: 75%</p>
                </div>
                <div className="w-16 h-16 flex items-center justify-center relative">
                  <svg className="w-full h-full transform -rotate-90">
                    <circle cx="32" cy="32" r="28" className="stroke-slate-100 dark:stroke-slate-800 fill-none" strokeWidth="4.5" />
                    <circle
                      cx="32"
                      cy="32"
                      r="28"
                      className="stroke-primary fill-none transition-all duration-500"
                      strokeWidth="4.5"
                      strokeDasharray={2 * Math.PI * 28}
                      strokeDashoffset={(2 * Math.PI * 28) * (1 - (stats.overall?.percentage || 100) / 100)}
                    />
                  </svg>
                  <span className="absolute text-[10px] font-extrabold text-primary">%</span>
                </div>
              </Card>

              {/* Present sessions */}
              <Card className="p-6">
                <div className="flex items-center gap-4 text-left">
                  <div className="w-11 h-11 rounded-xl bg-success/10 text-success flex items-center justify-center border border-success/10">
                    <CheckCircle className="w-5.5 h-5.5" />
                  </div>
                  <div>
                    <span className="text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-widest block">Present Lectures</span>
                    <h3 className="text-2xl font-black text-slate-900 dark:text-white mt-0.5">
                      {stats.overall?.present_sessions} <span className="text-xs text-slate-400 dark:text-slate-500">/ {stats.overall?.total_sessions}</span>
                    </h3>
                  </div>
                </div>
              </Card>

              {/* Absent sessions */}
              <Card className="p-6">
                <div className="flex items-center gap-4 text-left">
                  <div className="w-11 h-11 rounded-xl bg-danger/10 text-danger flex items-center justify-center border border-danger/10">
                    <ShieldAlert className="w-5.5 h-5.5" />
                  </div>
                  <div>
                    <span className="text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-widest block">Absent Lectures</span>
                    <h3 className="text-2xl font-black text-slate-900 dark:text-white mt-0.5">
                      {stats.overall?.absent_sessions}
                    </h3>
                  </div>
                </div>
              </Card>

              {/* Attendance Status */}
              <Card className="p-6">
                <div className="flex items-center gap-4 text-left">
                  <div className={`w-11 h-11 rounded-xl flex items-center justify-center border ${
                    stats.overall?.percentage >= 75
                      ? 'bg-emerald-500/10 text-emerald-500 border-emerald-500/15'
                      : 'bg-amber-500/10 text-amber-500 border-amber-500/15'
                  }`}>
                    <Award className="w-5.5 h-5.5" />
                  </div>
                  <div>
                    <span className="text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-widest block">Academic Standing</span>
                    <span className={`text-sm font-bold block mt-1 uppercase ${
                      stats.overall?.percentage >= 75 ? 'text-success' : 'text-danger'
                    }`}>
                      {stats.overall?.percentage >= 75 ? 'Good Standing' : 'Shortage Alert'}
                    </span>
                  </div>
                </div>
              </Card>
            </div>

            {/* Middle Section grid */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              
              {/* Syllabus metrics breakdowns */}
              <div className="lg:col-span-2 space-y-4">
                <div className="flex justify-between items-center text-left">
                  <h3 className="font-extrabold text-lg flex items-center gap-2">
                    <BookOpen className="w-5 h-5 text-primary" />
                    Syllabus Compliance
                  </h3>
                  <span className="text-xs text-slate-450 dark:text-slate-400 font-semibold">Subject Breakdown</span>
                </div>

                <Card className="p-6 divide-y divide-slate-100 dark:divide-slate-800/80 space-y-4">
                  {stats.subjects?.map((sub, idx) => (
                    <div key={sub.subject_id} className={`pt-4 first:pt-0 space-y-2.5 text-left`}>
                      <div className="flex justify-between text-sm">
                        <div className="flex items-center gap-2">
                          <span className="font-bold text-slate-900 dark:text-white">{sub.subject_name}</span>
                          <span className="text-[10px] font-mono text-slate-400 dark:text-slate-500 bg-slate-50 dark:bg-slate-950 px-1.5 py-0.5 rounded border border-slate-200/50 dark:border-slate-850">
                            {sub.subject_code}
                          </span>
                        </div>
                        <span className={`font-black text-xs ${
                          sub.percentage >= 75 ? 'text-primary' : 'text-danger'
                        }`}>{sub.percentage}%</span>
                      </div>

                      {/* Custom slim slider progress */}
                      <div className="w-full bg-slate-100 dark:bg-slate-800/85 h-2 rounded-full overflow-hidden">
                        <motion.div
                          initial={{ width: 0 }}
                          animate={{ width: `${sub.percentage}%` }}
                          transition={{ duration: 0.8, delay: idx * 0.1 }}
                          className={`h-full rounded-full ${
                            sub.percentage >= 75 ? 'bg-success' : 'bg-danger'
                          }`}
                        />
                      </div>

                      <div className="flex justify-between items-center text-[10px] text-slate-400 dark:text-slate-500 font-semibold">
                        <span>Attended: {sub.present_sessions} / {sub.total_sessions} lectures</span>
                        <span className={sub.percentage >= 75 ? 'text-success' : 'text-danger'}>
                          {sub.percentage >= 75 ? '● Compliant' : '● Action Required'}
                        </span>
                      </div>
                    </div>
                  ))}
                </Card>
              </div>

              {/* Recent Logs timeline */}
              <div className="space-y-4">
                <div className="flex justify-between items-center text-left">
                  <h3 className="font-extrabold text-lg flex items-center gap-2">
                    <Clock className="w-5 h-5 text-primary" />
                    Recent Check-ins
                  </h3>
                  <span className="text-xs text-slate-450 dark:text-slate-400 font-semibold">Real-time sync</span>
                </div>

                <Card className="p-6 space-y-4">
                  {stats.recent?.length === 0 ? (
                    <p className="text-xs text-slate-400 text-center py-8">No recent presence logs found.</p>
                  ) : (
                    <div className="space-y-3.5">
                      {stats.recent?.map((log, index) => {
                        let statusColor = 'neutral';
                        if (log.status === 'PRESENT') statusColor = 'success';
                        if (log.status === 'ABSENT') statusColor = 'danger';
                        if (log.status === 'LATE') statusColor = 'warning';
                        if (log.status === 'EXCUSED') statusColor = 'info';

                        return (
                          <div
                            key={index}
                            className="flex justify-between items-center p-3 rounded-xl border border-slate-100 dark:border-slate-850 hover:bg-slate-50/50 dark:hover:bg-slate-950/25 transition-colors text-left"
                          >
                            <div className="space-y-0.5">
                              <span className="text-[10px] font-bold font-mono text-slate-400 dark:text-slate-550 block">{log.subject_code}</span>
                              <p className="text-xs text-slate-650 dark:text-slate-350 font-bold">{log.date}</p>
                            </div>
                            <Badge variant={statusColor} className="text-[9px] font-black">
                              {log.status}
                            </Badge>
                          </div>
                        );
                      })}
                    </div>
                  )}
                </Card>
              </div>

            </div>
          </>
        ) : (
          <div className="p-8 text-center text-slate-400">Failed to render student summary details.</div>
        )}
      </div>
    );
  }

  // 2. RENDER FACULTY & ADMIN DASHBOARD
  return (
    <div className="space-y-8 py-2">
      
      {/* Welcome Title */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 border-b border-slate-200/50 dark:border-slate-800/80 pb-6 text-left">
        <div>
          <h1 className="text-3xl font-extrabold tracking-tight">Staff Workspace</h1>
          <p className="text-sm text-slate-500 dark:text-slate-400 mt-1 font-medium">
            Welcome back, {user?.first_name || 'Staff'} • {formattedDate}
          </p>
        </div>
        <div className="flex gap-2">
          {user && (user.role === 'FACULTY' || user.role === 'ADMIN' || user.role === 'SUPER_ADMIN') && (
            <Link to="/attendance">
              <Button variant="primary" className="py-2 text-xs flex items-center gap-1.5 shadow-soft">
                <PlusCircle className="w-4 h-4" /> Record Check-in Session
              </Button>
            </Link>
          )}
        </div>
      </div>

      {/* Grid of stats cards (simulated metrics values for SaaS) */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card className="p-6 text-left space-y-2">
          <div className="flex justify-between items-center">
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Department Students</span>
            <Users className="w-4.5 h-4.5 text-primary" />
          </div>
          <h2 className="text-3xl font-black text-slate-900 dark:text-white">1,482</h2>
          <span className="text-[10px] text-emerald-500 font-semibold flex items-center gap-0.5">
            <TrendingUp className="w-3 h-3" /> +12% this semester
          </span>
        </Card>

        <Card className="p-6 text-left space-y-2">
          <div className="flex justify-between items-center">
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Faculty Count</span>
            <User className="w-4.5 h-4.5 text-emerald-500" />
          </div>
          <h2 className="text-3xl font-black text-slate-900 dark:text-white">84</h2>
          <span className="text-[10px] text-slate-400 font-medium">All profiles verified</span>
        </Card>

        <Card className="p-6 text-left space-y-2">
          <div className="flex justify-between items-center">
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Average Compliance</span>
            <Activity className="w-4.5 h-4.5 text-info" />
          </div>
          <h2 className="text-3xl font-black text-slate-900 dark:text-white">81.4%</h2>
          <span className="text-[10px] text-emerald-500 font-semibold flex items-center gap-0.5">
            <TrendingUp className="w-3 h-3" /> +1.2% this month
          </span>
        </Card>

        <Card className="p-6 text-left space-y-2">
          <div className="flex justify-between items-center">
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Pending Exemptions</span>
            <ClipboardList className="w-4.5 h-4.5 text-amber-500" />
          </div>
          <h2 className="text-3xl font-black text-slate-900 dark:text-white">6</h2>
          <span className="text-[10px] text-amber-500 font-semibold">Exemptions queue waiting</span>
        </Card>
      </div>

      {/* Main Section layout */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* Left Side: Staff Profile & Access controls */}
        <div className="lg:col-span-1 space-y-6">
          <Card className="p-6 text-left space-y-4">
            <h3 className="font-extrabold text-lg flex items-center gap-2 border-b border-slate-100 dark:border-slate-800 pb-3">
              <User className="w-5 h-5 text-primary" /> Profile Credentials
            </h3>
            
            <div className="flex items-center gap-3.5">
              <div className="w-12 h-12 bg-primary/10 text-primary rounded-full flex items-center justify-center font-bold text-base border border-primary/20 shadow-soft-sm">
                {user?.first_name?.[0]?.toUpperCase() || 'S'}
              </div>
              <div>
                <h4 className="font-extrabold text-sm text-slate-805 dark:text-slate-100">
                  {user?.first_name} {user?.last_name}
                </h4>
                <p className="text-[10px] text-slate-400 mt-0.5 font-semibold">{user?.email}</p>
              </div>
            </div>

            <div className="text-xs space-y-2 pt-2 border-t border-slate-100 dark:border-slate-850">
              <div className="flex justify-between py-1">
                <span className="text-slate-400">Institutional Role:</span>
                <Badge variant="primary" className="text-[9px] font-black">{user?.role?.replace('_', ' ')}</Badge>
              </div>
              <div className="flex justify-between py-1">
                <span className="text-slate-400">Authentication Scheme:</span>
                <span className="font-mono text-slate-500">JWT / Bearer token</span>
              </div>
            </div>

            <Button
              onClick={handleLogout}
              variant="secondary"
              className="w-full text-danger hover:bg-danger/5 dark:hover:bg-danger/10 border border-slate-200/50 dark:border-slate-800 text-xs py-2 mt-4"
            >
              Sign Out from System
            </Button>
          </Card>

          {/* Quick links block */}
          <Card className="p-6 text-left space-y-4 bg-slate-950 text-white border border-slate-900 bg-grid-pattern relative overflow-hidden">
            <div className="absolute top-[-30%] right-[-10%] w-24 h-24 rounded-full bg-primary/20 blur-xl pointer-events-none" />
            <h3 className="font-extrabold text-sm text-slate-200">Common actions</h3>
            <p className="text-xs text-slate-400">Jump directly to modules to manage students, leaves, and system configurations.</p>
            
            <div className="space-y-2 pt-2">
              <Link
                to="/attendance"
                className="w-full p-2.5 rounded-xl border border-slate-900 bg-slate-900/35 hover:bg-primary/10 transition-all text-xs font-bold flex items-center justify-between text-slate-250 hover:text-white"
              >
                <span>Record Attendance logs</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </Link>
              <Link
                to="/leaves"
                className="w-full p-2.5 rounded-xl border border-slate-900 bg-slate-900/35 hover:bg-primary/10 transition-all text-xs font-bold flex items-center justify-between text-slate-250 hover:text-white"
              >
                <span>Exemption requests inbox</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </Link>
              <Link
                to="/profile"
                className="w-full p-2.5 rounded-xl border border-slate-900 bg-slate-900/35 hover:bg-primary/10 transition-all text-xs font-bold flex items-center justify-between text-slate-250 hover:text-white"
              >
                <span>SaaS Settings Profile</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </Link>
            </div>
          </Card>
        </div>

        {/* Right Side: Active schedules / sessions and pending tasks */}
        <div className="lg:col-span-2 space-y-6">
          
          {/* Active calendar widget */}
          <Card className="p-6 text-left space-y-4">
            <div className="flex justify-between items-center">
              <h3 className="font-extrabold text-lg flex items-center gap-2">
                <Calendar className="w-5 h-5 text-primary" /> Active Class Sessions
              </h3>
              <Badge variant="info" className="text-[9px] font-black">Today</Badge>
            </div>

            <div className="divide-y divide-slate-100 dark:divide-slate-800/80 space-y-3.5">
              
              <div className="pt-3.5 first:pt-0 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div className="flex items-start gap-3">
                  <div className="w-10 h-10 rounded-xl bg-primary/10 text-primary flex items-center justify-center flex-shrink-0 font-bold border border-primary/20">
                    CS
                  </div>
                  <div>
                    <h4 className="font-bold text-sm text-slate-900 dark:text-white">Computer Science - III Semester</h4>
                    <p className="text-xs text-slate-400 mt-0.5 flex items-center gap-1 font-medium">
                      <Clock className="w-3.5 h-3.5" /> 09:00 AM - 10:00 AM • <MapPin className="w-3.5 h-3.5" /> Room 302
                    </p>
                  </div>
                </div>
                <Badge variant="success" className="text-[9px] font-black">Complete</Badge>
              </div>

              <div className="pt-3.5 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div className="flex items-start gap-3">
                  <div className="w-10 h-10 rounded-xl bg-emerald-500/10 text-emerald-500 flex items-center justify-center flex-shrink-0 font-bold border border-emerald-500/20">
                    EE
                  </div>
                  <div>
                    <h4 className="font-bold text-sm text-slate-900 dark:text-white">Electrical Engineering - I Semester</h4>
                    <p className="text-xs text-slate-400 mt-0.5 flex items-center gap-1 font-medium">
                      <Clock className="w-3.5 h-3.5" /> 11:30 AM - 12:30 PM • <MapPin className="w-3.5 h-3.5" /> Lab 4
                    </p>
                  </div>
                </div>
                <Badge variant="warning" className="text-[9px] font-black">Scheduled</Badge>
              </div>

            </div>
          </Card>

          {/* Pending items */}
          <Card className="p-6 text-left space-y-4">
            <h3 className="font-extrabold text-sm uppercase tracking-wider text-slate-400">Institutional Logs Alert</h3>
            <p className="text-xs text-slate-500 leading-normal">
              Security compliance audit checks recorded 6 login checkpoints from unmapped remote systems. Review the audit history logs periodically to secure operations.
            </p>
            <div className="flex gap-2">
              <Link to="/analytics" className="text-xs text-primary font-bold hover:underline inline-flex items-center gap-1">
                View analytics insights <ArrowRight className="w-3.5 h-3.5" />
              </Link>
            </div>
          </Card>

        </div>

      </div>
    </div>
  );
}
