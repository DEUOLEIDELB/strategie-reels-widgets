import { Loader2 } from 'lucide-react';
import { cn } from '@/shared/lib/utils';

interface SpinnerProps {
  size?: 'xs' | 'sm' | 'md' | 'lg';
  className?: string;
}

const sizeMap = { xs: 10, sm: 14, md: 18, lg: 24 };

export function Spinner({ size = 'sm', className }: SpinnerProps) {
  return <Loader2 size={sizeMap[size]} className={cn('animate-spin text-current', className)} />;
}
