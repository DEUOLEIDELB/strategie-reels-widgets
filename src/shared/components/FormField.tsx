import { ReactNode } from 'react';
import { cn } from '@/shared/lib/utils';

interface FormFieldProps {
  label?: string;
  hint?: string;
  error?: string;
  required?: boolean;
  children: ReactNode;
  className?: string;
}

export function FormField({ label, hint, error, required, children, className }: FormFieldProps) {
  return (
    <div className={cn('flex flex-col gap-1', className)}>
      {label && (
        <label className="text-xs font-medium text-text-dim flex items-center gap-1">
          {label}
          {required && <span className="text-danger">*</span>}
        </label>
      )}
      {children}
      {error ? (
        <div className="text-xs text-danger">{error}</div>
      ) : hint ? (
        <div className="text-xs text-text-faint">{hint}</div>
      ) : null}
    </div>
  );
}
