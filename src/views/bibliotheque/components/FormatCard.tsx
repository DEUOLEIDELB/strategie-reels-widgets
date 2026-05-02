import * as Icons from 'lucide-react';
import type { LucideIcon } from 'lucide-react';
import { Card, CardBody } from '@/shared/components';
import { cn } from '@/shared/lib/utils';
import type { FormatStatic, ViewMode } from '../types';

interface Props {
  format: FormatStatic;
  mode: ViewMode;
  selected?: boolean;
  onClick: () => void;
}

function getIcon(name: string): LucideIcon {
  const Lib = Icons as unknown as Record<string, LucideIcon>;
  return Lib[name] || Icons.Sparkles;
}

export function FormatCard({ format, mode, selected, onClick }: Props) {
  const Icon = getIcon(format.icone);

  if (mode === 'list') {
    return (
      <button
        type="button"
        onClick={onClick}
        className={cn(
          'w-full grid grid-cols-[40px_180px_1fr] items-center gap-3 px-3 py-2 text-left rounded-md border border-border bg-surface hover:bg-surface-alt hover:border-border-strong transition-colors',
          selected && 'ring-2 ring-current border-current',
        )}
      >
        <Icon size={18} strokeWidth={1.5} className="text-text-dim" />
        <span className="text-sm font-medium text-text">{format.nom}</span>
        <span className="text-xs text-text-dim truncate">{format.description}</span>
      </button>
    );
  }

  return (
    <Card hoverable selected={selected} onClick={onClick}>
      <CardBody className="flex flex-col gap-2">
        <Icon size={22} strokeWidth={1.5} className="text-current" />
        <h3 className="text-sm font-semibold text-text">{format.nom}</h3>
        <p className="text-xs text-text-dim line-clamp-3 leading-snug">{format.description}</p>
      </CardBody>
    </Card>
  );
}
