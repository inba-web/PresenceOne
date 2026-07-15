import React, { useState, useEffect } from 'react';
import { useSelector } from 'react-redux';
import { Calendar, CheckCircle2, XCircle, AlertCircle, FileText, CornerDownRight, Clock, PlusCircle, Check, X, ShieldAlert, Loader2, Send } from 'lucide-react';
import { toast } from 'react-hot-toast';
import leaveService from '../services/leaveService';
import Card from '../components/ui/Card';
import Badge from '../components/ui/Badge';
import Button from '../components/ui/Button';
import Input from '../components/ui/Input';

export default function LeaveManagement() {
  const { user } = useSelector((state) => state.auth);
  const [leaves, setLeaves] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  // Submit Leave Form States
  const [leaveType, setLeaveType] = useState('CASUAL');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [reason, setReason] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Review states
  const [reviewRemarks, setReviewRemarks] = useState({}); // leaveId -> string
  const [isReviewing, setIsReviewing] = useState({}); // leaveId -> boolean

  const fetchLeaves = async () => {
    setIsLoading(true);
    try {
      const data = await leaveService.getLeaves();
      setLeaves(data.results || data);
    } catch (err) {
      toast.error('Failed to load leave requests history.');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchLeaves();
  }, []);

  const handleSubmitRequest = async (e) => {
    e.preventDefault();
    if (!startDate || !endDate || !reason) {
      toast.error('Please fill out all request parameters.');
      return;
    }

    setIsSubmitting(true);
    try {
      await leaveService.applyLeave({
        leave_type: leaveType,
        start_date: startDate,
        end_date: endDate,
        reason: reason
      });
      toast.success('Leave application submitted successfully!', {
        icon: '✈️',
        style: {
          borderRadius: '12px',
          background: '#111827',
          color: '#fff',
          border: '1px solid rgba(255, 255, 255, 0.05)'
        }
      });
      setStartDate('');
      setEndDate('');
      setReason('');
      fetchLeaves();
    } catch (err) {
      toast.error(err.response?.data?.detail || 'Failed to submit leave request.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleProcessApproval = async (leaveId, status) => {
    const remarks = reviewRemarks[leaveId] || '';
    setIsReviewing(prev => ({ ...prev, [leaveId]: true }));
    try {
      await leaveService.approveLeave(leaveId, {
        status: status,
        remarks: remarks
      });
      toast.success(`Leave request ${status.toLowerCase()} successfully.`, {
        style: {
          borderRadius: '12px',
          background: '#111827',
          color: '#fff',
          border: '1px solid rgba(255, 255, 255, 0.05)'
        }
      });
      fetchLeaves();
    } catch (err) {
      toast.error(err.response?.data?.detail || 'Failed to process leave request.');
    } finally {
      setIsReviewing(prev => ({ ...prev, [leaveId]: false }));
    }
  };

  const handleRemarkChange = (leaveId, val) => {
    setReviewRemarks(prev => ({ ...prev, [leaveId]: val }));
  };

  const pendingLeaves = leaves.filter(l => l.status === 'PENDING');
  const historicalLeaves = leaves.filter(l => l.status !== 'PENDING');

  const getStatusBadgeVariant = (statusVal) => {
    if (statusVal === 'APPROVED') return 'success';
    if (statusVal === 'REJECTED') return 'danger';
    return 'warning';
  };

  return (
    <div className="max-w-6xl mx-auto py-2 space-y-8">
      
      {/* Title */}
      <div className="border-b border-slate-200/50 dark:border-slate-800/80 pb-6 text-left">
        <h1 className="text-3xl font-extrabold tracking-tight">Leave Exemption Management</h1>
        <p className="text-sm text-slate-500 dark:text-slate-400 mt-1 font-medium">
          Request class absence exemptions or manage student approval pipelines.
        </p>
      </div>

      {user?.role === 'STUDENT' ? (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          
          {/* Apply for Exemption */}
          <div className="lg:col-span-1 text-left">
            <Card className="p-6 space-y-6">
              <h3 className="font-extrabold text-lg flex items-center gap-2 border-b border-slate-100 dark:border-slate-800/80 pb-3">
                <PlusCircle className="w-5 h-5 text-primary" /> Apply for Exemption
              </h3>

              <form onSubmit={handleSubmitRequest} className="space-y-4">
                
                {/* Leave type */}
                <div className="space-y-1.5">
                  <label className="block text-xs font-semibold uppercase tracking-wider text-slate-455 dark:text-slate-550">Leave Type</label>
                  <select
                    value={leaveType}
                    onChange={(e) => setLeaveType(e.target.value)}
                    className="w-full px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 transition-all font-semibold"
                  >
                    <option value="SICK">Sick Leave</option>
                    <option value="CASUAL">Casual Leave</option>
                    <option value="MEDICAL">Medical Leave</option>
                    <option value="DUTY">On Duty / Duty Leave</option>
                    <option value="OTHER">Other Exemption</option>
                  </select>
                </div>

                {/* Dates */}
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-1.5">
                    <label className="block text-xs font-semibold uppercase tracking-wider text-slate-455">Start Date</label>
                    <input
                      type="date"
                      value={startDate}
                      onChange={(e) => setStartDate(e.target.value)}
                      className="w-full px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 transition-all font-semibold"
                    />
                  </div>
                  <div className="space-y-1.5">
                    <label className="block text-xs font-semibold uppercase tracking-wider text-slate-455">End Date</label>
                    <input
                      type="date"
                      value={endDate}
                      onChange={(e) => setEndDate(e.target.value)}
                      className="w-full px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 transition-all font-semibold"
                    />
                  </div>
                </div>

                {/* Reason description */}
                <div className="space-y-1.5">
                  <label className="block text-xs font-semibold uppercase tracking-wider text-slate-455">Exemption Reason</label>
                  <textarea
                    rows="4"
                    value={reason}
                    onChange={(e) => setReason(e.target.value)}
                    placeholder="Describe the medical context or official details..."
                    className="w-full px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 transition-all font-semibold"
                  />
                </div>

                <Button
                  type="submit"
                  variant="primary"
                  isLoading={isSubmitting}
                  className="w-full py-3 mt-6 shadow-soft"
                >
                  <Send className="w-4 h-4 mr-1.5" /> Submit Request Link
                </Button>
              </form>
            </Card>
          </div>

          {/* Leave History List */}
          <div className="lg:col-span-2 space-y-6 text-left">
            <Card className="p-6 space-y-6">
              <h3 className="font-extrabold text-lg flex items-center gap-2 border-b border-slate-100 dark:border-slate-800 pb-3">
                <Calendar className="w-5 h-5 text-primary" /> Exemption Requests History
              </h3>

              {isLoading ? (
                <div className="p-12 text-center">
                  <Loader2 className="w-8 h-8 text-primary animate-spin mx-auto" />
                </div>
              ) : leaves.length === 0 ? (
                <div className="p-12 text-center text-slate-400 space-y-3">
                  <FileText className="w-12 h-12 text-slate-350 mx-auto animate-pulse" />
                  <p className="text-sm font-bold">No requests submitted</p>
                  <p className="text-xs">Your leaves/exemptions log history is currently empty.</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {leaves.map((l) => (
                    <div
                      key={l.id}
                      className="p-4 border border-slate-200/60 dark:border-slate-800/80 hover:bg-slate-50/25 dark:hover:bg-slate-950/25 rounded-2xl transition-colors space-y-3 text-left"
                    >
                      <div className="flex justify-between items-start">
                        <div className="space-y-1">
                          <Badge variant="primary" className="text-[9px] font-black">
                            {l.leave_type}
                          </Badge>
                          <h4 className="text-sm font-extrabold mt-1">
                            {l.start_date} to {l.end_date}
                          </h4>
                        </div>
                        <Badge variant={getStatusBadgeVariant(l.status)} className="text-[9px] font-black">
                          {l.status}
                        </Badge>
                      </div>
                      
                      <p className="text-xs text-slate-500 dark:text-slate-400 font-semibold">{l.reason}</p>
                      
                      {l.remarks && (
                        <div className="text-[11px] bg-slate-50 dark:bg-slate-950/40 p-3 rounded-xl border border-slate-200/50 dark:border-slate-850 text-slate-500 dark:text-slate-400 flex items-start gap-1.5 font-medium">
                          <CornerDownRight className="w-3.5 h-3.5 text-slate-400 flex-shrink-0 mt-0.5" />
                          <span><strong>Review Note:</strong> {l.remarks}</span>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </Card>
          </div>

        </div>
      ) : (
        /* Staff approval interface queue */
        <div className="space-y-8 text-left">
          
          {/* Pending Applications queue */}
          <Card className="p-6 space-y-6">
            <h3 className="font-extrabold text-lg flex items-center gap-2 border-b border-slate-100 dark:border-slate-800 pb-3">
              <Clock className="w-5 h-5 text-warning" /> Pending Approvals Queue
            </h3>

            {isLoading ? (
              <div className="p-12 text-center">
                <Loader2 className="w-8 h-8 text-primary animate-spin mx-auto" />
              </div>
            ) : pendingLeaves.length === 0 ? (
              <div className="p-16 text-center text-slate-400 space-y-3">
                <CheckCircle2 className="w-12 h-12 text-success/80 mx-auto" />
                <p className="text-sm font-bold text-slate-500">Inbox is clean</p>
                <p className="text-xs">No student leave requests require immediate action.</p>
              </div>
            ) : (
              <div className="space-y-6">
                {pendingLeaves.map((l) => (
                  <div
                    key={l.id}
                    className="p-5 border border-slate-200/60 dark:border-slate-800/80 bg-slate-50/20 dark:bg-slate-950/10 rounded-2xl flex flex-col md:flex-row md:items-start justify-between gap-6 hover:shadow-soft transition-all"
                  >
                    <div className="space-y-2 flex-grow text-left">
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-sm text-slate-850 dark:text-slate-100">{l.user_name}</span>
                        <span className="text-xs text-slate-450">({l.user_email})</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <Badge variant="primary" className="text-[9px] font-black">{l.leave_type}</Badge>
                        <span className="text-xs text-slate-500 font-extrabold">
                          Duration: {l.start_date} to {l.end_date}
                        </span>
                      </div>
                      <p className="text-xs text-slate-650 dark:text-slate-400 font-semibold">{l.reason}</p>
                    </div>

                    {/* Action Block */}
                    <div className="space-y-3 min-w-[240px]">
                      <input
                        type="text"
                        value={reviewRemarks[l.id] || ''}
                        onChange={(e) => handleRemarkChange(l.id, e.target.value)}
                        placeholder="Add verification notes..."
                        className="w-full px-3.5 py-2 text-xs rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-950/30 focus:outline-none focus:ring-1 focus:ring-primary focus:border-primary transition-all font-semibold"
                      />
                      
                      <div className="flex gap-2">
                        <Button
                          onClick={() => handleProcessApproval(l.id, 'APPROVED')}
                          disabled={isReviewing[l.id]}
                          variant="primary"
                          className="flex-1 text-xs py-2 bg-success hover:bg-success-dark"
                        >
                          <Check className="w-3.5 h-3.5 mr-1" /> Approve
                        </Button>
                        <Button
                          onClick={() => handleProcessApproval(l.id, 'REJECTED')}
                          disabled={isReviewing[l.id]}
                          variant="secondary"
                          className="flex-1 text-xs py-2 text-danger hover:bg-danger/10"
                        >
                          <X className="w-3.5 h-3.5 mr-1" /> Reject
                        </Button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </Card>

          {/* Historical approvals list */}
          <Card className="p-6 space-y-6">
            <h3 className="font-extrabold text-lg flex items-center gap-2 border-b border-slate-100 dark:border-slate-800 pb-3">
              <CheckCircle2 className="w-5 h-5 text-success" /> Processed Exemptions Archive
            </h3>

            {isLoading ? (
              <div className="p-6 text-center">
                <Loader2 className="w-8 h-8 text-primary animate-spin" />
              </div>
            ) : historicalLeaves.length === 0 ? (
              <p className="text-xs text-slate-400 text-center py-6">No historical exemptions logged.</p>
            ) : (
              <div className="divide-y divide-slate-100 dark:divide-slate-850">
                {historicalLeaves.map((l) => (
                  <div key={l.id} className="py-4 flex flex-col md:flex-row md:items-center justify-between gap-4">
                    <div className="text-left space-y-1">
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-xs text-slate-850 dark:text-slate-200">{l.user_name}</span>
                        <Badge variant="primary" className="text-[9px] font-black">{l.leave_type}</Badge>
                      </div>
                      <p className="text-xs text-slate-450 dark:text-slate-500 font-semibold">
                        Duration: {l.start_date} to {l.end_date}
                      </p>
                      {l.remarks && (
                        <p className="text-[10px] text-slate-500 font-medium">
                          <strong>Note:</strong> {l.remarks}
                        </p>
                      )}
                    </div>

                    <div className="flex items-center gap-3">
                      <span className="text-[10px] text-slate-400 font-semibold">
                        Reviewed by: {l.approved_by_name || 'Staff Advisor'}
                      </span>
                      <Badge variant={getStatusBadgeVariant(l.status)} className="text-[9px] font-black">
                        {l.status}
                      </Badge>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </Card>

        </div>
      )}
    </div>
  );
}
