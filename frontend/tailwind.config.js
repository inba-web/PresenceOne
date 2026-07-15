/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        slate: {
          250: '#E2E8F0',
          350: '#CBD5E1',
          405: '#94A3B8',
          450: '#94A3B8',
          455: '#94A3B8',
          550: '#64748B',
          650: '#475569',
          805: '#1E293B',
          850: '#1E293B',
          855: '#1E293B',
          905: '#0F172A',
        },
        primary: {
          DEFAULT: '#2563EB',
          light: '#60A5FA',
          dark: '#1D4ED8',
        },
        success: {
          DEFAULT: '#10B981',
          light: '#34D399',
          dark: '#059669',
        },
        warning: {
          DEFAULT: '#F59E0B',
          light: '#FBBF24',
          dark: '#D97706',
        },
        danger: {
          DEFAULT: '#EF4444',
          light: '#F87171',
          dark: '#DC2626',
        },
        info: {
          DEFAULT: '#0EA5E9',
          light: '#38BDF8',
          dark: '#0369A1',
        },
        bg: {
          light: '#F8FAFC',
          dark: '#020617',
        },
        card: {
          light: '#FFFFFF',
          dark: '#111827',
        }
      },
      fontFamily: {
        sans: ['Inter', 'sans-serif'],
      },
      boxShadow: {
        'soft-sm': '0 1px 2px 0 rgba(0, 0, 0, 0.05)',
        'soft': '0 4px 6px -1px rgba(0, 0, 0, 0.03), 0 2px 4px -1px rgba(0, 0, 0, 0.02)',
        'soft-md': '0 10px 15px -3px rgba(0, 0, 0, 0.04), 0 4px 6px -2px rgba(0, 0, 0, 0.02)',
        'soft-lg': '0 20px 25px -5px rgba(0, 0, 0, 0.04), 0 10px 10px -5px rgba(0, 0, 0, 0.02)',
        'premium': '0 0 0 1px rgba(0, 0, 0, 0.05), 0 10px 30px -10px rgba(0, 0, 0, 0.1)',
        'premium-dark': '0 0 0 1px rgba(255, 255, 255, 0.05), 0 10px 30px -10px rgba(0, 0, 0, 0.5)',
      }
    },
  },
  plugins: [],
}
