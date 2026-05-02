import { SelectHTMLAttributes, forwardRef } from 'react';
import { cn } from '@/shared/lib/utils';

interface SelectProps extends Omit<SelectHTMLAttributes<HTMLSelectElement>, 'size'> {
  size?: 'sm' | 'md';
}

export const Select = forwardRef<HTMLSelectElement, SelectProps>(
  ({ className, size = 'md', children, ...props }, ref) => {
    const sizeClass = size === 'sm' ? 'h-7 px-2 text-xs' : 'h-9 px-3 text-sm';
    return (
      <select
        ref={ref}
        className={cn(
          'rounded-md border border-border-strong bg-surface text-text shadow-sm cursor-pointer pr-7',
          'focus:outline-none focus:ring-2 focus:ring-current/40 focus:border-current',
          'disabled:opacity-40 disabled:cursor-not-allowed',
          sizeClass,
          className,
        )}
        {...props}
      >
        {children}
      </select>
    );
  },
);
Select.displayName = 'Select';
