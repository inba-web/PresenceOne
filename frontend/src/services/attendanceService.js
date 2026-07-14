import api from './api'

export const attendanceService = {
  getFacultySubjects: async () => {
    const response = await api.get('attendance/faculty/subjects/')
    return response.data
  },

  getFacultyStudents: async (subjectId) => {
    const response = await api.get(`attendance/faculty/students/?subject_id=${subjectId}`)
    return response.data
  },

  createSession: async (sessionData) => {
    const response = await api.post('attendance/sessions/', sessionData)
    return response.data
  },

  bulkMarkAttendance: async (sessionId, recordData) => {
    const response = await api.post(`attendance/sessions/${sessionId}/bulk-mark/`, recordData)
    return response.data
  },

  getStudentSummary: async () => {
    const response = await api.get('attendance/student/summary/')
    return response.data
  },

  getAnalyticsSummary: async () => {
    const response = await api.get('attendance/analytics/summary/')
    return response.data
  },

  exportAttendanceCSV: async (subjectId) => {
    const response = await api.get(`attendance/export/csv/?subject_id=${subjectId}`, {
      responseType: 'blob'
    })
    return response.data
  },
}

export default attendanceService
