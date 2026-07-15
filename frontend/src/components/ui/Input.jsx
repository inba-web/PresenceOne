import React, { forwardRef } from 'react';

const Input = forwardRef(({
  label,
  type = 'text',
  error,
  icon: Icon,
  className = '',
  wrapperClassName = '',
  ...props
}, ref) => {
  return (
    <div className={`space-y-1.5 text-left ${wrapperClassName}`}>
      {label && (
        <label className="block text-xs font-semibold uppercase tracking-wider text-slate-400 dark:text-slate-500">
          {label}
        </label>
      )}
      <div className="relative">
        {Icon && (
          <div className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 dark:text-slate-500">
            <Icon className="w-4.5 h-4.5" />
          </div>
        )}
        <input
          ref={ref}
          type={type}
          className={`w-full px-4 py-2.5 rounded-xl border bg-white dark:bg-slate-900 text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 transition-all font-medium ${
            Icon ? 'pl-10' : ''
          } ${
            error
              ? 'border-danger focus:border-danger focus:ring-danger/25'
              : 'border-slate-200 dark:border-slate-800 focus:border-primary dark:focus:border-primary'
          } ${className}`}
          {...props}
        />
      </div>
      {error && (
        <span className="text-xs text-danger font-medium block">
          {error}
        </span>
      )}
    </div>
  );
});

Input.displayName = 'Input';
export default Input;
