import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Calendar, Clock, MapPin, CheckCircle, AlertCircle, Users, Check, X, Award, CornerDownRight, ShieldAlert, Sparkles, Loader2, Search } from 'lucide-react';
import { toast } from 'react-hot-toast';
import attendanceService from '../services/attendanceService';
import Card from '../components/ui/Card';
import Badge from '../components/ui/Badge';
import Button from '../components/ui/Button';
import Input from '../components/ui/Input';

export default function MarkAttendance() {
  const [subjects, setSubjects] = useState([]);
  const [selectedSubjectId, setSelectedSubjectId] = useState('');
  const [students, setStudents] = useState([]);
  const [attendance, setAttendance] = useState({}); // student_id -> status
  const [remarks, setRemarks] = useState({}); // student_id -> remark string
  const [searchQuery, setSearchQuery] = useState('');
  
  // Session Configuration States
  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
  const [startTime, setStartTime] = useState('09:00');
  const [endTime, setEndTime] = useState('10:00');
  const [roomNumber, setRoomNumber] = useState('Room 302');

  const [isLoadingSubjects, setIsLoadingSubjects] = useState(true);
  const [isLoadingStudents, setIsLoadingStudents] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Fetch Assigned Subjects on load
  useEffect(() => {
    const fetchSubjects = async () => {
      try {
        const data = await attendanceService.getFacultySubjects();
        const subjectList = data.results || data;
        setSubjects(subjectList);
        if (subjectList.length > 0) {
          setSelectedSubjectId(subjectList[0].id);
        }
      } catch (err) {
        toast.error('Failed to load assigned subjects.');
      } finally {
        setIsLoadingSubjects(false);
      }
    };
    fetchSubjects();
  }, []);

  // Fetch Students when subject changes
  useEffect(() => {
    if (!selectedSubjectId) return;
    const fetchStudents = async () => {
      setIsLoadingStudents(true);
      try {
        const data = await attendanceService.getFacultyStudents(selectedSubjectId);
        const studentList = data.results || data;
        setStudents(studentList);
        
        // Default everyone to PRESENT
        const initialAttendance = {};
        const initialRemarks = {};
        studentList.forEach((std) => {
          initialAttendance[std.id] = 'PRESENT';
          initialRemarks[std.id] = '';
        });
        setAttendance(initialAttendance);
        setRemarks(initialRemarks);
      } catch (err) {
        toast.error('Failed to load class students list.');
      } finally {
        setIsLoadingStudents(false);
      }
    };
    fetchStudents();
  }, [selectedSubjectId]);

  const handleStatusChange = (studentId, status) => {
    setAttendance((prev) => ({ ...prev, [studentId]: status }));
  };

  const handleRemarkChange = (studentId, val) => {
    setRemarks((prev) => ({ ...prev, [studentId]: val }));
  };

  const handleMarkAll = (status) => {
    const updated = {};
    students.forEach((s) => {
      updated[s.id] = status;
    });
    setAttendance(updated);
    toast.success(`Marked all as ${status}`, {
      style: {
        borderRadius: '12px',
        background: '#111827',
        color: '#fff',
        border: '1px solid rgba(255, 255, 255, 0.05)'
      }
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!selectedSubjectId) {
      toast.error('Please select a subject first.');
      return;
    }

    setIsSubmitting(true);
    try {
      // 1. Create Session
      const sessionPayload = {
        subject: parseInt(selectedSubjectId),
        date: date,
        start_time: startTime + ':00',
        end_time: endTime + ':00',
        room_number: roomNumber
      };
      
      const session = await attendanceService.createSession(sessionPayload);
      
      // 2. Format bulk records payload
      const bulkPayload = {
        records: students.map((std) => ({
          student_id: std.id,
          status: attendance[std.id],
          remarks: remarks[std.id] || ''
        }))
      };

      // 3. Post bulk marks
      await attendanceService.bulkMarkAttendance(session.id, bulkPayload);

      toast.success('Attendance recorded successfully!', {
        icon: '🎉',
        style: {
          borderRadius: '12px',
          background: '#111827',
          color: '#fff',
          border: '1px solid rgba(255, 255, 255, 0.05)'
        },
      });
      
      // Reset status back to PRESENT
      const resetAttendance = {};
      students.forEach((std) => {
        resetAttendance[std.id] = 'PRESENT';
      });
      setAttendance(resetAttendance);
    } catch (err) {
      const errMsg = err.response?.data?.detail || 'Failed to submit attendance logs.';
      toast.error(errMsg);
    } finally {
      setIsSubmitting(false);
    }
  };

  const selectedSubject = subjects.find(s => s.id === parseInt(selectedSubjectId));

  // Filter students based on search query
  const filteredStudents = students.filter(s =>
    s.student_name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    s.roll_number?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="max-w-6xl mx-auto py-2 space-y-8">
      
      {/* Title */}
      <div className="border-b border-slate-200/50 dark:border-slate-800/80 pb-6 text-left">
        <h1 className="text-3xl font-extrabold tracking-tight">Record Attendance</h1>
        <p className="text-sm text-slate-500 dark:text-slate-400 mt-1 font-medium">
          Create academic class slots and record student check-ins.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* LEFT COLUMN: Session configuration parameters */}
        <div className="lg:col-span-1 space-y-6">
          <Card className="p-6 text-left space-y-6">
            <h3 className="font-extrabold text-lg flex items-center gap-2 border-b border-slate-100 dark:border-slate-800/80 pb-3">
              <Sparkles className="w-5 h-5 text-primary" /> Session Settings
            </h3>

            <form onSubmit={handleSubmit} className="space-y-4">
              
              {/* Subject Selection */}
              <div className="space-y-1.5">
                <label className="block text-xs font-semibold uppercase tracking-wider text-slate-450 dark:text-slate-500">
                  Academic Subject
                </label>
                {isLoadingSubjects ? (
                  <div className="h-10 bg-slate-100 dark:bg-slate-800/50 animate-pulse rounded-xl" />
                ) : (
                  <select
                    value={selectedSubjectId}
                    onChange={(e) => setSelectedSubjectId(e.target.value)}
                    className="w-full px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all font-semibold"
                  >
                    {subjects.map((sub) => (
                      <option key={sub.id} value={sub.id}>
                        {sub.name} ({sub.code})
                      </option>
                    ))}
                  </select>
                )}
              </div>

              {/* Session Date */}
              <div className="space-y-1.5">
                <label className="block text-xs font-semibold uppercase tracking-wider text-slate-450 dark:text-slate-500">
                  Check-in Date
                </label>
                <div className="relative">
                  <Calendar className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                  <input
                    type="date"
                    value={date}
                    onChange={(e) => setDate(e.target.value)}
                    className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all font-semibold"
                  />
                </div>
              </div>

              {/* Time slots */}
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="block text-xs font-semibold uppercase tracking-wider text-slate-450 dark:text-slate-500">
                    Start Time
                  </label>
                  <div className="relative">
                    <Clock className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                    <input
                      type="time"
                      value={startTime}
                      onChange={(e) => setStartTime(e.target.value)}
                      className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all font-semibold"
                    />
                  </div>
                </div>

                <div className="space-y-1.5">
                  <label className="block text-xs font-semibold uppercase tracking-wider text-slate-450 dark:text-slate-500">
                    End Time
                  </label>
                  <div className="relative">
                    <Clock className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                    <input
                      type="time"
                      value={endTime}
                      onChange={(e) => setEndTime(e.target.value)}
                      className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all font-semibold"
                    />
                  </div>
                </div>
              </div>

              {/* Room Location */}
              <div className="space-y-1.5">
                <label className="block text-xs font-semibold uppercase tracking-wider text-slate-450 dark:text-slate-500">
                  Location Room
                </label>
                <div className="relative">
                  <MapPin className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                  <input
                    type="text"
                    value={roomNumber}
                    onChange={(e) => setRoomNumber(e.target.value)}
                    placeholder="e.g. Room 302"
                    className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all font-semibold"
                  />
                </div>
              </div>

              {/* Submit action button */}
              <Button
                type="submit"
                variant="primary"
                isLoading={isSubmitting}
                disabled={students.length === 0}
                className="w-full py-3 mt-6 shadow-soft"
              >
                <CheckCircle className="w-4 h-4 mr-1.5" /> Submit Roll Call logs
              </Button>
            </form>
          </Card>
        </div>

        {/* RIGHT COLUMN: Roll Call Student Listing panel */}
        <div className="lg:col-span-2 space-y-6">
          <Card className="overflow-hidden">
            
            {/* Sticky/Fixed Table Header Section */}
            <div className="p-6 border-b border-slate-200/50 dark:border-slate-800/80 bg-slate-50/50 dark:bg-slate-950/20 space-y-4">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 text-left">
                <div>
                  <h3 className="font-extrabold text-lg flex items-center gap-2">
                    <Users className="w-5 h-5 text-primary" /> Active Class Roll Call
                  </h3>
                  <p className="text-xs text-slate-400 dark:text-slate-500 font-semibold mt-0.5">
                    Subject: {selectedSubject ? `${selectedSubject.name} (${selectedSubject.code})` : 'Select subject'}
                  </p>
                </div>
                <div className="flex gap-2">
                  <Button
                    onClick={() => handleMarkAll('PRESENT')}
                    variant="outline"
                    className="border-emerald-500/20 bg-emerald-500/10 text-emerald-500 hover:bg-emerald-500/20 text-xs py-1.5 px-3"
                  >
                    <Check className="w-3.5 h-3.5 mr-1" /> All Present
                  </Button>
                  <Button
                    onClick={() => handleMarkAll('ABSENT')}
                    variant="outline"
                    className="border-danger/20 bg-danger/10 text-danger hover:bg-danger/20 text-xs py-1.5 px-3"
                  >
                    <X className="w-3.5 h-3.5 mr-1" /> All Absent
                  </Button>
                </div>
              </div>

              {/* Live search input */}
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                <input
                  type="text"
                  placeholder="Search student by name or register roll number..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-9 pr-4 py-2 text-xs rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 focus:outline-none focus:ring-1 focus:ring-primary focus:border-primary transition-all font-semibold"
                />
              </div>
            </div>

            {/* Students list */}
            {isLoadingStudents ? (
              <div className="p-16 text-center space-y-3">
                <Loader2 className="w-8 h-8 text-primary animate-spin mx-auto" />
                <p className="text-sm text-slate-400 font-bold">Synchronizing student roster...</p>
              </div>
            ) : filteredStudents.length === 0 ? (
              <div className="p-16 text-center space-y-3 text-slate-400">
                <AlertCircle className="w-12 h-12 text-slate-350 mx-auto" />
                <p className="text-sm font-extrabold text-slate-500">No student profiles found</p>
                <p className="text-xs">Ensure your metadata matches the selected subject course registration.</p>
              </div>
            ) : (
              <div className="divide-y divide-slate-100 dark:divide-slate-800/80">
                <AnimatePresence>
                  {filteredStudents.map((std, idx) => (
                    <motion.div
                      key={std.id}
                      initial={{ opacity: 0, y: 8 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: idx * 0.02 }}
                      className="p-4 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 hover:bg-slate-50/25 dark:hover:bg-slate-950/25 transition-all"
                    >
                      {/* Left: profile */}
                      <div className="flex items-center gap-3 text-left">
                        <div className="w-10 h-10 rounded-full bg-primary/10 text-primary flex items-center justify-center font-bold text-sm border border-primary/20 shadow-soft-sm">
                          {std.student_name?.[0]?.toUpperCase() || 'S'}
                        </div>
                        <div>
                          <h4 className="text-sm font-bold text-slate-900 dark:text-white">{std.student_name}</h4>
                          <div className="flex items-center gap-1.5 text-[10px] text-slate-405 dark:text-slate-500 font-mono mt-0.5">
                            <span className="font-semibold">{std.roll_number}</span>
                            <span>•</span>
                            <span>{std.student_email}</span>
                          </div>
                        </div>
                      </div>

                      {/* Right: remarks and check-in buttons */}
                      <div className="flex items-center gap-2.5 w-full sm:w-auto">
                        <input
                          type="text"
                          value={remarks[std.id] || ''}
                          onChange={(e) => handleRemarkChange(std.id, e.target.value)}
                          placeholder="Note (e.g. excused)"
                          className="flex-grow sm:flex-grow-0 sm:w-32 px-3 py-1.5 text-xs rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 focus:outline-none focus:ring-1 focus:ring-primary focus:border-primary transition-all font-semibold"
                        />
                        
                        <div className="flex bg-slate-100 dark:bg-slate-950 p-1 rounded-xl gap-1 border border-slate-200/50 dark:border-slate-850">
                          {['PRESENT', 'ABSENT', 'LATE', 'EXCUSED'].map((status) => {
                            const isSelected = attendance[std.id] === status;
                            let btnStyle = '';
                            if (isSelected) {
                              if (status === 'PRESENT') btnStyle = 'bg-success text-white';
                              if (status === 'ABSENT') btnStyle = 'bg-danger text-white';
                              if (status === 'LATE') btnStyle = 'bg-warning text-slate-905';
                              if (status === 'EXCUSED') btnStyle = 'bg-primary text-white';
                            } else {
                              btnStyle = 'text-slate-450 hover:text-slate-800 dark:hover:text-slate-205 hover:bg-white dark:hover:bg-slate-900';
                            }

                            return (
                              <button
                                key={status}
                                type="button"
                                onClick={() => handleStatusChange(std.id, status)}
                                className={`px-2.5 py-1 rounded-lg text-[9px] font-black uppercase tracking-wider transition-all ${btnStyle}`}
                                title={status}
                              >
                                {status.substring(0, 1)}
                              </button>
                            );
                          })}
                        </div>
                      </div>
                    </motion.div>
                  ))}
                </AnimatePresence>
              </div>
            )}
          </Card>
        </div>

      </div>
    </div>
  );
}
