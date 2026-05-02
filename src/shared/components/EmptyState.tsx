import { ReactNode } from 'react';
import { cn } from '@/shared/lib/utils';

interface EmptyStateProps {
  title: string;
  description?: string;
  icon?: ReactNode;
  action?: ReactNode;
  className?: string;
}

export function EmptyState({ title, description, icon, action, className }: EmptyStateProps) {
  return (
    <div
      className={cn(
        'flex flex-col items-center justify-center text-center py-10 px-6 gap-2',
        className,
      )}
    >
      {icon && <div className="text-text-faint mb-1">{icon}</div>}
      <div className="text-sm font-medium text-text">{title}</div>
      {description && (
        <div className="text-xs text-text-faint max-w-sm leading-relaxed">{description}</div>
      )}
      {action && <div className="mt-2">{action}</div>}
    </div>
  );
}
