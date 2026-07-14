import React, { useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import * as z from 'zod'
import { useDispatch, useSelector } from 'react-redux'
import { useNavigate, Link } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import { Eye, EyeOff, Lock, Mail, Loader2, Sparkles } from 'lucide-react'
import { toast } from 'react-hot-toast'
import { loginStart, loginSuccess, loginFailure } from '../store/slices/authSlice'
import authService from '../services/authService'

const loginSchema = z.object({
  email: z.string().email({ message: 'Please enter a valid email address' }),
  password: z.string().min(6, { message: 'Password must be at least 6 characters' }),
})

export default function Login() {
  const [showPassword, setShowPassword] = useState(false)
  const dispatch = useDispatch()
  const navigate = useNavigate()
  const { isLoading } = useSelector((state) => state.auth)

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
  })

  const onSubmit = async (data) => {
    dispatch(loginStart())
    try {
      const response = await authService.login(data)
      dispatch(loginSuccess(response))
      toast.success('Successfully logged in!', {
        icon: '🔑',
        style: {
          borderRadius: '10px',
          background: '#1E293B',
          color: '#fff',
        },
      })
      navigate('/dashboard')
    } catch (error) {
      const errMsg = error.response?.data?.detail || 'Invalid email or password.'
      dispatch(loginFailure(errMsg))
      toast.error(errMsg, {
        style: {
          borderRadius: '10px',
          background: '#1E293B',
          color: '#fff',
        },
      })
    }
  }

  return (
    <div className="min-h-screen bg-bg-light dark:bg-bg-dark text-slate-800 dark:text-slate-100 flex items-center justify-center p-4 relative overflow-hidden transition-colors duration-300">
      {/* Decorative Gradients */}
      <div className="absolute top-[-20%] left-[-10%] w-[50%] h-[50%] rounded-full bg-primary/10 blur-[120px]" />
      <div className="absolute bottom-[-20%] right-[-10%] w-[50%] h-[50%] rounded-full bg-success/5 blur-[120px]" />

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="w-full max-w-md bg-white/80 dark:bg-slate-900/60 backdrop-blur-xl border border-slate-200 dark:border-slate-800/80 p-8 rounded-2xl shadow-soft-lg relative z-10"
      >
        {/* Header */}
        <div className="text-center space-y-3 mb-8">
          <div className="flex justify-center">
            <div className="w-12 h-12 rounded-xl bg-primary flex items-center justify-center text-white font-bold text-2xl shadow-soft">
              P
            </div>
          </div>
          <h2 className="text-3xl font-extrabold tracking-tight bg-gradient-to-r from-primary to-primary-light bg-clip-text text-transparent">
            Welcome back
          </h2>
          <p className="text-sm text-slate-500 dark:text-slate-400">
            Enter your credentials to access your dashboard
          </p>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
          <div className="space-y-2">
            <label className="text-xs font-semibold uppercase tracking-wider text-slate-400 dark:text-slate-500">
              Email Address
            </label>
            <div className="relative">
              <Mail className="absolute left-3 top-3 w-5 h-5 text-slate-400" />
              <input
                {...register('email')}
                type="email"
                placeholder="you@school.com"
                className={`w-full pl-10 pr-4 py-2.5 rounded-xl border bg-slate-50/50 dark:bg-slate-950/20 text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 transition-all ${
                  errors.email
                    ? 'border-danger focus:border-danger'
                    : 'border-slate-200 dark:border-slate-800 focus:border-primary dark:focus:border-primary'
                }`}
              />
            </div>
            {errors.email && (
              <span className="text-xs text-danger font-medium block">
                {errors.email.message}
              </span>
            )}
          </div>

          <div className="space-y-2">
            <div className="flex justify-between items-center">
              <label className="text-xs font-semibold uppercase tracking-wider text-slate-400 dark:text-slate-500">
                Password
              </label>
              <Link
                to="/forgot-password"
                className="text-xs text-primary hover:text-primary-dark transition-colors font-semibold"
              >
                Forgot password?
              </Link>
            </div>
            <div className="relative">
              <Lock className="absolute left-3 top-3 w-5 h-5 text-slate-400" />
              <input
                {...register('password')}
                type={showPassword ? 'text' : 'password'}
                placeholder="••••••••"
                className={`w-full pl-10 pr-12 py-2.5 rounded-xl border bg-slate-50/50 dark:bg-slate-950/20 text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 transition-all ${
                  errors.password
                    ? 'border-danger focus:border-danger'
                    : 'border-slate-200 dark:border-slate-800 focus:border-primary dark:focus:border-primary'
                }`}
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-3 text-slate-400 hover:text-slate-200 transition-colors"
              >
                {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
              </button>
            </div>
            {errors.password && (
              <span className="text-xs text-danger font-medium block">
                {errors.password.message}
              </span>
            )}
          </div>

          {/* Submit Button */}
          <button
            type="submit"
            disabled={isLoading}
            className="w-full flex items-center justify-center gap-2 py-3 px-4 rounded-xl bg-primary hover:bg-primary-dark text-white font-medium text-sm transition-all shadow-soft disabled:opacity-50 disabled:cursor-not-allowed hover:shadow-md active:scale-[0.98]"
          >
            {isLoading ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                Signing in...
              </>
            ) : (
              <>
                <Sparkles className="w-4 h-4" />
                Sign In
              </>
            )}
          </button>
        </form>

        {/* Demo Credentials */}
        <div className="mt-8 pt-6 border-t border-slate-200 dark:border-slate-800 text-center">
          <p className="text-xs text-slate-400 dark:text-slate-500">
            For local testing, run setup command to populate users or use default migrations.
          </p>
        </div>
      </motion.div>
    </div>
  )
}
