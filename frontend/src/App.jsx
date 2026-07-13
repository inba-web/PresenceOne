import React, { useState, useEffect } from 'react'

function App() {
  const [darkMode, setDarkMode] = useState(false)

  useEffect(() => {
    if (darkMode) {
      document.documentElement.classList.add('dark')
    } else {
      document.documentElement.classList.remove('dark')
    }
  }, [darkMode])

  return (
    <div className="min-h-screen bg-bg-light text-slate-800 dark:bg-bg-dark dark:text-slate-100 flex flex-col justify-between transition-colors duration-300">
      {/* Header */}
      <header className="border-b border-slate-200 dark:border-slate-800 bg-white/80 dark:bg-slate-900/80 backdrop-blur-md sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-primary flex items-center justify-center text-white font-bold text-lg shadow-soft">
              P
            </div>
            <span className="text-xl font-bold tracking-tight bg-gradient-to-r from-primary to-primary-light bg-clip-text text-transparent">
              PresencOne
            </span>
          </div>
          
          <button
            onClick={() => setDarkMode(!darkMode)}
            className="p-2 rounded-lg bg-slate-100 dark:bg-slate-850 hover:bg-slate-200 dark:hover:bg-slate-800 border border-slate-200 dark:border-slate-700 transition-colors"
            aria-label="Toggle theme"
          >
            {darkMode ? '☀️ Light' : '🌙 Dark'}
          </button>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-grow max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-12 flex flex-col items-center justify-center">
        <div className="w-full max-w-2xl text-center space-y-8">
          <div className="space-y-4">
            <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-primary/10 text-primary dark:bg-primary/20 dark:text-primary-light animate-pulse">
              ● System Booting
            </span>
            <h1 className="text-4xl sm:text-5xl font-extrabold tracking-tight">
              Enterprise Grade Attendance Management
            </h1>
            <p className="text-lg text-slate-500 dark:text-slate-400 max-w-lg mx-auto">
              A high-performance, secure, and clean architecture system for educational institutions and corporate organizations.
            </p>
          </div> 

          {/* Verification Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 text-left">
            <div className="p-6 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-850 rounded-xl shadow-soft">
              <div className="flex items-center justify-between mb-4">
                <span className="font-semibold text-slate-900 dark:text-slate-100">Frontend Status</span>
                <span className="px-2 py-1 text-xs font-semibold rounded bg-success/15 text-success">Active</span>
              </div>
              <p className="text-sm text-slate-500 dark:text-slate-400">
                React 19 & Vite are running successfully. Tailwind CSS configurations are loaded.
              </p>
            </div>

            <div className="p-6 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-850 rounded-xl shadow-soft">
              <div className="flex items-center justify-between mb-4">
                <span className="font-semibold text-slate-900 dark:text-slate-100">Backend API</span>
                <span className="px-2 py-1 text-xs font-semibold rounded bg-warning/15 text-warning">Connecting</span>
              </div>
              <p className="text-sm text-slate-500 dark:text-slate-400">
                Awaiting connection. Django container starts with PostgreSQL and Redis integrations.
              </p>
            </div>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="border-t border-slate-200 dark:border-slate-800 py-6 text-center text-sm text-slate-400">
        <p>&copy; {new Date().getFullYear()} PresencOne. All rights reserved.</p>
      </footer>
    </div>
  )
}

export default App
