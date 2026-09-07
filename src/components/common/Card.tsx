import React, { HTMLAttributes } from 'react';
import { clsx } from 'clsx';

interface CardProps extends HTMLAttributes<HTMLDivElement> {
  hoverable?: boolean;
  padded?: boolean;
}

export const Card: React.FC<CardProps> = ({
  children,
  className,
  hoverable = false,
  padded = true,
  ...props
}) => {
  return (
    <div
      className={clsx(
        'bg-white rounded-xl border border-slate-200 shadow-subtle transition-all duration-200 overflow-hidden',
        hoverable && 'hover:border-slate-300 hover:shadow-card cursor-pointer',
        padded && 'p-5 md:p-6',
        className
      )}
      {...props}
    >
      {children}
    </div>
  );
};
