import React, { useState, useEffect } from 'react'
import { useSelector } from 'react-redux'
import { ResponsiveContainer, AreaChart, Area, XAxis, YAxis, Tooltip, CartesianGrid, BarChart, Bar, PieChart, Pie, Cell, Legend } from 'recharts'
import { Calendar, FileText, Download, BarChart2, TrendingUp, PieChart as PieIcon, Sparkles, Loader2 } from 'lucide-react'
import { toast } from 'react-hot-toast'
import attendanceService from '../services/attendanceService'

export default function Analytics() {
  const { user } = useSelector((state) => state.auth)
  const [analytics, setAnalytics] = useState(null)
  const [subjects, setSubjects] = useState([])
  const [selectedSubjectId, setSelectedSubjectId] = useState('')
  const [isLoading, setIsLoading] = useState(true)
  const [isExporting, setIsExporting] = useState(false)

  // Curated Sleek Dark Theme Colors
  const COLORS = ['#10B981', '#EF4444', '#F59E0B', '#6366F1']

  useEffect(() => {
    const fetchAnalyticsAndSubjects = async () => {
      setIsLoading(true)
      try {
        const stats = await attendanceService.getAnalyticsSummary()
        setAnalytics(stats)

        // For export: if user is staff, fetch subjects
        if (user && (user.role === 'FACULTY' || user.role === 'ADMIN' || user.role === 'SUPER_ADMIN')) {
          const subsData = await attendanceService.getFacultySubjects()
          const subList = subsData.results || subsData
          setSubjects(subList)
          if (subList.length > 0) {
            setSelectedSubjectId(subList[0].id)
          }
        }
      } catch (err) {
        toast.error('Failed to load system analytics.')
      } finally {
        setIsLoading(false)
      }
    }
    fetchAnalyticsAndSubjects()
  }, [user])

  const handleExportCSV = async () => {
    if (!selectedSubjectId) {
      toast.error('Please select a subject first.')
      return
    }

    setIsExporting(true)
    try {
      const blob = await attendanceService.exportAttendanceCSV(selectedSubjectId)
      const selectedSub = subjects.find(s => s.id === parseInt(selectedSubjectId))
      const codeName = selectedSub ? selectedSub.code : 'report'
      
      // Trigger browser download
      const url = window.URL.createObjectURL(new Blob([blob]))
      const link = document.createElement('a')
      link.href = url
      link.setAttribute('download', `attendance_matrix_${codeName}.csv`)
      document.body.appendChild(link)
      link.click()
      link.parentNode.removeChild(link)
      
      toast.success('Attendance matrix CSV downloaded successfully!', { icon: '📊' })
    } catch (err) {
      toast.error('Failed to compile and download matrix report.')
    } finally {
      setIsExporting(false)
    }
  }

  // Calculate Overall Average from Subject Averages if available
  const overallAvg = analytics?.subject_averages?.length 
    ? (analytics.subject_averages.reduce((sum, item) => sum + item.percentage, 0) / analytics.subject_averages.length).toFixed(1)
    : '100'

  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] space-y-4">
        <Loader2 className="w-10 h-10 text-primary animate-spin" />
        <p className="text-sm text-slate-500 font-medium">Gathering metrics data...</p>
      </div>
    )
  }

  return (
    <div className="max-w-6xl mx-auto py-8 space-y-8">
      {/* Title */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-extrabold tracking-tight">System Analytics</h1>
          <p className="text-sm text-slate-500">
            Real-time compliance charts, class check-in trends, and report exports.
          </p>
        </div>

        {/* CSV Exporter Panel */}
        {user && (user.role === 'FACULTY' || user.role === 'ADMIN' || user.role === 'SUPER_ADMIN') && subjects.length > 0 && (
          <div className="flex items-center gap-3 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-3 rounded-2xl shadow-soft w-full sm:w-auto">
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
            <button
              onClick={handleExportCSV}
              disabled={isExporting}
              className="px-4 py-1.5 bg-primary hover:bg-primary-dark text-white rounded-lg text-xs font-bold shadow-soft transition-colors flex items-center gap-1.5 active:scale-[0.98] disabled:opacity-50"
            >
              {isExporting ? (
                <>
                  <Loader2 className="w-3.5 h-3.5 animate-spin" />
                  Exporting...
                </>
              ) : (
                <>
                  <Download className="w-3.5 h-3.5" />
                  Export CSV
                </>
              )}
            </button>
          </div>
        )}
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-6 rounded-2xl shadow-soft space-y-1">
          <span className="text-xs text-slate-400 font-semibold uppercase tracking-wider block">Average Compliance</span>
          <h2 className="text-3xl font-black text-slate-800 dark:text-slate-100">{overallAvg}%</h2>
          <span className="text-[10px] text-slate-400 font-medium">Compliance target rate is 75%</span>
        </div>
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-6 rounded-2xl shadow-soft space-y-1">
          <span className="text-xs text-slate-400 font-semibold uppercase tracking-wider block">Tracked Sessions</span>
          <h2 className="text-3xl font-black text-slate-800 dark:text-slate-100">{analytics?.daily_trends?.length || 0} days</h2>
          <span className="text-[10px] text-slate-400 font-medium">Rolling attendance cycle logs</span>
        </div>
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-6 rounded-2xl shadow-soft space-y-1">
          <span className="text-xs text-slate-400 font-semibold uppercase tracking-wider block">Enrolled Courses</span>
          <h2 className="text-3xl font-black text-slate-800 dark:text-slate-100">{analytics?.subject_averages?.length || 0}</h2>
          <span className="text-[10px] text-slate-400 font-medium">Class syllabus templates</span>
        </div>
      </div>

      {/* Charts Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        
        {/* Trend Area Chart */}
        <div className="bg-white dark:bg-slate-900 border border-slate-250 dark:border-slate-800 p-6 rounded-2xl shadow-soft space-y-4">
          <h3 className="font-bold text-lg flex items-center gap-2">
            <TrendingUp className="w-5 h-5 text-primary" />
            Check-in Analytics Trend
          </h3>
          <div className="h-72 w-full text-xs">
            {analytics?.daily_trends?.length === 0 ? (
              <p className="text-center py-24 text-slate-400">No trend log data points available.</p>
            ) : (
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={analytics?.daily_trends} margin={{ top: 10, right: 10, left: -25, bottom: 0 }}>
                  <defs>
                    <linearGradient id="colorPct" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#6366F1" stopOpacity={0.4}/>
                      <stop offset="95%" stopColor="#6366F1" stopOpacity={0.0}/>
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E2E8F0" className="dark:stroke-slate-800" />
                  <XAxis dataKey="date" stroke="#94A3B8" />
                  <YAxis domain={[0, 100]} stroke="#94A3B8" />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: '#1E293B',
                      borderRadius: '12px',
                      color: '#FFF',
                      border: 'none'
                    }}
                  />
                  <Area type="monotone" dataKey="percentage" name="Attendance %" stroke="#6366F1" strokeWidth={2} fillOpacity={1} fill="url(#colorPct)" />
                </AreaChart>
              </ResponsiveContainer>
            )}
          </div>
        </div>

        {/* Pie Status Chart */}
        <div className="bg-white dark:bg-slate-900 border border-slate-250 dark:border-slate-800 p-6 rounded-2xl shadow-soft space-y-4">
          <h3 className="font-bold text-lg flex items-center gap-2">
            <PieIcon className="w-5 h-5 text-primary" />
            Check-in status shares
          </h3>
          <div className="h-72 w-full text-xs flex flex-col sm:flex-row items-center justify-center gap-4">
            {analytics?.total_records === 0 ? (
              <p className="text-center py-24 text-slate-400">No share slice data points available.</p>
            ) : (
              <>
                <div className="w-48 h-48">
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={analytics?.status_distribution}
                        cx="50%"
                        cy="50%"
                        innerRadius={50}
                        outerRadius={75}
                        paddingAngle={5}
                        dataKey="value"
                      >
                        {analytics?.status_distribution?.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                        ))}
                      </Pie>
                      <Tooltip
                        contentStyle={{
                          backgroundColor: '#1E293B',
                          borderRadius: '12px',
                          color: '#FFF',
                          border: 'none'
                        }}
                      />
                    </PieChart>
                  </ResponsiveContainer>
                </div>
                <div className="text-left space-y-2 font-medium">
                  {analytics?.status_distribution?.map((entry, index) => (
                    <div key={entry.name} className="flex items-center gap-2">
                      <div className="w-3.5 h-3.5 rounded" style={{ backgroundColor: COLORS[index % COLORS.length] }} />
                      <span className="text-slate-500 capitalize">{entry.name}:</span>
                      <span className="font-bold text-slate-800 dark:text-slate-100">{entry.value}</span>
                    </div>
                  ))}
                </div>
              </>
            )}
          </div>
        </div>

        {/* Bar Subject Compliance Chart */}
        <div className="bg-white dark:bg-slate-900 border border-slate-250 dark:border-slate-800 p-6 rounded-2xl shadow-soft space-y-4 lg:col-span-2">
          <h3 className="font-bold text-lg flex items-center gap-2">
            <BarChart2 className="w-5 h-5 text-primary" />
            Compliance rates per class template
          </h3>
          <div className="h-72 w-full text-xs">
            {analytics?.subject_averages?.length === 0 ? (
              <p className="text-center py-24 text-slate-400">No subject compliance logs found.</p>
            ) : (
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={analytics?.subject_averages} margin={{ top: 10, right: 10, left: -25, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E2E8F0" className="dark:stroke-slate-800" />
                  <XAxis dataKey="subject_code" stroke="#94A3B8" />
                  <YAxis domain={[0, 100]} stroke="#94A3B8" />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: '#1E293B',
                      borderRadius: '12px',
                      color: '#FFF',
                      border: 'none'
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
        </div>

      </div>
    </div>
  )
}
