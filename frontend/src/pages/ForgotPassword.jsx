import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { motion, AnimatePresence } from 'framer-motion';
import { Mail, ArrowLeft, CheckCircle, Shield, Award, Activity } from 'lucide-react';
import { Link } from 'react-router-dom';
import { toast } from 'react-hot-toast';
import authService from '../services/authService';
import Logo from '../components/Logo';
import Button from '../components/ui/Button';
import Input from '../components/ui/Input';

const forgotPasswordSchema = z.object({
  email: z.string().email({ message: 'Please enter a valid email address' }),
});

export default function ForgotPassword() {
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm({
    resolver: zodResolver(forgotPasswordSchema),
    defaultValues: {
      email: '',
    },
  });

  const onSubmit = async (data) => {
    setIsLoading(true);
    try {
      await authService.resetPasswordRequest(data);
      setIsSubmitted(true);
      toast.success('Password reset link sent!', {
        icon: '✉️',
        style: {
          borderRadius: '12px',
          background: '#111827',
          color: '#fff',
          border: '1px solid rgba(255, 255, 255, 0.05)'
        },
      });
    } catch (error) {
      const errMsg = error.response?.data?.detail || 'Something went wrong. Please try again.';
      toast.error(errMsg, {
        style: {
          borderRadius: '12px',
          background: '#111827',
          color: '#fff',
          border: '1px solid rgba(255, 255, 255, 0.05)'
        },
      });
    } finally {
      setIsLoading(false);
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

        {/* Center Spotlight Section */}
        <div className="relative z-10 max-w-md mx-auto my-auto space-y-8 text-left">
          <div className="space-y-4">
            <h1 className="text-4xl font-extrabold tracking-tight leading-tight bg-gradient-to-r from-white via-slate-100 to-slate-400 bg-clip-text text-transparent">
              Restore access securely & swiftly
            </h1>
            <p className="text-slate-400 text-sm leading-relaxed">
              We employ strict cryptographic guidelines. If the requested institutional email exists, an encrypted magic link will be routed directly to your inbox.
            </p>
          </div>

          {/* Interactive Feature Cards */}
          <div className="space-y-4">
            <div className="flex gap-4 p-4 rounded-xl border border-slate-900 bg-slate-900/35 backdrop-blur-md">
              <div className="w-10 h-10 rounded-lg bg-primary/10 text-primary flex items-center justify-center flex-shrink-0">
                <Shield className="w-5 h-5" />
              </div>
              <div>
                <h4 className="font-semibold text-sm text-slate-200">Secure Recovery</h4>
                <p className="text-xs text-slate-400 mt-1">Temporary tokens expire automatically inside a 15-minute timeframe.</p>
              </div>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="relative z-10 text-xs text-slate-500 flex justify-between items-center border-t border-slate-900 pt-6">
          <span>&copy; {new Date().getFullYear()} PresenceOne.</span>
          <span>Access control panel</span>
        </div>
      </div>

      {/* RIGHT PANEL: Form */}
      <div className="w-full lg:w-1/2 flex items-center justify-center p-6 sm:p-12 md:p-20 relative bg-white dark:bg-bg-dark bg-grid-pattern">
        
        {/* Glow Spheres */}
        <div className="absolute top-[-20%] left-[-20%] w-[300px] h-[300px] rounded-full bg-primary/5 dark:bg-primary/10 blur-[100px]" />
        <div className="absolute bottom-[-20%] right-[-20%] w-[300px] h-[300px] rounded-full bg-emerald-500/5 dark:bg-emerald-500/10 blur-[100px]" />

        <div className="w-full max-w-md space-y-8 relative z-10">
          
          <AnimatePresence mode="wait">
            {!isSubmitted ? (
              <motion.div
                key="request-form"
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -15 }}
                className="space-y-6"
              >
                {/* Header */}
                <div className="space-y-3">
                  <div className="lg:hidden flex justify-center mb-6">
                    <Logo variant="vertical" theme="light" className="dark:hidden" />
                    <Logo variant="vertical" theme="dark" className="hidden dark:flex" />
                  </div>
                  <Link
                    to="/login"
                    className="inline-flex items-center gap-2 text-xs font-bold text-primary hover:underline"
                  >
                    <ArrowLeft className="w-3.5 h-3.5" /> Back to Sign In
                  </Link>
                  <h2 className="text-3xl font-extrabold tracking-tight text-slate-900 dark:text-white">
                    Reset Password
                  </h2>
                  <p className="text-sm text-slate-500 dark:text-slate-400 font-medium">
                    Enter your email address and we'll send you an encrypted link to restore password.
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

                  <Button
                    type="submit"
                    variant="primary"
                    isLoading={isLoading}
                    className="w-full py-3"
                  >
                    Send Recovery Link
                  </Button>
                </form>
              </motion.div>
            ) : (
              <motion.div
                key="success-screen"
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                className="text-center space-y-6 py-6"
              >
                <div className="flex justify-center">
                  <div className="w-16 h-16 rounded-full bg-emerald-500/10 flex items-center justify-center text-success">
                    <CheckCircle className="w-10 h-10" />
                  </div>
                </div>
                
                <div className="space-y-2">
                  <h3 className="text-2xl font-black text-slate-900 dark:text-white">Check your email</h3>
                  <p className="text-sm text-slate-500 dark:text-slate-400 max-w-xs mx-auto font-medium">
                    We've sent a password reset link to your email address. It will expire shortly.
                  </p>
                </div>

                <Link
                  to="/login"
                  className="inline-flex items-center gap-2 text-sm font-bold text-primary hover:underline mt-4"
                >
                  <ArrowLeft className="w-4 h-4" /> Return to Login
                </Link>
              </motion.div>
            )}
          </AnimatePresence>

        </div>
      </div>

    </div>
  );
}
