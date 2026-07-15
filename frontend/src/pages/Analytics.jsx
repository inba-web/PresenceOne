import React, { useState, useEffect } from 'react';
import { useSelector } from 'react-redux';
import { ResponsiveContainer, AreaChart, Area, XAxis, YAxis, Tooltip, CartesianGrid, BarChart, Bar, PieChart, Pie, Cell } from 'recharts';
import { Calendar, FileText, Download, BarChart2, TrendingUp, PieChart as PieIcon, Sparkles, Loader2 } from 'lucide-react';
import { toast } from 'react-hot-toast';
import attendanceService from '../services/attendanceService';
import Card from '../components/ui/Card';
import Badge from '../components/ui/Badge';
import Button from '../components/ui/Button';

export default function Analytics() {
  const { user } = useSelector((state) => state.auth);
  const [analytics, setAnalytics] = useState(null);
  const [subjects, setSubjects] = useState([]);
  const [selectedSubjectId, setSelectedSubjectId] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [isExporting, setIsExporting] = useState(false);

  // Design System Harmonious Colors (Primary Blue, Success Green, Warning Amber, Slate)
  const COLORS = ['#2563EB', '#10B981', '#F59E0B', '#64748B'];

  useEffect(() => {
    const fetchAnalyticsAndSubjects = async () => {
      setIsLoading(true);
      try {
        const stats = await attendanceService.getAnalyticsSummary();
        setAnalytics(stats);

        if (user && (user.role === 'FACULTY' || user.role === 'ADMIN' || user.role === 'SUPER_ADMIN')) {
          const subsData = await attendanceService.getFacultySubjects();
          const subList = subsData.results || subsData;
          setSubjects(subList);
          if (subList.length > 0) {
            setSelectedSubjectId(subList[0].id);
          }
        }
      } catch (err) {
        toast.error('Failed to load system analytics.');
      } finally {
        setIsLoading(false);
      }
    };
    fetchAnalyticsAndSubjects();
  }, [user]);

  const handleExportCSV = async () => {
    if (!selectedSubjectId) {
      toast.error('Please select a subject first.');
      return;
    }

    setIsExporting(true);
    try {
      const blob = await attendanceService.exportAttendanceCSV(selectedSubjectId);
      const selectedSub = subjects.find(s => s.id === parseInt(selectedSubjectId));
      const codeName = selectedSub ? selectedSub.code : 'report';
      
      const url = window.URL.createObjectURL(new Blob([blob]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `attendance_matrix_${codeName}.csv`);
      document.body.appendChild(link);
      link.click();
      link.parentNode.removeChild(link);
      
      toast.success('Attendance matrix CSV downloaded successfully!', {
        icon: '📊',
        style: {
          borderRadius: '12px',
          background: '#111827',
          color: '#fff',
          border: '1px solid rgba(255, 255, 255, 0.05)'
        }
      });
    } catch (err) {
      toast.error('Failed to compile and download matrix report.');
    } finally {
      setIsExporting(false);
    }
  };

  const overallAvg = analytics?.subject_averages?.length 
    ? (analytics.subject_averages.reduce((sum, item) => sum + item.percentage, 0) / analytics.subject_averages.length).toFixed(1)
    : '100';

  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] space-y-4">
        <Loader2 className="w-10 h-10 text-primary animate-spin" />
        <p className="text-sm text-slate-500 font-bold">Gathering compliance insights...</p>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto py-2 space-y-8">
      
      {/* Title section */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 border-b border-slate-200/50 dark:border-slate-800/80 pb-6 text-left">
        <div>
          <h1 className="text-3xl font-extrabold tracking-tight">System Analytics</h1>
          <p className="text-sm text-slate-500 dark:text-slate-400 mt-1 font-medium">
            Real-time compliance charts, class check-in trends, and report exports.
          </p>
        </div>

        {/* CSV Exporter */}
        {user && (user.role === 'FACULTY' || user.role === 'ADMIN' || user.role === 'SUPER_ADMIN') && subjects.length > 0 && (
          <div className="flex items-center gap-3 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-2.5 rounded-2xl shadow-soft w-full sm:w-auto">
            <select
              value={selectedSubjectId}
              onChange={(e) => setSelectedSubjectId(e.target.value)}
              className="px-3 py-1.5 rounded-lg border border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-950/20 text-xs font-semibold focus:outline-none focus:ring-1 focus:ring-primary focus:border-primary transition-all"
            >
              {subjects.map((sub) => (
                <option key={sub.id} value={sub.id}>
                  {sub.code}
                </option>
              ))}
            </select>
            <Button
              onClick={handleExportCSV}
              disabled={isExporting}
              variant="primary"
              className="py-1.5 px-3 text-xs font-bold shadow-soft"
            >
              {isExporting ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Download className="w-3.5 h-3.5" />}
              <span>Export CSV</span>
            </Button>
          </div>
        )}
      </div>

      {/* Summary metrics cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 text-left">
        <Card className="p-6 space-y-1">
          <span className="text-[10px] font-bold text-slate-450 dark:text-slate-500 uppercase tracking-widest block">Average Compliance</span>
          <h2 className="text-3xl font-black text-slate-900 dark:text-white">{overallAvg}%</h2>
          <span className="text-[10px] text-slate-450 font-semibold">Semester Target is 75%</span>
        </Card>
        
        <Card className="p-6 space-y-1">
          <span className="text-[10px] font-bold text-slate-450 dark:text-slate-500 uppercase tracking-widest block">Tracked Sessions</span>
          <h2 className="text-3xl font-black text-slate-900 dark:text-white">{analytics?.daily_trends?.length || 0} days</h2>
          <span className="text-[10px] text-slate-450 font-semibold">Active rolling calendar cycles</span>
        </Card>

        <Card className="p-6 space-y-1">
          <span className="text-[10px] font-bold text-slate-450 dark:text-slate-500 uppercase tracking-widest block">Academic Courses</span>
          <h2 className="text-3xl font-black text-slate-900 dark:text-white">{analytics?.subject_averages?.length || 0}</h2>
          <span className="text-[10px] text-slate-450 font-semibold">Syllabus templates tracked</span>
        </Card>
      </div>

      {/* Charts Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 text-left">
        
        {/* Trend Area chart */}
        <Card className="p-6 space-y-4">
          <h3 className="font-extrabold text-lg flex items-center gap-2">
            <TrendingUp className="w-5 h-5 text-primary" /> Check-in Compliance Trend
          </h3>
          <div className="h-72 w-full text-xs font-semibold">
            {analytics?.daily_trends?.length === 0 ? (
              <p className="text-center py-24 text-slate-450">No check-in trend data logs found.</p>
            ) : (
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={analytics?.daily_trends} margin={{ top: 10, right: 10, left: -25, bottom: 0 }}>
                  <defs>
                    <linearGradient id="analyticsGlow" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#2563EB" stopOpacity={0.3}/>
                      <stop offset="95%" stopColor="#2563EB" stopOpacity={0.0}/>
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E2E8F0" className="dark:stroke-slate-800/80" />
                  <XAxis dataKey="date" stroke="#94A3B8" />
                  <YAxis domain={[0, 100]} stroke="#94A3B8" />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: '#111827',
                      borderRadius: '12px',
                      color: '#FFF',
                      border: '1px solid rgba(255,255,255,0.05)',
                      boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.3)'
                    }}
                  />
                  <Area type="monotone" dataKey="percentage" name="Attendance %" stroke="#2563EB" strokeWidth={2.5} fillOpacity={1} fill="url(#analyticsGlow)" />
                </AreaChart>
              </ResponsiveContainer>
            )}
          </div>
        </Card>

        {/* Pie Status share chart */}
        <Card className="p-6 space-y-4">
          <h3 className="font-extrabold text-lg flex items-center gap-2">
            <PieIcon className="w-5 h-5 text-primary" /> Check-in Status Distribution
          </h3>
          <div className="h-72 w-full text-xs flex flex-col sm:flex-row items-center justify-center gap-6">
            {analytics?.total_records === 0 ? (
              <p className="text-center py-24 text-slate-455">No distribution data slices available.</p>
            ) : (
              <>
                <div className="w-48 h-48 flex-shrink-0">
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={analytics?.status_distribution}
                        cx="50%"
                        cy="50%"
                        innerRadius={55}
                        outerRadius={75}
                        paddingAngle={4}
                        dataKey="value"
                      >
                        {analytics?.status_distribution?.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                        ))}
                      </Pie>
                      <Tooltip
                        contentStyle={{
                          backgroundColor: '#111827',
                          borderRadius: '12px',
                          color: '#FFF',
                          border: '1px solid rgba(255,255,255,0.05)'
                        }}
                      />
                    </PieChart>
                  </ResponsiveContainer>
                </div>
                <div className="text-left space-y-2.5 font-bold">
                  {analytics?.status_distribution?.map((entry, index) => (
                    <div key={entry.name} className="flex items-center gap-2">
                      <div className="w-3.5 h-3.5 rounded" style={{ backgroundColor: COLORS[index % COLORS.length] }} />
                      <span className="text-slate-400 capitalize">{entry.name}:</span>
                      <span className="text-slate-800 dark:text-slate-100">{entry.value}</span>
                    </div>
                  ))}
                </div>
              </>
            )}
          </div>
        </Card>

        {/* Bar Subject compliance averages */}
        <Card className="p-6 space-y-4 lg:col-span-2">
          <h3 className="font-extrabold text-lg flex items-center gap-2">
            <BarChart2 className="w-5 h-5 text-primary" /> Subject average comparison
          </h3>
          <div className="h-72 w-full text-xs font-semibold">
            {analytics?.subject_averages?.length === 0 ? (
              <p className="text-center py-24 text-slate-455">No syllabus averages recorded.</p>
            ) : (
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={analytics?.subject_averages} margin={{ top: 10, right: 10, left: -25, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E2E8F0" className="dark:stroke-slate-800/80" />
                  <XAxis dataKey="subject_code" stroke="#94A3B8" />
                  <YAxis domain={[0, 100]} stroke="#94A3B8" />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: '#111827',
                      borderRadius: '12px',
                      color: '#FFF',
                      border: '1px solid rgba(255,255,255,0.05)'
                    }}
                  />
                  <Bar dataKey="percentage" name="Attendance Average" radius={[6, 6, 0, 0]}>
                    {analytics?.subject_averages?.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.percentage >= 75 ? '#10B981' : '#EF4444'} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            )}
          </div>
        </Card>

      </div>
    </div>
  );
}
