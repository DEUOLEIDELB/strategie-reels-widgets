import { forwardRef, ButtonHTMLAttributes } from 'react';
import type { LucideIcon } from 'lucide-react';
import { cn } from '@/shared/lib/utils';

type Tone = 'default' | 'primary' | 'danger' | 'ghost';
type Size = 'sm' | 'md';

interface IconButtonProps extends Omit<ButtonHTMLAttributes<HTMLButtonElement>, 'children'> {
  icon: LucideIcon;
  label: string;
  tone?: Tone;
  size?: Size;
}

const toneClasses: Record<Tone, string> = {
  default: 'bg-surface text-text border border-border-strong shadow-sm hover:bg-surface-alt',
  primary: 'bg-accent text-on-accent border border-accent-strong shadow-sm hover:brightness-95',
  danger: 'bg-danger text-on-danger border border-danger shadow-sm hover:brightness-95',
  ghost: 'bg-transparent text-text border border-transparent hover:bg-surface-alt',
};

const sizeClasses: Record<Size, string> = {
  sm: 'h-7 w-7',
  md: 'h-9 w-9',
};

export const IconButton = forwardRef<HTMLButtonElement, IconButtonProps>(
  ({ icon: Icon, label, tone = 'default', size = 'md', className, ...props }, ref) => (
    <button
      ref={ref}
      aria-label={label}
      title={label}
      className={cn(
        'inline-flex items-center justify-center rounded-md transition-all',
        'focus:outline-none focus-visible:ring-2 focus-visible:ring-current focus-visible:ring-offset-1',
        'disabled:opacity-40 disabled:cursor-not-allowed',
        'active:translate-x-px active:translate-y-px active:shadow-none',
        toneClasses[tone],
        sizeClasses[size],
        className,
      )}
      {...props}
    >
      <Icon size={size === 'sm' ? 14 : 16} strokeWidth={1.75} />
    </button>
  ),
);
IconButton.displayName = 'IconButton';
