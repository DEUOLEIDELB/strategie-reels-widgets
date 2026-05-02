import { forwardRef, InputHTMLAttributes } from 'react';
import { cn } from '@/shared/lib/utils';

export interface InputProps extends Omit<InputHTMLAttributes<HTMLInputElement>, 'size'> {
  error?: string;
  size?: 'sm' | 'md';
}

export const Input = forwardRef<HTMLInputElement, InputProps>(
  ({ error, size = 'md', className, ...props }, ref) => {
    const sizeClass = size === 'sm' ? 'h-7 text-xs px-2' : 'h-9 text-sm px-3';
    return (
      <input
        ref={ref}
        className={cn(
          'w-full rounded-md border bg-surface text-text shadow-sm transition-colors',
          'placeholder:text-text-muted',
          'focus:outline-none focus:ring-2 focus:ring-current/40 focus:border-current',
          'disabled:opacity-40 disabled:cursor-not-allowed',
          sizeClass,
          error ? 'border-danger' : 'border-border-strong',
          className,
        )}
        {...props}
      />
    );
  },
);
Input.displayName = 'Input';
