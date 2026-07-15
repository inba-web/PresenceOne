import api from './api'

export const authService = {
  login: async (credentials) => {
    const response = await api.post('auth/login/', credentials)
    return response.data
  },

  logout: async (refreshToken) => {
    const response = await api.post('auth/logout/', { refresh: refreshToken })
    return response.data
  },

  getProfile: async () => {
    const response = await api.get('auth/profile/')
    return response.data
  },

  updateProfile: async (profileData) => {
    const response = await api.put('auth/profile/', profileData)
    return response.data
  },

  changePassword: async (passwordData) => {
    const response = await api.post('auth/change-password/', passwordData)
    return response.data
  },

  resetPasswordRequest: async (emailData) => {
    const response = await api.post('auth/reset-password/', emailData)
    return response.data
  },

  resetPasswordConfirm: async (resetData) => {
    const response = await api.post('auth/reset-password/confirm/', resetData)
    return response.data
  },

  registerStudent: async (studentData) => {
    const response = await api.post('auth/register/student/', studentData)
    return response.data
  },

  registerFaculty: async (facultyData) => {
    const response = await api.post('auth/register/faculty/', facultyData)
    return response.data
  },

  getDepartments: async () => {
    const response = await api.get('departments/')
    return response.data
  },

  getCourses: async (departmentId = '') => {
    const url = departmentId ? `courses/?department_id=${departmentId}` : 'courses/'
    const response = await api.get(url)
    return response.data
  },
}

export default authService
