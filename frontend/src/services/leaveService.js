import api from './api'

export const leaveService = {
  getLeaves: async (statusFilter = '') => {
    const url = statusFilter ? `leaves/requests/?status=${statusFilter}` : 'leaves/requests/'
    const response = await api.get(url)
    return response.data
  },

  applyLeave: async (leaveData) => {
    const response = await api.post('leaves/requests/', leaveData)
    return response.data
  },

  approveLeave: async (leaveId, approvalData) => {
    const response = await api.put(`leaves/requests/${leaveId}/approve/`, approvalData)
    return response.data
  },
}

export default leaveService
