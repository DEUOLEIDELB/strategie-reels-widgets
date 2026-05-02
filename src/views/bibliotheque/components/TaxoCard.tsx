import type { TaxoEntry } from '@/shared/lib/types';
import { Card, CardBody, Badge } from '@/shared/components';
import { cn } from '@/shared/lib/utils';
import type { ViewMode } from '../types';

interface Props {
  entry: TaxoEntry;
  mode: ViewMode;
  selected?: boolean;
  onClick: () => void;
}

export function TaxoCard({ entry, mode, selected, onClick }: Props) {
  if (mode === 'list') {
    return (
      <button
        type="button"
        onClick={onClick}
        className={cn(
          'w-full grid grid-cols-[120px_180px_1fr] items-center gap-3 px-3 py-2 text-left rounded-md border border-border bg-surface hover:bg-surface-alt hover:border-border-strong transition-colors',
          selected && 'ring-2 ring-current border-current',
        )}
      >
        <Badge variant="outline" className="justify-self-start">
          {entry.type || 'autre'}
        </Badge>
        <span className="text-sm font-medium text-text truncate">{entry.nom}</span>
        <span className="text-xs text-text-dim truncate" title={entry.definition}>
          {entry.definition}
        </span>
      </button>
    );
  }

  return (
    <Card hoverable selected={selected} onClick={onClick}>
      <CardBody className="flex flex-col gap-2">
        <Badge variant="outline" size="xs" className="self-start">
          {entry.type || 'autre'}
        </Badge>
        <h3 className="text-sm font-semibold text-text">{entry.nom}</h3>
        {entry.definition && (
          <p className="text-xs text-text-dim line-clamp-3 leading-snug">{entry.definition}</p>
        )}
        {entry.exemple_wubo && (
          <p className="text-[11px] text-text-faint italic line-clamp-2 leading-snug">
            ex : {entry.exemple_wubo}
          </p>
        )}
      </CardBody>
    </Card>
  );
}
