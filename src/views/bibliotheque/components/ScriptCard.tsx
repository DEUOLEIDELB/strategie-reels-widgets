import type { Script } from '@/shared/lib/types';
import { Card, CardBody, Badge } from '@/shared/components';
import { cn, formatDuration } from '@/shared/lib/utils';
import { parseChoiceList } from '../lib/parsing';
import type { ViewMode } from '../types';

interface Props {
  script: Script;
  mode: ViewMode;
  selected?: boolean;
  onClick: () => void;
}

export function ScriptCard({ script, mode, selected, onClick }: Props) {
  const signals = parseChoiceList(script.signal_algo_cible);

  if (mode === 'list') {
    return (
      <button
        type="button"
        onClick={onClick}
        className={cn(
          'w-full grid grid-cols-[1fr_1fr_120px_140px_70px_140px] items-center gap-3 px-3 py-2 text-left rounded-md border border-border bg-surface hover:bg-surface-alt hover:border-border-strong transition-colors',
          selected && 'ring-2 ring-current border-current',
        )}
      >
        <span className="text-sm font-medium text-text truncate">{script.titre}</span>
        <span className="text-xs text-text-dim truncate">{script.sujet || ''}</span>
        <Badge variant="outline">{script.categorie || 'sans cat'}</Badge>
        <Badge variant="default">{script.angle || 'sans angle'}</Badge>
        <span className="text-[11px] text-text-faint">{formatDuration(script.duree_sec)}</span>
        <div className="flex items-center gap-1 flex-wrap">
          {signals.slice(0, 2).map((s) => (
            <Badge key={s} variant="info" size="xs">
              {s}
            </Badge>
          ))}
        </div>
      </button>
    );
  }

  return (
    <Card hoverable selected={selected} onClick={onClick}>
      <CardBody className="flex flex-col gap-2">
        <div className="flex items-start justify-between gap-2">
          <h3 className="text-sm font-semibold text-text leading-snug line-clamp-2 flex-1">
            {script.titre}
          </h3>
          <Badge variant="default" size="xs">
            {formatDuration(script.duree_sec)}
          </Badge>
        </div>
        {script.sujet && (
          <p className="text-xs text-text-dim line-clamp-2 leading-snug">{script.sujet}</p>
        )}
        <div className="flex items-center gap-1 flex-wrap pt-1">
          <Badge variant="outline" size="xs">
            {script.categorie || 'sans cat'}
          </Badge>
          <Badge variant="default" size="xs">
            {script.angle || 'sans angle'}
          </Badge>
          {signals.slice(0, 2).map((s) => (
            <Badge key={s} variant="info" size="xs">
              {s}
            </Badge>
          ))}
        </div>
      </CardBody>
    </Card>
  );
}
