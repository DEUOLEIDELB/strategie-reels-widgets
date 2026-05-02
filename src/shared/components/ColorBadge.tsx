import { cn } from '@/shared/lib/utils';

interface ColorBadgeProps {
  colorHex: string;
  size?: 'xs' | 'sm' | 'md' | 'lg';
  className?: string;
  bordered?: boolean;
}

const sizeClasses = {
  xs: 'w-2 h-2',
  sm: 'w-3 h-3',
  md: 'w-4 h-4',
  lg: 'w-6 h-6',
};

export function ColorBadge({ colorHex, size = 'sm', className, bordered = true }: ColorBadgeProps) {
  return (
    <span
      className={cn(
        'inline-block rounded-full shrink-0',
        bordered && 'border border-border-strong/60',
        sizeClasses[size],
        className,
      )}
      style={{ backgroundColor: colorHex }}
    />
  );
}
