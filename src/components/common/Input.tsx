import React, { InputHTMLAttributes, SelectHTMLAttributes, ReactNode } from 'react';
import { clsx } from 'clsx';

interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
  hint?: string;
  prefixSymbol?: ReactNode;
  suffixSymbol?: ReactNode;
}

export const Input: React.FC<InputProps> = ({
  label,
  error,
  hint,
  prefixSymbol,
  suffixSymbol,
  className,
  id,
  ...props
}) => {
  const inputId = id || (label ? label.toLowerCase().replace(/\s+/g, '-') : undefined);

  return (
    <div className="space-y-1.5 w-full">
      {label && (
        <label htmlFor={inputId} className="block text-xs font-semibold text-slate-700 uppercase tracking-wider">
          {label}
        </label>
      )}
      <div className="relative flex items-center">
        {prefixSymbol && (
          <div className="absolute left-3 text-slate-400 pointer-events-none text-sm">
            {prefixSymbol}
          </div>
        )}
        <input
          id={inputId}
          className={clsx(
            'w-full bg-white border text-slate-900 text-sm rounded-lg px-3.5 py-2.5 transition-colors duration-150',
            'focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500',
            prefixSymbol ? 'pl-9' : 'pl-3.5',
            suffixSymbol ? 'pr-9' : 'pr-3.5',
            error ? 'border-rose-300 bg-rose-50/30 focus:ring-rose-500' : 'border-slate-300 hover:border-slate-400',
            className
          )}
          {...props}
        />
        {suffixSymbol && (
          <div className="absolute right-3 text-slate-400 pointer-events-none text-sm">
            {suffixSymbol}
          </div>
        )}
      </div>
      {error && <p className="text-xs text-rose-600 mt-1">{error}</p>}
      {hint && !error && <p className="text-xs text-slate-500 mt-1">{hint}</p>}
    </div>
  );
};

interface SelectProps extends SelectHTMLAttributes<HTMLSelectElement> {
  label?: string;
  error?: string;
  options: { label: string; value: string }[];
}

export const Select: React.FC<SelectProps> = ({
  label,
  error,
  options,
  className,
  id,
  ...props
}) => {
  const selectId = id || (label ? label.toLowerCase().replace(/\s+/g, '-') : undefined);

  return (
    <div className="space-y-1.5 w-full">
      {label && (
        <label htmlFor={selectId} className="block text-xs font-semibold text-slate-700 uppercase tracking-wider">
          {label}
        </label>
      )}
      <select
        id={selectId}
        className={clsx(
          'w-full bg-white border text-slate-900 text-sm rounded-lg px-3.5 py-2.5 transition-colors duration-150',
          'focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500',
          error ? 'border-rose-300 bg-rose-50/30' : 'border-slate-300 hover:border-slate-400',
          className
        )}
        {...props}
      >
        {options.map((opt) => (
          <option key={opt.value} value={opt.value}>
            {opt.label}
          </option>
        ))}
      </select>
      {error && <p className="text-xs text-rose-600 mt-1">{error}</p>}
    </div>
  );
};
