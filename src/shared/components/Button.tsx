import { forwardRef, ButtonHTMLAttributes } from 'react';
import { Loader2 } from 'lucide-react';
import { cn } from '@/shared/lib/utils';

type Variant = 'primary' | 'secondary' | 'ghost' | 'danger';
type Size = 'sm' | 'md' | 'lg';

export interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: Variant;
  size?: Size;
  loading?: boolean;
}

const variantClasses: Record<Variant, string> = {
  primary:
    'bg-accent text-on-accent border border-accent-strong shadow-sm hover:brightness-95 active:translate-x-px active:translate-y-px active:shadow-none',
  secondary:
    'bg-surface text-text border border-border-strong shadow-sm hover:bg-surface-alt active:translate-x-px active:translate-y-px active:shadow-none',
  ghost:
    'bg-transparent text-text border border-transparent hover:bg-surface-alt',
  danger:
    'bg-danger text-on-danger border border-danger shadow-sm hover:brightness-95 active:translate-x-px active:translate-y-px active:shadow-none',
};

const sizeClasses: Record<Size, string> = {
  sm: 'h-7 px-2 text-xs',
  md: 'h-9 px-3 text-sm',
  lg: 'h-11 px-4 text-base',
};

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  ({ variant = 'secondary', size = 'md', loading, disabled, className, children, ...props }, ref) => (
    <button
      ref={ref}
      disabled={disabled || loading}
      className={cn(
        'inline-flex items-center justify-center gap-1.5 rounded-md font-medium transition-all whitespace-nowrap focus:outline-none focus-visible:ring-2 focus-visible:ring-current focus-visible:ring-offset-1 disabled:opacity-40 disabled:cursor-not-allowed',
        variantClasses[variant],
        sizeClasses[size],
        className,
      )}
      {...props}
    >
      {loading && <Loader2 size={size === 'sm' ? 12 : 14} className="animate-spin" />}
      {children}
    </button>
  ),
);
Button.displayName = 'Button';
