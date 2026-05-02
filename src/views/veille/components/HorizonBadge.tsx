import type { SignalHorizon } from '@/shared/lib/types';
import { Badge } from '@/shared/components';

const VARIANTS: Record<SignalHorizon, 'accent' | 'current' | 'default'> = {
  now: 'accent',
  next: 'current',
  later: 'default',
};

const LABELS: Record<SignalHorizon, string> = {
  now: 'Now',
  next: 'Next',
  later: 'Later',
};

export function HorizonBadge({ horizon }: { horizon: SignalHorizon | '' }) {
  if (!horizon) return null;
  return <Badge variant={VARIANTS[horizon]}>{LABELS[horizon]}</Badge>;
}
