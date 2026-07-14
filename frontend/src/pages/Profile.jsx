import React, { useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import * as z from 'zod'
import { useDispatch, useSelector } from 'react-redux'
import { motion } from 'framer-motion'
import { User, Phone, Mail, Key, Shield, Loader2, Save } from 'lucide-react'
import { toast } from 'react-hot-toast'
import { updateProfileSuccess } from '../store/slices/authSlice'
import authService from '../services/authService'

const profileSchema = z.object({
  first_name: z.string().min(2, { message: 'First name must be at least 2 characters' }),
  last_name: z.string().min(1, { message: 'Last name is required' }),
  phone: z.string().optional().or(z.literal('')),
})

const passwordSchema = z.object({
  old_password: z.string().min(1, { message: 'Current password is required' }),
  new_password: z.string().min(8, { message: 'New password must be at least 8 characters' }),
})

export default function Profile() {
  const { user } = useSelector((state) => state.auth)
  const dispatch = useDispatch()
  const [isSavingProfile, setIsSavingProfile] = useState(false)
  const [isChangingPassword, setIsChangingPassword] = useState(false)

  // Profile Form
  const {
    register: registerProfile,
    handleSubmit: handleProfileSubmit,
    formState: { errors: profileErrors },
  } = useForm({
    resolver: zodResolver(profileSchema),
    defaultValues: {
      first_name: user?.first_name || '',
      last_name: user?.last_name || '',
      phone: user?.phone || '',
    },
  })

  // Password Form
  const {
    register: registerPassword,
    handleSubmit: handlePasswordSubmit,
    reset: resetPasswordForm,
    formState: { errors: passwordErrors },
  } = useForm({
    resolver: zodResolver(passwordSchema),
    defaultValues: {
      old_password: '',
      new_password: '',
    },
  })

  const onUpdateProfile = async (data) => {
    setIsSavingProfile(true)
    try {
      const updatedUser = await authService.updateProfile(data)
      dispatch(updateProfileSuccess(updatedUser))
      toast.success('Profile updated successfully!', {
        style: { borderRadius: '10px', background: '#1E293B', color: '#fff' },
      })
    } catch (error) {
      const errMsg = error.response?.data?.detail || 'Failed to update profile.'
      toast.error(errMsg, {
        style: { borderRadius: '10px', background: '#1E293B', color: '#fff' },
      })
    } finally {
      setIsSavingProfile(false)
    }
  }

  const onChangePassword = async (data) => {
    setIsChangingPassword(true)
    try {
      await authService.changePassword(data)
      toast.success('Password updated successfully!', {
        style: { borderRadius: '10px', background: '#1E293B', color: '#fff' },
      })
      resetPasswordForm()
    } catch (error) {
      // Map DRF custom errors
      const errors = error.response?.data
      const errMsg = errors?.old_password?.[0] || errors?.new_password?.[0] || errors?.detail || 'Failed to update password.'
      toast.error(errMsg, {
        style: { borderRadius: '10px', background: '#1E293B', color: '#fff' },
      })
    } finally {
      setIsChangingPassword(false)
    }
  }

  return (
    <div className="max-w-4xl mx-auto space-y-8 py-8">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-extrabold tracking-tight">Account Settings</h1>
        <p className="text-sm text-slate-500 dark:text-slate-400">
          Manage your account profile details, phone numbers, and security credentials.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        {/* Left Side: Summary Card */}
        <div className="md:col-span-1 space-y-6">
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-6 rounded-2xl shadow-soft text-center space-y-4">
            <div className="w-20 h-20 bg-primary/10 text-primary rounded-full flex items-center justify-center text-3xl font-bold mx-auto border border-primary/20 shadow-soft">
              {user?.first_name?.[0]?.toUpperCase() || user?.email?.[0]?.toUpperCase() || 'U'}
            </div>
            <div>
              <h3 className="font-bold text-lg">
                {user?.first_name} {user?.last_name}
              </h3>
              <p className="text-xs font-semibold text-primary uppercase tracking-wider bg-primary/10 px-2.5 py-1 rounded-full inline-block mt-1">
                {user?.role?.replace('_', ' ')}
              </p>
            </div>
            <div className="text-xs text-slate-400 border-t border-slate-100 dark:border-slate-800/80 pt-4 flex items-center justify-center gap-1.5">
              <Shield className="w-3.5 h-3.5" />
              <span>Two-Factor Authentication Ready</span>
            </div>
          </div>
        </div>

        {/* Right Side: Settings Tabs / Cards */}
        <div className="md:col-span-2 space-y-8">
          {/* Card 1: Profile Info */}
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-soft p-6">
            <div className="flex items-center gap-2 mb-6 border-b border-slate-100 dark:border-slate-800/80 pb-4">
              <User className="w-5 h-5 text-primary" />
              <h2 className="text-lg font-bold">Personal Profile</h2>
            </div>

            <form onSubmit={handleProfileSubmit(onUpdateProfile)} className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="text-xs font-semibold uppercase tracking-wider text-slate-400 dark:text-slate-500">
                    First Name
                  </label>
                  <input
                    {...registerProfile('first_name')}
                    type="text"
                    className="w-full px-4 py-2 rounded-xl border border-slate-250 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-950/20 text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all"
                  />
                  {profileErrors.first_name && (
                    <span className="text-xs text-danger">{profileErrors.first_name.message}</span>
                  )}
                </div>

                <div className="space-y-2">
                  <label className="text-xs font-semibold uppercase tracking-wider text-slate-400 dark:text-slate-500">
                    Last Name
                  </label>
                  <input
                    {...registerProfile('last_name')}
                    type="text"
                    className="w-full px-4 py-2 rounded-xl border border-slate-250 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-950/20 text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all"
                  />
                  {profileErrors.last_name && (
                    <span className="text-xs text-danger">{profileErrors.last_name.message}</span>
                  )}
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-xs font-semibold uppercase tracking-wider text-slate-400 dark:text-slate-500">
                  Email Address (Read-only)
                </label>
                <div className="relative">
                  <Mail className="absolute left-3 top-2.5 w-4 h-4 text-slate-400" />
                  <input
                    type="email"
                    disabled
                    value={user?.email || ''}
                    className="w-full pl-10 pr-4 py-2 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-100 dark:bg-slate-900 text-slate-400 text-sm cursor-not-allowed"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-xs font-semibold uppercase tracking-wider text-slate-400 dark:text-slate-500">
                  Phone Number
                </label>
                <div className="relative">
                  <Phone className="absolute left-3 top-2.5 w-4 h-4 text-slate-400" />
                  <input
                    {...registerProfile('phone')}
                    type="tel"
                    placeholder="Enter phone number"
                    className="w-full pl-10 pr-4 py-2 rounded-xl border border-slate-250 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-950/20 text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all"
                  />
                </div>
              </div>

              <div className="flex justify-end pt-4">
                <button
                  type="submit"
                  disabled={isSavingProfile}
                  className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-primary hover:bg-primary-dark text-white font-medium text-sm transition-all shadow-soft disabled:opacity-50"
                >
                  {isSavingProfile ? (
                    <Loader2 className="w-4 h-4 animate-spin" />
                  ) : (
                    <Save className="w-4 h-4" />
                  )}
                  Save Changes
                </button>
              </div>
            </form>
          </div>

          {/* Card 2: Security settings (password change) */}
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-soft p-6">
            <div className="flex items-center gap-2 mb-6 border-b border-slate-100 dark:border-slate-800/80 pb-4">
              <Key className="w-5 h-5 text-primary" />
              <h2 className="text-lg font-bold">Update Password</h2>
            </div>

            <form onSubmit={handlePasswordSubmit(onChangePassword)} className="space-y-4">
              <div className="space-y-2">
                <label className="text-xs font-semibold uppercase tracking-wider text-slate-400 dark:text-slate-500">
                  Current Password
                </label>
                <input
                  {...registerPassword('old_password')}
                  type="password"
                  placeholder="••••••••"
                  className="w-full px-4 py-2 rounded-xl border border-slate-250 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-950/20 text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all"
                />
                {passwordErrors.old_password && (
                  <span className="text-xs text-danger">{passwordErrors.old_password.message}</span>
                )}
              </div>

              <div className="space-y-2">
                <label className="text-xs font-semibold uppercase tracking-wider text-slate-400 dark:text-slate-500">
                  New Password
                </label>
                <input
                  {...registerPassword('new_password')}
                  type="password"
                  placeholder="••••••••"
                  className="w-full px-4 py-2 rounded-xl border border-slate-250 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-950/20 text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all"
                />
                {passwordErrors.new_password && (
                  <span className="text-xs text-danger">{passwordErrors.new_password.message}</span>
                )}
              </div>

              <div className="flex justify-end pt-4">
                <button
                  type="submit"
                  disabled={isChangingPassword}
                  className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-primary hover:bg-primary-dark text-white font-medium text-sm transition-all shadow-soft disabled:opacity-50"
                >
                  {isChangingPassword ? (
                    <Loader2 className="w-4 h-4 animate-spin" />
                  ) : (
                    <Key className="w-4 h-4" />
                  )}
                  Update Password
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  )
}
