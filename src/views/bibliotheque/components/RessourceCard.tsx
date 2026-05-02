import { Star } from 'lucide-react';
import type { Ressource } from '@/shared/lib/types';
import { Card, CardBody, Badge } from '@/shared/components';
import { cn } from '@/shared/lib/utils';
import type { ViewMode } from '../types';

interface Props {
  ressource: Ressource;
  mode: ViewMode;
  selected?: boolean;
  onClick: () => void;
}

function Stars({ score }: { score: number }) {
  const safe = Math.max(0, Math.min(5, score || 0));
  return (
    <span className="inline-flex items-center gap-0.5" aria-label={`${safe} sur 5`}>
      {Array.from({ length: 5 }).map((_, i) => (
        <Star
          key={i}
          size={11}
          strokeWidth={1.5}
          className={i < safe ? 'fill-accent text-accent' : 'text-border-strong'}
        />
      ))}
    </span>
  );
}

export function RessourceCard({ ressource, mode, selected, onClick }: Props) {
  if (mode === 'list') {
    return (
      <button
        type="button"
        onClick={onClick}
        className={cn(
          'w-full grid grid-cols-[1fr_140px_100px_100px_1fr] items-center gap-3 px-3 py-2 text-left rounded-md border border-border bg-surface hover:bg-surface-alt hover:border-border-strong transition-colors',
          selected && 'ring-2 ring-current border-current',
        )}
      >
        <span className="text-sm font-medium text-text truncate">{ressource.nom}</span>
        <Badge variant="outline">{ressource.categorie || 'sans cat'}</Badge>
        <Badge variant={ressource.prix === 'gratuit' ? 'success' : 'default'} size="xs">
          {ressource.prix || '—'}
        </Badge>
        <Stars score={ressource.score_priorite} />
        <span className="text-xs text-text-dim truncate" title={ressource.usage_recommande}>
          {ressource.usage_recommande || ''}
        </span>
      </button>
    );
  }

  return (
    <Card hoverable selected={selected} onClick={onClick}>
      <CardBody className="flex flex-col gap-2">
        <div className="flex items-start justify-between gap-2">
          <h3 className="text-sm font-semibold text-text line-clamp-2 flex-1">{ressource.nom}</h3>
          <Stars score={ressource.score_priorite} />
        </div>
        {ressource.usage_recommande && (
          <p className="text-xs text-text-dim line-clamp-3 leading-snug">
            {ressource.usage_recommande}
          </p>
        )}
        <div className="flex items-center gap-1 flex-wrap pt-1">
          <Badge variant="outline" size="xs">
            {ressource.categorie || 'sans cat'}
          </Badge>
          <Badge variant={ressource.prix === 'gratuit' ? 'success' : 'default'} size="xs">
            {ressource.prix || '—'}
          </Badge>
        </div>
      </CardBody>
    </Card>
  );
}
