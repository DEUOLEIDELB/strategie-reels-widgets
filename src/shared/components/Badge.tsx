import { HTMLAttributes } from 'react';
import { cn, hexToSoftBg, textOnHex } from '@/shared/lib/utils';

interface BadgeProps extends HTMLAttributes<HTMLSpanElement> {
  variant?: 'default' | 'accent' | 'current' | 'success' | 'warning' | 'danger' | 'info' | 'outline';
  color?: string;
  soft?: boolean;
  size?: 'xs' | 'sm';
}

const variantClasses: Record<NonNullable<BadgeProps['variant']>, string> = {
  default: 'bg-surface-alt text-text-dim',
  accent: 'bg-accent text-on-accent',
  current: 'bg-current text-on-current',
  success: 'bg-success text-on-success',
  warning: 'bg-warning text-on-warning',
  danger: 'bg-danger text-on-danger',
  info: 'bg-info text-text',
  outline: 'bg-surface text-text border border-border-strong',
};

const sizeClasses = {
  xs: 'px-1 py-0 text-[10px] leading-tight',
  sm: 'px-1.5 py-0.5 text-[11px] leading-tight',
};

export function Badge({
  variant = 'default',
  color,
  soft = false,
  size = 'sm',
  className,
  style,
  children,
  ...props
}: BadgeProps) {
  const base = cn(
    'inline-flex items-center gap-1 rounded-sm font-medium whitespace-nowrap',
    sizeClasses[size],
    className,
  );

  if (color) {
    const bg = soft ? hexToSoftBg(color, 0.18) : color;
    const fg = soft ? color : textOnHex(color);
    const border = soft ? `1px solid ${hexToSoftBg(color, 0.45)}` : 'none';
    return (
      <span className={base} style={{ background: bg, color: fg, border, ...style }} {...props}>
        {children}
      </span>
    );
  }

  return (
    <span className={cn(base, variantClasses[variant])} style={style} {...props}>
      {children}
    </span>
  );
}
