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
}

export default authService
