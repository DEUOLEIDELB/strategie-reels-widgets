import { cn } from '@/shared/lib/utils';

interface SkeletonProps {
  className?: string;
}

export function Skeleton({ className }: SkeletonProps) {
  return (
    <div
      className={cn('bg-surface-alt rounded-md animate-pulse', className)}
      aria-hidden="true"
    />
  );
}
