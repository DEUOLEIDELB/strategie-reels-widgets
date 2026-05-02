import { HTMLAttributes, forwardRef } from 'react';
import { cn } from '@/shared/lib/utils';

interface CardProps extends HTMLAttributes<HTMLDivElement> {
  hoverable?: boolean;
  selected?: boolean;
}

export const Card = forwardRef<HTMLDivElement, CardProps>(
  ({ className, hoverable, selected, ...props }, ref) => (
    <div
      ref={ref}
      className={cn(
        'rounded-md bg-surface border border-border shadow-md overflow-hidden transition-all',
        hoverable && 'cursor-pointer hover:bg-surface-alt hover:border-border-strong',
        selected && 'ring-2 ring-current border-current',
        className,
      )}
      {...props}
    />
  ),
);
Card.displayName = 'Card';

export const CardHeader = forwardRef<HTMLDivElement, HTMLAttributes<HTMLDivElement>>(
  ({ className, ...props }, ref) => (
    <div
      ref={ref}
      className={cn('px-4 py-3 border-b border-border bg-surface-two', className)}
      {...props}
    />
  ),
);
CardHeader.displayName = 'CardHeader';

export const CardTitle = forwardRef<HTMLDivElement, HTMLAttributes<HTMLDivElement>>(
  ({ className, ...props }, ref) => (
    <div ref={ref} className={cn('text-sm font-semibold text-text', className)} {...props} />
  ),
);
CardTitle.displayName = 'CardTitle';

export const CardBody = forwardRef<HTMLDivElement, HTMLAttributes<HTMLDivElement>>(
  ({ className, ...props }, ref) => (
    <div ref={ref} className={cn('p-4', className)} {...props} />
  ),
);
CardBody.displayName = 'CardBody';
