import React from 'react';

export default function Card({
  children,
  className = '',
  hoverable = false,
  glass = false,
  ...props
}) {
  const baseStyle = 'border border-slate-200 dark:border-slate-800/80 rounded-2xl shadow-soft transition-all duration-300';
  const backgroundStyle = glass
    ? 'bg-white/70 dark:bg-slate-900/50 backdrop-blur-md'
    : 'bg-white dark:bg-slate-900';
  const hoverStyle = hoverable
    ? 'hover:shadow-md hover:border-slate-300 dark:hover:border-slate-700/80 hover:translate-y-[-2px]'
    : '';

  return (
    <div
      className={`${baseStyle} ${backgroundStyle} ${hoverStyle} ${className}`}
      {...props}
    >
      {children}
    </div>
  );
}
