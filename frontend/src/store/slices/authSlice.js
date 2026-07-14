import { createSlice } from '@reduxjs/toolkit'

const getInitialUser = () => {
  const user = localStorage.getItem('user')
  try {
    return user ? JSON.parse(user) : null
  } catch {
    return null
  }
}

const initialState = {
  token: localStorage.getItem('token') || null,
  refreshToken: localStorage.getItem('refreshToken') || null,
  user: getInitialUser(),
  isAuthenticated: !!localStorage.getItem('token'),
  isLoading: false,
  error: null,
}

const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    loginStart: (state) => {
      state.isLoading = true
      state.error = null
    },
    loginSuccess: (state, action) => {
      const { access, refresh, user } = action.payload
      state.isLoading = false
      state.isAuthenticated = true
      state.token = access
      state.refreshToken = refresh
      state.user = user
      state.error = null

      localStorage.setItem('token', access)
      localStorage.setItem('refreshToken', refresh)
      localStorage.setItem('user', JSON.stringify(user))
    },
    loginFailure: (state, action) => {
      state.isLoading = false
      state.isAuthenticated = false
      state.token = null
      state.refreshToken = null
      state.user = null
      state.error = action.payload
    },
    logout: (state) => {
      state.token = null
      state.refreshToken = null
      state.user = null
      state.isAuthenticated = false
      state.isLoading = false
      state.error = null

      localStorage.removeItem('token')
      localStorage.removeItem('refreshToken')
      localStorage.removeItem('user')
    },
    updateProfileSuccess: (state, action) => {
      // Merge updated profile fields into current user state
      if (state.user) {
        state.user = { ...state.user, ...action.payload }
        localStorage.setItem('user', JSON.stringify(state.user))
      }
    },
    clearError: (state) => {
      state.error = null
    }
  },
})

export const {
  loginStart,
  loginSuccess,
  loginFailure,
  logout,
  updateProfileSuccess,
  clearError
} = authSlice.actions

export default authSlice.reducer
