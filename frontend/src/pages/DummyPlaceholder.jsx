import React from 'react'
import { Sparkles, ArrowLeft } from 'lucide-react'
import { Link, useLocation } from 'react-router-dom'
import { motion } from 'framer-motion'

export default function DummyPlaceholder() {
  const location = useLocation()
  const pageName = location.pathname.substring(1).replace('-', ' ')
  const formattedPageName = pageName.charAt(0).toUpperCase() + pageName.slice(1)

  return (
    <div className="h-[60vh] flex flex-col items-center justify-center text-center p-4">
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        className="max-w-md space-y-6 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-805 p-8 rounded-2xl shadow-soft"
      >
        <div className="flex justify-center">
          <div className="w-12 h-12 bg-primary/10 text-primary rounded-xl flex items-center justify-center">
            <Sparkles className="w-6 h-6 animate-pulse" />
          </div>
        </div>

        <div className="space-y-2">
          <h2 className="text-2xl font-bold tracking-tight text-slate-950 dark:text-slate-50">
            {formattedPageName || 'Feature'} Module
          </h2>
          <p className="text-sm text-slate-500 dark:text-slate-400">
            This module is planned for a subsequent implementation step. We are building the system step-by-step to maintain high-quality architecture.
          </p>
        </div>

        <div className="pt-2">
          <Link
            to="/dashboard"
            className="inline-flex items-center gap-1.5 text-sm font-semibold text-primary hover:underline"
          >
            <ArrowLeft className="w-4 h-4" /> Back to Dashboard
          </Link>
        </div>
      </motion.div>
    </div>
  )
}
