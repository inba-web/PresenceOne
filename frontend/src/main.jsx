import React from 'react'
import ReactDOM from 'react-dom/client'
import { Provider } from 'react-redux'
import { Toaster } from 'react-hot-toast'
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import store from './store'
import Layout from './components/Layout'
import Login from './pages/Login'
import ForgotPassword from './pages/ForgotPassword'
import Dashboard from './pages/Dashboard'
import Profile from './pages/Profile'
import MarkAttendance from './pages/MarkAttendance'
import LeaveManagement from './pages/LeaveManagement'
import Unauthorized from './pages/Unauthorized'
import NotFound from './pages/NotFound'
import DummyPlaceholder from './pages/DummyPlaceholder'
import { PrivateRoute, PublicRoute } from './routes/guards'
import './index.css'

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <Provider store={store}>
      <Toaster position="top-right" reverseOrder={false} />
      <BrowserRouter>
        <Routes>
          {/* Public Authentication Routes */}
          <Route element={<PublicRoute />}>
            <Route path="/login" element={<Login />} />
            <Route path="/forgot-password" element={<ForgotPassword />} />
          </Route>

          {/* Secure Authenticated Routes */}
          <Route element={<PrivateRoute />}>
            <Route element={<Layout />}>
              <Route path="/" element={<Navigate to="/dashboard" replace />} />
              <Route path="/dashboard" element={<Dashboard />} />
              <Route path="/profile" element={<Profile />} />
              
              {/* Feature Placeholders - Built Step-by-Step */}
              <Route path="/students" element={<DummyPlaceholder />} />
              <Route path="/faculty" element={<DummyPlaceholder />} />
              <Route path="/departments" element={<DummyPlaceholder />} />
              <Route path="/courses" element={<DummyPlaceholder />} />
              <Route path="/attendance" element={<MarkAttendance />} />
              <Route path="/leaves" element={<LeaveManagement />} />
            </Route>
          </Route>

          {/* Error Pages */}
          <Route path="/unauthorized" element={<Unauthorized />} />
          <Route path="*" element={<NotFound />} />
        </Routes>
      </BrowserRouter>
    </Provider>
  </React.StrictMode>
)
