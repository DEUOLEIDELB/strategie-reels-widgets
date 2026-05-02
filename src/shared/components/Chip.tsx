import { HTMLAttributes, MouseEvent } from 'react';
import { X } from 'lucide-react';
import { cn } from '@/shared/lib/utils';

interface ChipProps extends Omit<HTMLAttributes<HTMLSpanElement>, 'onClick'> {
  onClick?: (e: MouseEvent<HTMLSpanElement>) => void;
  onRemove?: () => void;
  active?: boolean;
}

export function Chip({ onClick, onRemove, active, className, children, ...props }: ChipProps) {
  return (
    <span
      onClick={onClick}
      className={cn(
        'inline-flex items-center gap-1 px-2 h-6 rounded-md border text-xs font-medium transition-colors',
        active
          ? 'bg-current text-on-current border-current'
          : 'bg-surface text-text border-border-strong hover:bg-surface-alt',
        onClick && 'cursor-pointer',
        className,
      )}
      {...props}
    >
      {children}
      {onRemove && (
        <button
          type="button"
          onClick={(e) => {
            e.stopPropagation();
            onRemove();
          }}
          className="hover:opacity-70"
          aria-label="Retirer"
        >
          <X size={12} />
        </button>
      )}
    </span>
  );
}
