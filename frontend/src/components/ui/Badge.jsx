import React from 'react';

export default function Badge({
  children,
  variant = 'neutral', // 'primary' | 'success' | 'warning' | 'danger' | 'info' | 'neutral'
  className = '',
  ...props
}) {
  const styles = {
    primary: 'bg-primary/10 text-primary border-primary/20',
    success: 'bg-success/10 text-success border-success/20',
    warning: 'bg-warning/10 text-warning border-warning/20',
    danger: 'bg-danger/10 text-danger border-danger/20',
    info: 'bg-info/10 text-info border-info/20',
    neutral: 'bg-slate-100 dark:bg-slate-800 text-slate-650 dark:text-slate-300 border-slate-200 dark:border-slate-700/60'
  };

  return (
    <span
      className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-semibold uppercase tracking-wider border ${styles[variant]} ${className}`}
      {...props}
    >
      {children}
    </span>
  );
}
