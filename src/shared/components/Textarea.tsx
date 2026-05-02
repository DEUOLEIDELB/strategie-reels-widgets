import { forwardRef, TextareaHTMLAttributes } from 'react';
import { cn } from '@/shared/lib/utils';

export interface TextareaProps extends TextareaHTMLAttributes<HTMLTextAreaElement> {
  error?: string;
}

export const Textarea = forwardRef<HTMLTextAreaElement, TextareaProps>(
  ({ error, className, rows = 3, ...props }, ref) => (
    <textarea
      ref={ref}
      rows={rows}
      className={cn(
        'w-full rounded-md border bg-surface text-text text-sm shadow-sm transition-colors py-2 px-3',
        'placeholder:text-text-muted',
        'focus:outline-none focus:ring-2 focus:ring-current/40 focus:border-current',
        'disabled:opacity-40 disabled:cursor-not-allowed',
        'resize-y',
        error ? 'border-danger' : 'border-border-strong',
        className,
      )}
      {...props}
    />
  ),
);
Textarea.displayName = 'Textarea';
