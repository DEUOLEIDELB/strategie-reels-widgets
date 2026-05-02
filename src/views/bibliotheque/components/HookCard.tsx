import type { Hook } from '@/shared/lib/types';
import { Card, CardBody, Badge } from '@/shared/components';
import { cn } from '@/shared/lib/utils';
import { parseChoiceList } from '../lib/parsing';
import type { ViewMode } from '../types';

interface Props {
  hook: Hook;
  mode: ViewMode;
  selected?: boolean;
  onClick: () => void;
}

export function HookCard({ hook, mode, selected, onClick }: Props) {
  const signals = parseChoiceList(hook.signal_algo_cible);

  if (mode === 'list') {
    return (
      <button
        type="button"
        onClick={onClick}
        className={cn(
          'w-full grid grid-cols-[120px_1fr_120px_180px_140px] items-center gap-3 px-3 py-2 text-left rounded-md border border-border bg-surface hover:bg-surface-alt hover:border-border-strong transition-colors',
          selected && 'ring-2 ring-current border-current',
        )}
      >
        <span className="text-[11px] font-bold uppercase tracking-tight text-text-faint truncate">
          {hook.thumbnail || '—'}
        </span>
        <span className="text-sm text-text truncate">{hook.texte}</span>
        <Badge variant="outline" className="justify-self-start">
          {hook.categorie || 'sans cat'}
        </Badge>
        <div className="flex items-center gap-1 flex-wrap">
          {signals.slice(0, 3).map((s) => (
            <Badge key={s} variant="info" size="xs">
              {s}
            </Badge>
          ))}
        </div>
        <span className="text-[11px] text-text-faint truncate">{hook.serie || ''}</span>
      </button>
    );
  }

  return (
    <Card hoverable selected={selected} onClick={onClick}>
      <CardBody className="flex flex-col gap-2">
        <div className="text-[11px] font-bold uppercase tracking-tight text-text-faint">
          {hook.thumbnail || '—'}
        </div>
        <p className="text-sm leading-snug text-text line-clamp-3">{hook.texte}</p>
        <div className="flex items-center gap-1 flex-wrap pt-1">
          <Badge variant="outline" size="xs">
            {hook.categorie || 'sans cat'}
          </Badge>
          {signals.slice(0, 3).map((s) => (
            <Badge key={s} variant="info" size="xs">
              {s}
            </Badge>
          ))}
        </div>
        {hook.serie && (
          <div className="text-[11px] text-text-faint truncate" title={hook.serie}>
            {hook.serie}
          </div>
        )}
      </CardBody>
    </Card>
  );
}
