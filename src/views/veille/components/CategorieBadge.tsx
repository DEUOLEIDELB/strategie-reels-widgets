import type { SignalCategorie } from '@/shared/lib/types';
import { SIGNAL_CATEGORIE_LABELS } from '@/shared/lib/types';
import { Badge } from '@/shared/components';

const COLORS: Record<SignalCategorie, string> = {
  performance: '#1F8A4A',
  concurrent: '#D40272',
  trend_son: '#FFDD0B',
  trend_format: '#1DC1F9',
  actu: '#B36B00',
  audience: '#5914D0',
  algo: '#6B6B6B',
};

export function CategorieBadge({ categorie }: { categorie: SignalCategorie | '' }) {
  if (!categorie) return null;
  return (
    <Badge color={COLORS[categorie]} soft>
      {SIGNAL_CATEGORIE_LABELS[categorie]}
    </Badge>
  );
}
