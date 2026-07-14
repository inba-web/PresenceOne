import React, { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Calendar, Clock, MapPin, CheckCircle, AlertCircle, Users, Check, X, Award, CornerDownRight, ShieldAlert, Sparkles, Loader2 } from 'lucide-react'
import { toast } from 'react-hot-toast'
import attendanceService from '../services/attendanceService'

export default function MarkAttendance() {
  const [subjects, setSubjects] = useState([])
  const [selectedSubjectId, setSelectedSubjectId] = useState('')
  const [students, setStudents] = useState([])
  const [attendance, setAttendance] = useState({}) // student_id -> status
  const [remarks, setRemarks] = useState({}) // student_id -> remark string
  
  // Session Configuration States
  const [date, setDate] = useState(new Date().toISOString().split('T')[0])
  const [startTime, setStartTime] = useState('09:00')
  const [endTime, setEndTime] = useState('10:00')
  const [roomNumber, setRoomNumber] = useState('Room 302')

  const [isLoadingSubjects, setIsLoadingSubjects] = useState(true)
  const [isLoadingStudents, setIsLoadingStudents] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)

  // Fetch Assigned Subjects on load
  useEffect(() => {
    const fetchSubjects = async () => {
      try {
        const data = await attendanceService.getFacultySubjects()
        // If paginated, unpack results
        const subjectList = data.results || data
        setSubjects(subjectList)
        if (subjectList.length > 0) {
          setSelectedSubjectId(subjectList[0].id)
        }
      } catch (err) {
        toast.error('Failed to load assigned subjects.')
      } finally {
        setIsLoadingSubjects(false)
      }
    }
    fetchSubjects()
  }, [])

  // Fetch Students when subject changes
  useEffect(() => {
    if (!selectedSubjectId) return
    const fetchStudents = async () => {
      setIsLoadingStudents(true)
      try {
        const data = await attendanceService.getFacultyStudents(selectedSubjectId)
        const studentList = data.results || data
        setStudents(studentList)
        
        // Default everyone to PRESENT
        const initialAttendance = {}
        const initialRemarks = {}
        studentList.forEach((std) => {
          initialAttendance[std.id] = 'PRESENT'
          initialRemarks[std.id] = ''
        })
        setAttendance(initialAttendance)
        setRemarks(initialRemarks)
      } catch (err) {
        toast.error('Failed to load class students list.')
      } finally {
        setIsLoadingStudents(false)
      }
    }
    fetchStudents()
  }, [selectedSubjectId])

  const handleStatusChange = (studentId, status) => {
    setAttendance((prev) => ({ ...prev, [studentId]: status }))
  }

  const handleRemarkChange = (studentId, val) => {
    setRemarks((prev) => ({ ...prev, [studentId]: val }))
  }

  const handleMarkAll = (status) => {
    const updated = {}
    students.forEach((s) => {
      updated[s.id] = status
    })
    setAttendance(updated)
    toast.success(`Marked all as ${status}`, { icon: '🎯' })
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!selectedSubjectId) {
      toast.error('Please select a subject first.')
      return
    }

    setIsSubmitting(true)
    try {
      // 1. Create Session
      const sessionPayload = {
        subject: parseInt(selectedSubjectId),
        date: date,
        start_time: startTime + ':00',
        end_time: endTime + ':00',
        room_number: roomNumber
      }
      
      const session = await attendanceService.createSession(sessionPayload)
      
      // 2. Format bulk records payload
      const bulkPayload = {
        records: students.map((std) => ({
          student_id: std.id,
          status: attendance[std.id],
          remarks: remarks[std.id] || ''
        }))
      }

      // 3. Post bulk marks
      await attendanceService.bulkMarkAttendance(session.id, bulkPayload)

      toast.success('Attendance recorded and synchronized successfully!', {
        icon: '🎉',
        style: {
          borderRadius: '10px',
          background: '#1E293B',
          color: '#fff',
        },
      })
      
      // Reset status back to PRESENT
      const resetAttendance = {}
      students.forEach((std) => {
        resetAttendance[std.id] = 'PRESENT'
      })
      setAttendance(resetAttendance)

    } catch (err) {
      const errMsg = err.response?.data?.detail || 'Failed to submit attendance logs.'
      toast.error(errMsg)
    } finally {
      setIsSubmitting(false)
    }
  }

  const selectedSubject = subjects.find(s => s.id === parseInt(selectedSubjectId))

  return (
    <div className="max-w-6xl mx-auto py-8 space-y-8">
      {/* Title */}
      <div>
        <h1 className="text-3xl font-extrabold tracking-tight">Record Attendance</h1>
        <p className="text-sm text-slate-500 dark:text-slate-400">
          Initiate standard class sessions and bulk-mark student records.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* Left Side: Session config */}
        <div className="lg:col-span-1 space-y-6">
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 shadow-soft space-y-6">
            <h3 className="font-bold text-lg border-b border-slate-100 dark:border-slate-800 pb-3 flex items-center gap-2">
              <Sparkles className="w-5 h-5 text-primary" />
              Session Configurations
            </h3>

            <form onSubmit={handleSubmit} className="space-y-4">
              
              {/* Subject Selection */}
              <div className="space-y-2">
                <label className="text-xs font-semibold uppercase tracking-wider text-slate-400 dark:text-slate-500">
                  Select Subject
                </label>
                {isLoadingSubjects ? (
                  <div className="h-10 bg-slate-100 dark:bg-slate-800 animate-pulse rounded-xl" />
                ) : (
                  <select
                    value={selectedSubjectId}
                    onChange={(e) => setSelectedSubjectId(e.target.value)}
                    className="w-full px-4 py-2.5 rounded-xl border border-slate-250 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-950/20 text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all font-medium"
                  >
                    {subjects.map((sub) => (
                      <option key={sub.id} value={sub.id}>
                        {sub.name} ({sub.code})
                      </option>
                    ))}
                  </select>
                )}
              </div>

              {/* Date */}
              <div className="space-y-2">
                <label className="text-xs font-semibold uppercase tracking-wider text-slate-400 dark:text-slate-500">
                  Session Date
                </label>
                <div className="relative">
                  <Calendar className="absolute left-3 top-3 w-4 h-4 text-slate-400" />
                  <input
                    type="date"
                    value={date}
                    onChange={(e) => setDate(e.target.value)}
                    className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-slate-250 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-950/20 text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all font-medium"
                  />
                </div>
              </div>

              {/* Time Slot */}
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="text-xs font-semibold uppercase tracking-wider text-slate-400 dark:text-slate-500">
                    Start Time
                  </label>
                  <div className="relative">
                    <Clock className="absolute left-3 top-3 w-4 h-4 text-slate-400" />
                    <input
                      type="time"
                      value={startTime}
                      onChange={(e) => setStartTime(e.target.value)}
                      className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-slate-250 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-950/20 text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all font-medium"
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="text-xs font-semibold uppercase tracking-wider text-slate-400 dark:text-slate-500">
                    End Time
                  </label>
                  <div className="relative">
                    <Clock className="absolute left-3 top-3 w-4 h-4 text-slate-400" />
                    <input
                      type="time"
                      value={endTime}
                      onChange={(e) => setEndTime(e.target.value)}
                      className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-slate-250 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-950/20 text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all font-medium"
                    />
                  </div>
                </div>
              </div>

              {/* Location */}
              <div className="space-y-2">
                <label className="text-xs font-semibold uppercase tracking-wider text-slate-400 dark:text-slate-500">
                  Location / Room
                </label>
                <div className="relative">
                  <MapPin className="absolute left-3 top-3 w-4 h-4 text-slate-400" />
                  <input
                    type="text"
                    value={roomNumber}
                    onChange={(e) => setRoomNumber(e.target.value)}
                    placeholder="e.g. Room 302"
                    className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-slate-250 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-950/20 text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all font-medium"
                  />
                </div>
              </div>

              {/* Action */}
              <button
                type="submit"
                disabled={isSubmitting || students.length === 0}
                className="w-full py-3 px-4 mt-6 bg-primary hover:bg-primary-dark text-white rounded-xl font-bold text-sm shadow-soft transition-all active:scale-[0.98] disabled:opacity-50 flex items-center justify-center gap-2"
              >
                {isSubmitting ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    Saving Logs...
                  </>
                ) : (
                  <>
                    <CheckCircle className="w-4 h-4" />
                    Save & Submit Logs
                  </>
                )}
              </button>
            </form>
          </div>
        </div>

        {/* Right Side: Student List */}
        <div className="lg:col-span-2 space-y-6">
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-soft overflow-hidden">
            
            {/* Header info */}
            <div className="p-6 border-b border-slate-100 dark:border-slate-800/80 bg-slate-50/50 dark:bg-slate-950/20 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
              <div>
                <h2 className="text-lg font-bold flex items-center gap-2">
                  <Users className="w-5 h-5 text-primary" />
                  Class Roll Call
                </h2>
                <p className="text-xs text-slate-500">
                  Subject: {selectedSubject ? `${selectedSubject.name} (${selectedSubject.code})` : 'None'}
                </p>
              </div>
              <div className="flex gap-2 w-full sm:w-auto">
                <button
                  onClick={() => handleMarkAll('PRESENT')}
                  className="flex-grow sm:flex-grow-0 px-3 py-1.5 rounded-lg border border-success/20 bg-success/10 text-success hover:bg-success/20 text-xs font-bold transition-colors flex items-center justify-center gap-1"
                >
                  <Check className="w-3.5 h-3.5" /> All Present
                </button>
                <button
                  onClick={() => handleMarkAll('ABSENT')}
                  className="flex-grow sm:flex-grow-0 px-3 py-1.5 rounded-lg border border-danger/20 bg-danger/10 text-danger hover:bg-danger/20 text-xs font-bold transition-colors flex items-center justify-center gap-1"
                >
                  <X className="w-3.5 h-3.5" /> All Absent
                </button>
              </div>
            </div>

            {/* List */}
            {isLoadingStudents ? (
              <div className="p-12 text-center space-y-4">
                <Loader2 className="w-8 h-8 text-primary animate-spin mx-auto" />
                <p className="text-sm text-slate-500">Loading student directory...</p>
              </div>
            ) : students.length === 0 ? (
              <div className="p-12 text-center text-slate-400 space-y-3">
                <AlertCircle className="w-12 h-12 text-slate-350 mx-auto" />
                <p className="text-sm font-semibold">No students found</p>
                <p className="text-xs">Ensure you select a valid subject templates course to list active learners.</p>
              </div>
            ) : (
              <div className="divide-y divide-slate-100 dark:divide-slate-800">
                <AnimatePresence>
                  {students.map((std, idx) => (
                    <motion.div
                      key={std.id}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: idx * 0.03 }}
                      className="p-4 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 hover:bg-slate-50/40 dark:hover:bg-slate-950/10 transition-colors"
                    >
                      {/* Student info */}
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-full bg-primary/10 text-primary flex items-center justify-center font-bold text-sm">
                          {std.student_name?.[0]?.toUpperCase() || 'S'}
                        </div>
                        <div className="text-left">
                          <h4 className="text-sm font-bold text-slate-900 dark:text-slate-100">{std.student_name}</h4>
                          <div className="flex items-center gap-1.5 mt-0.5 text-xs text-slate-400 font-mono">
                            <span>{std.roll_number}</span>
                            <span>•</span>
                            <span className="truncate max-w-[140px]">{std.student_email}</span>
                          </div>
                        </div>
                      </div>

                      {/* Status selectors */}
                      <div className="flex items-center gap-2 w-full sm:w-auto">
                        <input
                          type="text"
                          value={remarks[std.id] || ''}
                          onChange={(e) => handleRemarkChange(std.id, e.target.value)}
                          placeholder="Note (e.g. Late 10m)"
                          className="flex-grow sm:flex-grow-0 sm:w-32 px-3 py-1.5 text-xs rounded-lg border border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-950/20 focus:outline-none focus:ring-1 focus:ring-primary focus:border-primary transition-all"
                        />
                        
                        <div className="flex bg-slate-100 dark:bg-slate-950/45 p-1 rounded-xl gap-1 border border-slate-200/50 dark:border-slate-850">
                          {['PRESENT', 'ABSENT', 'LATE', 'EXCUSED'].map((status) => {
                            const active = attendance[std.id] === status
                            let activeClass = ''
                            if (active) {
                              if (status === 'PRESENT') activeClass = 'bg-success text-white'
                              if (status === 'ABSENT') activeClass = 'bg-danger text-white'
                              if (status === 'LATE') activeClass = 'bg-warning text-slate-900'
                              if (status === 'EXCUSED') activeClass = 'bg-primary text-white'
                            } else {
                              activeClass = 'text-slate-400 hover:text-slate-800 dark:hover:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-850'
                            }

                            return (
                              <button
                                key={status}
                                type="button"
                                onClick={() => handleStatusChange(std.id, status)}
                                className={`px-2.5 py-1.5 rounded-lg text-[10px] font-extrabold uppercase transition-all ${activeClass}`}
                              >
                                {status.substring(0, 1)}
                              </button>
                            )
                          })}
                        </div>
                      </div>
                    </motion.div>
                  ))}
                </AnimatePresence>
              </div>
            )}
          </div>
        </div>

      </div>
    </div>
  )
}
