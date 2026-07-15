import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { useDispatch, useSelector } from 'react-redux';
import { motion, AnimatePresence } from 'framer-motion';
import { User, Phone, Mail, Key, Shield, Loader2, Save, Award, CheckCircle, Activity, Clock } from 'lucide-react';
import { toast } from 'react-hot-toast';
import { updateProfileSuccess } from '../store/slices/authSlice';
import authService from '../services/authService';
import Card from '../components/ui/Card';
import Badge from '../components/ui/Badge';
import Button from '../components/ui/Button';
import Input from '../components/ui/Input';

const profileSchema = z.object({
  first_name: z.string().min(2, { message: 'First name must be at least 2 characters' }),
  last_name: z.string().min(1, { message: 'Last name is required' }),
  phone: z.string().optional().or(z.literal('')),
});

const passwordSchema = z.object({
  old_password: z.string().min(1, { message: 'Current password is required' }),
  new_password: z.string().min(8, { message: 'New password must be at least 8 characters' }),
});

export default function Profile() {
  const { user } = useSelector((state) => state.auth);
  const dispatch = useDispatch();
  const [isSavingProfile, setIsSavingProfile] = useState(false);
  const [isChangingPassword, setIsChangingPassword] = useState(false);
  const [activeTab, setActiveTab] = useState('profile'); // 'profile' | 'security'

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
  });

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
  });

  const onUpdateProfile = async (data) => {
    setIsSavingProfile(true);
    try {
      const updatedUser = await authService.updateProfile(data);
      dispatch(updateProfileSuccess(updatedUser));
      toast.success('Profile updated successfully!', {
        style: { borderRadius: '12px', background: '#111827', color: '#fff', border: '1px solid rgba(255, 255, 255, 0.05)' },
      });
    } catch (error) {
      const errMsg = error.response?.data?.detail || 'Failed to update profile.';
      toast.error(errMsg, {
        style: { borderRadius: '12px', background: '#111827', color: '#fff', border: '1px solid rgba(255, 255, 255, 0.05)' },
      });
    } finally {
      setIsSavingProfile(false);
    }
  };

  const onChangePassword = async (data) => {
    setIsChangingPassword(true);
    try {
      await authService.changePassword(data);
      toast.success('Password updated successfully!', {
        style: { borderRadius: '12px', background: '#111827', color: '#fff', border: '1px solid rgba(255, 255, 255, 0.05)' },
      });
      resetPasswordForm();
    } catch (error) {
      const errors = error.response?.data;
      const errMsg = errors?.old_password?.[0] || errors?.new_password?.[0] || errors?.detail || 'Failed to update password.';
      toast.error(errMsg, {
        style: { borderRadius: '12px', background: '#111827', color: '#fff', border: '1px solid rgba(255, 255, 255, 0.05)' },
      });
    } finally {
      setIsChangingPassword(false);
    }
  };

  // Calculate profile completion percentage based on filled user details
  const getProfileCompletion = () => {
    let score = 30; // base email & role
    if (user?.first_name) score += 25;
    if (user?.last_name) score += 20;
    if (user?.phone) score += 25;
    return score;
  };

  return (
    <div className="max-w-5xl mx-auto space-y-8 py-2">
      
      {/* Header section */}
      <div className="border-b border-slate-200/50 dark:border-slate-800/80 pb-6 text-left">
        <h1 className="text-3xl font-extrabold tracking-tight">Account Settings</h1>
        <p className="text-sm text-slate-500 dark:text-slate-400 mt-1 font-medium">
          Manage your personal details, secure keys, and system settings.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* LEFT PANEL: User Initials & Stats widgets */}
        <div className="space-y-6">
          
          <Card className="p-6 text-center space-y-4">
            {/* Initials avatar */}
            <div className="w-20 h-20 bg-primary/10 text-primary rounded-full flex items-center justify-center text-3xl font-extrabold mx-auto border border-primary/25 shadow-soft">
              {user?.first_name?.[0]?.toUpperCase() || 'U'}
            </div>
            
            <div className="space-y-1">
              <h3 className="font-extrabold text-lg">
                {user?.first_name} {user?.last_name}
              </h3>
              <Badge variant="primary" className="text-[9px] font-black">
                {user?.role?.replace('_', ' ')}
              </Badge>
            </div>

            <div className="text-xs text-slate-400 dark:text-slate-500 border-t border-slate-100 dark:border-slate-850 pt-4 flex items-center justify-center gap-1.5 font-semibold">
              <Shield className="w-3.5 h-3.5 text-primary" />
              <span>Two-Factor Authentication Ready</span>
            </div>
          </Card>

          {/* Profile Completion percentage wheel card */}
          <Card className="p-6 text-left space-y-4">
            <h4 className="font-extrabold text-sm uppercase tracking-wider text-slate-400">Profile Completion</h4>
            
            <div className="flex items-center gap-4">
              <div className="w-16 h-16 flex items-center justify-center relative flex-shrink-0">
                <svg className="w-full h-full transform -rotate-90">
                  <circle cx="32" cy="32" r="28" className="stroke-slate-100 dark:stroke-slate-800 fill-none" strokeWidth="4.5" />
                  <circle
                    cx="32"
                    cy="32"
                    r="28"
                    className="stroke-emerald-500 fill-none transition-all duration-500"
                    strokeWidth="4.5"
                    strokeDasharray={2 * Math.PI * 28}
                    strokeDashoffset={(2 * Math.PI * 28) * (1 - getProfileCompletion() / 100)}
                  />
                </svg>
                <span className="absolute text-[10px] font-black text-emerald-500">{getProfileCompletion()}%</span>
              </div>
              <div className="space-y-0.5">
                <p className="text-xs font-bold text-slate-800 dark:text-slate-200">
                  {getProfileCompletion() === 100 ? 'All parameters complete!' : 'Almost complete!'}
                </p>
                <p className="text-[10px] text-slate-500 dark:text-slate-400 leading-normal">
                  Add phone number and verification photo to complete security status.
                </p>
              </div>
            </div>
          </Card>

          {/* Timeline list of recent activity logs */}
          <Card className="p-6 text-left space-y-4">
            <h4 className="font-extrabold text-sm uppercase tracking-wider text-slate-400">Profile Activity</h4>
            <div className="space-y-4">
              <div className="flex gap-3">
                <div className="w-8 h-8 rounded-lg bg-primary/10 text-primary flex items-center justify-center flex-shrink-0">
                  <Activity className="w-4 h-4" />
                </div>
                <div>
                  <h5 className="text-xs font-bold text-slate-800 dark:text-slate-200">Profile Logged In</h5>
                  <span className="text-[9px] text-slate-450 dark:text-slate-500 font-semibold block">Just now • Web browser</span>
                </div>
              </div>

              <div className="flex gap-3">
                <div className="w-8 h-8 rounded-lg bg-emerald-500/10 text-emerald-400 flex items-center justify-center flex-shrink-0">
                  <CheckCircle className="w-4 h-4" />
                </div>
                <div>
                  <h5 className="text-xs font-bold text-slate-800 dark:text-slate-200">Personal Info Synchronized</h5>
                  <span className="text-[9px] text-slate-450 dark:text-slate-500 font-semibold block">2 days ago • Dashboard API</span>
                </div>
              </div>
            </div>
          </Card>

        </div>

        {/* RIGHT PANEL: Settings Tabs (Profile details vs Security settings) */}
        <div className="lg:col-span-2 space-y-6 text-left">
          
          {/* Tab switches */}
          <div className="flex bg-slate-100 dark:bg-slate-900 p-1 rounded-2xl gap-1 border border-slate-200/50 dark:border-slate-800 w-full max-w-[280px]">
            <button
              onClick={() => setActiveTab('profile')}
              className={`flex-1 py-2 text-xs font-bold rounded-xl transition-all ${
                activeTab === 'profile'
                  ? 'bg-white dark:bg-slate-800 text-slate-950 dark:text-white shadow-soft-sm'
                  : 'text-slate-500 hover:text-slate-800 dark:hover:text-slate-200'
              }`}
            >
              Profile Info
            </button>
            <button
              onClick={() => setActiveTab('security')}
              className={`flex-1 py-2 text-xs font-bold rounded-xl transition-all ${
                activeTab === 'security'
                  ? 'bg-white dark:bg-slate-800 text-slate-950 dark:text-white shadow-soft-sm'
                  : 'text-slate-500 hover:text-slate-800 dark:hover:text-slate-200'
              }`}
            >
              Security keys
            </button>
          </div>

          <AnimatePresence mode="wait">
            
            {/* TAB 1: Profile Info */}
            {activeTab === 'profile' && (
              <motion.div
                key="profile-tab"
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -8 }}
              >
                <Card className="p-6 space-y-6">
                  <div className="flex items-center gap-2 mb-2 border-b border-slate-100 dark:border-slate-800/80 pb-4">
                    <User className="w-5 h-5 text-primary" />
                    <h2 className="text-lg font-bold">Personal Profile</h2>
                  </div>

                  <form onSubmit={handleProfileSubmit(onUpdateProfile)} className="space-y-5">
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <Input
                        {...registerProfile('first_name')}
                        label="First Name"
                        error={profileErrors.first_name?.message}
                      />
                      <Input
                        {...registerProfile('last_name')}
                        label="Last Name"
                        error={profileErrors.last_name?.message}
                      />
                    </div>

                    <Input
                      label="Email Address (Read-only)"
                      type="email"
                      disabled
                      value={user?.email || ''}
                      icon={Mail}
                      className="cursor-not-allowed text-slate-400 bg-slate-50 dark:bg-slate-950/20"
                    />

                    <Input
                      {...registerProfile('phone')}
                      label="Phone Number"
                      type="tel"
                      icon={Phone}
                      placeholder="Enter phone number"
                      error={profileErrors.phone?.message}
                    />

                    <div className="flex justify-end pt-4">
                      <Button
                        type="submit"
                        variant="primary"
                        isLoading={isSavingProfile}
                        className="py-2.5 px-5 shadow-soft"
                      >
                        <Save className="w-4 h-4 mr-1.5" /> Save Profile Details
                      </Button>
                    </div>
                  </form>
                </Card>
              </motion.div>
            )}

            {/* TAB 2: Security Credentials */}
            {activeTab === 'security' && (
              <motion.div
                key="security-tab"
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -8 }}
              >
                <Card className="p-6 space-y-6">
                  <div className="flex items-center gap-2 mb-2 border-b border-slate-100 dark:border-slate-800/80 pb-4">
                    <Key className="w-5 h-5 text-primary" />
                    <h2 className="text-lg font-bold">Update Password</h2>
                  </div>

                  <form onSubmit={handlePasswordSubmit(onChangePassword)} className="space-y-5">
                    <Input
                      {...registerPassword('old_password')}
                      label="Current Password"
                      type="password"
                      placeholder="••••••••"
                      error={passwordErrors.old_password?.message}
                    />

                    <Input
                      {...registerPassword('new_password')}
                      label="New Password"
                      type="password"
                      placeholder="••••••••"
                      error={passwordErrors.new_password?.message}
                    />

                    <div className="flex justify-end pt-4">
                      <Button
                        type="submit"
                        variant="primary"
                        isLoading={isChangingPassword}
                        className="py-2.5 px-5 shadow-soft"
                      >
                        <Key className="w-4 h-4 mr-1.5" /> Update Security Password
                      </Button>
                    </div>
                  </form>
                </Card>
              </motion.div>
            )}

          </AnimatePresence>

        </div>

      </div>
    </div>
  );
}
