import { ReactNode } from 'react';
import { Card } from '@/shared/components';
import { cn } from '@/shared/lib/utils';

interface Props {
  title: string;
  icon?: ReactNode;
  hint?: string;
  className?: string;
  children: ReactNode;
}

export function SyntheseSection({ title, icon, hint, className, children }: Props) {
  return (
    <Card className={cn('flex flex-col', className)}>
      <div className="px-4 py-2.5 border-b border-border bg-surface-two flex items-center gap-2">
        {icon && <span className="text-text-dim">{icon}</span>}
        <span className="text-sm font-semibold">{title}</span>
        {hint && <span className="text-[11px] text-text-faint ml-auto">{hint}</span>}
      </div>
      <div className="p-3 flex-1">{children}</div>
    </Card>
  );
}
