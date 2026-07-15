import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate, Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Eye, EyeOff, Lock, Mail, Activity, CheckCircle, ArrowRight } from 'lucide-react';
import { toast } from 'react-hot-toast';
import { loginStart, loginSuccess, loginFailure } from '../store/slices/authSlice';
import authService from '../services/authService';
import Logo from '../components/Logo';
import Button from '../components/ui/Button';
import Input from '../components/ui/Input';

const loginSchema = z.object({
  email: z.string().email({ message: 'Please enter a valid email address' }),
  password: z.string().min(6, { message: 'Password must be at least 6 characters' }),
});

export default function Login() {
  const [showPassword, setShowPassword] = useState(false);
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { isLoading } = useSelector((state) => state.auth);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      email: '',
      password: '',
    },
  });

  const onSubmit = async (data) => {
    dispatch(loginStart());
    try {
      const response = await authService.login(data);
      dispatch(loginSuccess(response));
      toast.success('Successfully logged in!', {
        icon: '🔑',
        style: {
          borderRadius: '12px',
          background: '#111827',
          color: '#fff',
          border: '1px solid rgba(255, 255, 255, 0.05)'
        },
      });
      navigate('/dashboard');
    } catch (error) {
      const errMsg = error.response?.data?.detail || 'Invalid email or password.';
      dispatch(loginFailure(errMsg));
      toast.error(errMsg, {
        style: {
          borderRadius: '12px',
          background: '#111827',
          color: '#fff',
          border: '1px solid rgba(255, 255, 255, 0.05)'
        },
      });
    }
  };

  return (
    <div className="min-h-screen bg-bg-light dark:bg-bg-dark text-slate-800 dark:text-slate-100 flex transition-colors duration-300">
      
      {/* LEFT PANEL: Branding & Visuals (Hidden on small mobile screens) */}
      <div className="hidden lg:flex w-1/2 bg-slate-950 text-white relative overflow-hidden flex-col justify-between p-12 border-r border-slate-900 bg-grid-pattern">
        
        {/* Glow Spheres */}
        <div className="absolute top-[-10%] right-[-10%] w-[350px] h-[350px] rounded-full bg-primary/20 blur-[120px] animate-pulse-glow" />
        <div className="absolute bottom-[-10%] left-[-15%] w-[450px] h-[450px] rounded-full bg-emerald-500/10 blur-[150px] animate-pulse-glow" />

        {/* Top Branding Section */}
        <div className="relative z-10">
          <Logo variant="horizontal" theme="dark" className="scale-110 origin-left" />
        </div>

        {/* Center Spotlight Metric Screen */}
        <div className="relative z-10 max-w-md mx-auto my-auto space-y-8 text-left">
          <div className="space-y-4">
            <h1 className="text-4xl font-extrabold tracking-tight leading-tight bg-gradient-to-r from-white via-slate-100 to-slate-400 bg-clip-text text-transparent">
              Unified attendance & analytics intelligence
            </h1>
            <p className="text-slate-400 text-sm leading-relaxed">
              Verify check-ins, automate institution compliance logs, and view real-time syllabus tracking on a single enterprise dashboard.
            </p>
          </div>

          {/* Interactive Feature Cards */}
          <div className="space-y-4">
            <div className="flex gap-4 p-4 rounded-xl border border-slate-900 bg-slate-900/35 backdrop-blur-md">
              <div className="w-10 h-10 rounded-lg bg-primary/10 text-primary flex items-center justify-center flex-shrink-0">
                <Activity className="w-5 h-5" />
              </div>
              <div>
                <h4 className="font-semibold text-sm text-slate-200">Real-Time Check-ins</h4>
                <p className="text-xs text-slate-400 mt-1">Facilitate instant presence roll calls with auto-synced databases.</p>
              </div>
            </div>

            <div className="flex gap-4 p-4 rounded-xl border border-slate-900 bg-slate-900/35 backdrop-blur-md">
              <div className="w-10 h-10 rounded-lg bg-emerald-500/10 text-emerald-400 flex items-center justify-center flex-shrink-0">
                <CheckCircle className="w-5 h-5" />
              </div>
              <div>
                <h4 className="font-semibold text-sm text-slate-200">Exemptions Workflow</h4>
                <p className="text-xs text-slate-400 mt-1 font-medium">Process student leave requests with transparent audit logs.</p>
              </div>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="relative z-10 text-xs text-slate-500 flex justify-between items-center border-t border-slate-900 pt-6">
          <span>&copy; {new Date().getFullYear()} PresenceOne.</span>
          <span>Security Certified (SSL & JWT)</span>
        </div>
      </div>

      {/* RIGHT PANEL: Authentication Form */}
      <div className="w-full lg:w-1/2 flex items-center justify-center p-6 sm:p-12 md:p-20 relative bg-white dark:bg-bg-dark bg-grid-pattern">
        
        {/* Glow Spheres for light/dark bg */}
        <div className="absolute top-[-20%] left-[-20%] w-[300px] h-[300px] rounded-full bg-primary/5 dark:bg-primary/10 blur-[100px]" />
        <div className="absolute bottom-[-20%] right-[-20%] w-[300px] h-[300px] rounded-full bg-emerald-500/5 dark:bg-emerald-500/10 blur-[100px]" />

        <div className="w-full max-w-md space-y-8 relative z-10">
          
          {/* Header */}
          <div className="space-y-3">
            <div className="lg:hidden flex justify-center mb-6">
              <Logo variant="vertical" theme="light" className="dark:hidden" />
              <Logo variant="vertical" theme="dark" className="hidden dark:flex" />
            </div>
            <h2 className="text-3xl font-extrabold tracking-tight text-slate-900 dark:text-white">
              Welcome back
            </h2>
            <p className="text-sm text-slate-500 dark:text-slate-400 font-medium">
              Enter your credentials to access your PresenceOne workspace.
            </p>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
            
            <Input
              {...register('email')}
              label="Email Address"
              type="email"
              placeholder="you@school.com"
              icon={Mail}
              error={errors.email?.message}
            />

            <div className="space-y-1.5 relative">
              <div className="flex justify-between items-center">
                <label className="block text-xs font-semibold uppercase tracking-wider text-slate-400 dark:text-slate-500">
                  Password
                </label>
                <Link
                  to="/forgot-password"
                  className="text-xs text-primary hover:underline transition-colors font-bold"
                >
                  Forgot password?
                </Link>
              </div>
              <div className="relative">
                <div className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 dark:text-slate-500">
                  <Lock className="w-4.5 h-4.5" />
                </div>
                <input
                  {...register('password')}
                  type={showPassword ? 'text' : 'password'}
                  placeholder="••••••••"
                  className={`w-full pl-10 pr-12 py-2.5 rounded-xl border bg-white dark:bg-slate-900 text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 transition-all font-medium ${
                    errors.password
                      ? 'border-danger focus:border-danger'
                      : 'border-slate-200 dark:border-slate-800 focus:border-primary dark:focus:border-primary'
                  }`}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 dark:text-slate-500 hover:text-slate-850 dark:hover:text-white transition-colors"
                >
                  {showPassword ? <EyeOff className="w-4.5 h-4.5" /> : <Eye className="w-4.5 h-4.5" />}
                </button>
              </div>
              {errors.password && (
                <span className="text-xs text-danger font-medium block">
                  {errors.password.message}
                </span>
              )}
            </div>

            <Button
              type="submit"
              variant="primary"
              isLoading={isLoading}
              className="w-full py-3"
            >
              Sign In to Dashboard
            </Button>
          </form>

          {/* Quick Sign up Link */}
          <div className="text-center pt-2">
            <p className="text-xs text-slate-400 font-medium">
              New to PresenceOne?{' '}
              <Link to="/register" className="text-primary hover:underline font-bold inline-flex items-center gap-0.5">
                Create an account <ArrowRight className="w-3 h-3" />
              </Link>
            </p>
          </div>

          {/* Test Credentials helper */}
          <div className="p-4 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900/30 text-left">
            <h5 className="text-xs font-bold text-slate-900 dark:text-slate-300">Enterprise Seed Accounts:</h5>
            <div className="grid grid-cols-2 gap-2 mt-2 text-[10px] text-slate-500 font-mono">
              <div>
                <span className="font-semibold text-slate-700 dark:text-slate-400">Admin:</span>
                <p>admin@presencone.com</p>
                <p className="opacity-75">admin_password_123</p>
              </div>
              <div>
                <span className="font-semibold text-slate-700 dark:text-slate-400">Faculty:</span>
                <p>faculty@presencone.com</p>
                <p className="opacity-75">faculty_password_123</p>
              </div>
              <div>
                <span className="font-semibold text-slate-700 dark:text-slate-400">Student:</span>
                <p>student@presencone.com</p>
                <p className="opacity-75">student_password_123</p>
              </div>
              <div>
                <span className="font-semibold text-slate-700 dark:text-slate-400">Super Admin:</span>
                <p>superadmin@presencone.com</p>
                <p className="opacity-75">super_password_123</p>
              </div>
            </div>
          </div>

        </div>
      </div>

    </div>
  );
}
