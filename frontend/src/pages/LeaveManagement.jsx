import React, { useState, useEffect } from 'react'
import { useSelector } from 'react-redux'
import { Calendar, CheckCircle2, XCircle, AlertCircle, FileText, CornerDownRight, Clock, PlusCircle, Check, X, ShieldAlert, Loader2, Send } from 'lucide-react'
import { toast } from 'react-hot-toast'
import leaveService from '../services/leaveService'

export default function LeaveManagement() {
  const { user } = useSelector((state) => state.auth)
  const [leaves, setLeaves] = useState([])
  const [isLoading, setIsLoading] = useState(true)

  // Submit Leave Form States
  const [leaveType, setLeaveType] = useState('CASUAL')
  const [startDate, setStartDate] = useState('')
  const [endDate, setEndDate] = useState('')
  const [reason, setReason] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)

  // Review states
  const [reviewRemarks, setReviewRemarks] = useState({}) // leaveId -> string
  const [isReviewing, setIsReviewing] = useState({}) // leaveId -> boolean

  const fetchLeaves = async () => {
    setIsLoading(true)
    try {
      const data = await leaveService.getLeaves()
      setLeaves(data.results || data)
    } catch (err) {
      toast.error('Failed to load leave requests history.')
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    fetchLeaves()
  }, [])

  const handleSubmitRequest = async (e) => {
    e.preventDefault()
    if (!startDate || !endDate || !reason) {
      toast.error('Please fill out all request parameters.')
      return
    }

    setIsSubmitting(true)
    try {
      await leaveService.applyLeave({
        leave_type: leaveType,
        start_date: startDate,
        end_date: endDate,
        reason: reason
      })
      toast.success('Leave application submitted successfully!', { icon: '✈️' })
      setStartDate('')
      setEndDate('')
      setReason('')
      fetchLeaves()
    } catch (err) {
      toast.error(err.response?.data?.detail || 'Failed to submit leave request.')
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleProcessApproval = async (leaveId, status) => {
    const remarks = reviewRemarks[leaveId] || ''
    setIsReviewing(prev => ({ ...prev, [leaveId]: true }))
    try {
      await leaveService.approveLeave(leaveId, {
        status: status,
        remarks: remarks
      })
      toast.success(`Leave request ${status.toLowerCase()} successfully.`)
      fetchLeaves()
    } catch (err) {
      toast.error(err.response?.data?.detail || 'Failed to process leave request.')
    } finally {
      setIsReviewing(prev => ({ ...prev, [leaveId]: false }))
    }
  }

  const handleRemarkChange = (leaveId, val) => {
    setReviewRemarks(prev => ({ ...prev, [leaveId]: val }))
  }

  const pendingLeaves = leaves.filter(l => l.status === 'PENDING')
  const historicalLeaves = leaves.filter(l => l.status !== 'PENDING')

  const getStatusBadge = (statusVal) => {
    if (statusVal === 'APPROVED') return 'bg-success/15 text-success border-success/20'
    if (statusVal === 'REJECTED') return 'bg-danger/15 text-danger border-danger/20'
    return 'bg-warning/15 text-warning border-warning/20'
  }

  return (
    <div className="max-w-6xl mx-auto py-8 space-y-8">
      {/* Title */}
      <div>
        <h1 className="text-3xl font-extrabold tracking-tight">Leave Management</h1>
        <p className="text-sm text-slate-500">
          Apply for academic exemptions and manage student leave request approvals.
        </p>
      </div>

      {user?.role === 'STUDENT' ? (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          
          {/* Apply for Leave */}
          <div className="lg:col-span-1">
            <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-6 rounded-2xl shadow-soft space-y-6">
              <h3 className="font-bold text-lg border-b border-slate-100 dark:border-slate-800 pb-3 flex items-center gap-2">
                <PlusCircle className="w-5 h-5 text-primary" />
                Apply for Exemption
              </h3>

              <form onSubmit={handleSubmitRequest} className="space-y-4">
                <div className="space-y-2">
                  <label className="text-xs font-semibold uppercase tracking-wider text-slate-400">Leave Type</label>
                  <select
                    value={leaveType}
                    onChange={(e) => setLeaveType(e.target.value)}
                    className="w-full px-4 py-2.5 rounded-xl border border-slate-250 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-950/20 text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all font-medium"
                  >
                    <option value="SICK">Sick Leave</option>
                    <option value="CASUAL">Casual Leave</option>
                    <option value="MEDICAL">Medical Leave</option>
                    <option value="DUTY">On Duty / Duty Leave</option>
                    <option value="OTHER">Other Exemption</option>
                  </select>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <label className="text-xs font-semibold uppercase tracking-wider text-slate-400">Start Date</label>
                    <input
                      type="date"
                      value={startDate}
                      onChange={(e) => setStartDate(e.target.value)}
                      className="w-full px-4 py-2.5 rounded-xl border border-slate-250 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-950/20 text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all font-medium"
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-xs font-semibold uppercase tracking-wider text-slate-400">End Date</label>
                    <input
                      type="date"
                      value={endDate}
                      onChange={(e) => setEndDate(e.target.value)}
                      className="w-full px-4 py-2.5 rounded-xl border border-slate-250 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-950/20 text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all font-medium"
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="text-xs font-semibold uppercase tracking-wider text-slate-400">Reason / Description</label>
                  <textarea
                    rows="4"
                    value={reason}
                    onChange={(e) => setReason(e.target.value)}
                    placeholder="Brief description of the reason for exemption request..."
                    className="w-full px-4 py-2.5 rounded-xl border border-slate-250 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-950/20 text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all font-medium"
                  />
                </div>

                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="w-full py-3 px-4 mt-6 bg-primary hover:bg-primary-dark text-white rounded-xl font-bold text-sm shadow-soft transition-all active:scale-[0.98] disabled:opacity-50 flex items-center justify-center gap-2"
                >
                  {isSubmitting ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" />
                      Submitting Request...
                    </>
                  ) : (
                    <>
                      <Send className="w-4 h-4" />
                      Submit Application
                    </>
                  )}
                </button>
              </form>
            </div>
          </div>

          {/* Leaves History */}
          <div className="lg:col-span-2 space-y-6">
            <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-soft p-6 space-y-6">
              <h3 className="font-bold text-lg flex items-center gap-2 border-b border-slate-100 dark:border-slate-800 pb-3">
                <Calendar className="w-5 h-5 text-primary" />
                Exemption Request History
              </h3>

              {isLoading ? (
                <div className="p-12 text-center">
                  <Loader2 className="w-8 h-8 text-primary animate-spin mx-auto" />
                </div>
              ) : leaves.length === 0 ? (
                <div className="p-12 text-center text-slate-400 space-y-3">
                  <FileText className="w-12 h-12 text-slate-350 mx-auto" />
                  <p className="text-sm font-semibold">No requests submitted</p>
                  <p className="text-xs">Your leave request timeline is currently empty.</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {leaves.map((l) => (
                    <div key={l.id} className="p-4 border border-slate-100 dark:border-slate-850 hover:bg-slate-50/50 dark:hover:bg-slate-950/20 rounded-2xl transition-colors space-y-3">
                      <div className="flex justify-between items-start">
                        <div>
                          <span className="px-2 py-0.5 text-[10px] font-bold tracking-wider uppercase bg-primary/10 text-primary rounded">
                            {l.leave_type}
                          </span>
                          <h4 className="text-sm font-bold mt-1.5">
                            {l.start_date} to {l.end_date}
                          </h4>
                        </div>
                        <span className={`px-2.5 py-1 text-[10px] font-black uppercase rounded border ${getStatusBadge(l.status)}`}>
                          {l.status}
                        </span>
                      </div>
                      <p className="text-xs text-slate-500 font-medium">{l.reason}</p>
                      {l.remarks && (
                        <div className="text-[11px] bg-slate-50 dark:bg-slate-950/40 p-2.5 rounded-xl border border-slate-200/50 dark:border-slate-850 text-slate-500 flex items-start gap-1">
                          <CornerDownRight className="w-3.5 h-3.5 text-slate-400 mt-0.5" />
                          <span><strong>Remarks:</strong> {l.remarks}</span>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

        </div>
      ) : (
        /* Staff Exemption Request review panels */
        <div className="space-y-8">
          
          {/* Pending Applications */}
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-soft p-6 space-y-6">
            <h3 className="font-bold text-lg flex items-center gap-2 border-b border-slate-100 dark:border-slate-800 pb-3">
              <Clock className="w-5 h-5 text-warning" />
              Pending Exemptions Approvals Queue
            </h3>

            {isLoading ? (
              <div className="p-12 text-center">
                <Loader2 className="w-8 h-8 text-primary animate-spin mx-auto" />
              </div>
            ) : pendingLeaves.length === 0 ? (
              <div className="p-12 text-center text-slate-400 space-y-2">
                <CheckCircle2 className="w-12 h-12 text-success/70 mx-auto" />
                <p className="text-sm font-semibold">Inbox is clear</p>
                <p className="text-xs">No pending student exemption requests require review.</p>
              </div>
            ) : (
              <div className="space-y-6">
                {pendingLeaves.map((l) => (
                  <div key={l.id} className="p-5 border border-slate-100 dark:border-slate-850 bg-slate-50/20 dark:bg-slate-950/10 rounded-2xl flex flex-col md:flex-row md:items-start justify-between gap-6 hover:shadow-soft transition-all">
                    <div className="space-y-2 flex-grow">
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-sm text-slate-800 dark:text-slate-100">{l.user_name}</span>
                        <span className="text-xs text-slate-400">({l.user_email})</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="px-2 py-0.5 text-[9px] font-extrabold tracking-wider bg-primary/10 text-primary rounded">
                          {l.leave_type}
                        </span>
                        <span className="text-xs text-slate-500 font-bold">
                          {l.start_date} to {l.end_date}
                        </span>
                      </div>
                      <p className="text-xs text-slate-500 dark:text-slate-400 font-medium">{l.reason}</p>
                    </div>

                    {/* Action Block */}
                    <div className="space-y-3 min-w-[240px]">
                      <input
                        type="text"
                        value={reviewRemarks[l.id] || ''}
                        onChange={(e) => handleRemarkChange(l.id, e.target.value)}
                        placeholder="Add review remarks..."
                        className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-950/30 focus:outline-none focus:ring-1 focus:ring-primary focus:border-primary transition-all"
                      />
                      
                      <div className="flex gap-2">
                        <button
                          onClick={() => handleProcessApproval(l.id, 'APPROVED')}
                          disabled={isReviewing[l.id]}
                          className="flex-1 py-2 rounded-xl bg-success hover:bg-success-dark text-white text-xs font-bold shadow-soft transition-colors flex items-center justify-center gap-1"
                        >
                          <Check className="w-3.5 h-3.5" /> Approve
                        </button>
                        <button
                          onClick={() => handleProcessApproval(l.id, 'REJECTED')}
                          disabled={isReviewing[l.id]}
                          className="flex-1 py-2 rounded-xl bg-danger/10 hover:bg-danger/25 text-danger border border-danger/10 text-xs font-bold transition-colors flex items-center justify-center gap-1"
                        >
                          <X className="w-3.5 h-3.5" /> Reject
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Historical Approvals */}
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-soft p-6 space-y-6">
            <h3 className="font-bold text-lg flex items-center gap-2 border-b border-slate-100 dark:border-slate-800 pb-3">
              <CheckCircle2 className="w-5 h-5 text-success" />
              Processed Applications Archive
            </h3>

            {isLoading ? (
              <div className="p-6 text-center">
                <Loader2 className="w-8 h-8 text-primary animate-spin mx-auto" />
              </div>
            ) : historicalLeaves.length === 0 ? (
              <p className="text-xs text-slate-400 text-center py-6">No historical requests processed.</p>
            ) : (
              <div className="divide-y divide-slate-100 dark:divide-slate-850">
                {historicalLeaves.map((l) => (
                  <div key={l.id} className="py-4 flex flex-col md:flex-row md:items-center justify-between gap-4">
                    <div className="text-left space-y-1">
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-xs text-slate-850 dark:text-slate-200">{l.user_name}</span>
                        <span className="px-1.5 py-0.5 text-[8px] font-extrabold tracking-wider bg-primary/10 text-primary rounded uppercase">
                          {l.leave_type}
                        </span>
                      </div>
                      <p className="text-xs text-slate-400 font-medium">
                        Exemption duration: {l.start_date} to {l.end_date}
                      </p>
                      {l.remarks && (
                        <p className="text-[10px] text-slate-500">
                          <strong>Note:</strong> {l.remarks}
                        </p>
                      )}
                    </div>

                    <div className="flex items-center gap-3">
                      <span className="text-[10px] text-slate-400 font-medium">
                        Reviewed by: {l.approved_by_name || 'Staff'}
                      </span>
                      <span className={`px-2 py-0.5 text-[9px] font-black uppercase rounded border ${getStatusBadge(l.status)}`}>
                        {l.status}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

        </div>
      )}
    </div>
  )
}
