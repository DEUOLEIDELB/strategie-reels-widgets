import { memo } from 'react';
import { Handle, Position, type NodeProps } from '@xyflow/react';
import { Plus, Trash2 } from 'lucide-react';
import { cn } from '@/shared/lib/utils';
import { nodeStyleOf } from '../../lib/nodeStyle';
import { nextLevelOf, type BriqueNode } from '../../lib/nodeFactory';
import { useNodeCallbacks } from './NodeCallbacksContext';

function BriqueNodeCardImpl({ id, data, selected }: NodeProps<BriqueNode>) {
  const { onAddChild, onRemove } = useNodeCallbacks();
  const style = nodeStyleOf(data.type);
  const child = nextLevelOf(data.type);
  const childLabel = child === 'angle' ? 'Angle' : child === 'pain' ? 'Pain' : child === 'reel' ? 'Reel' : null;

  return (
    <div
      className={cn(
        'relative w-[240px] min-h-[110px] rounded-md border bg-surface px-3 py-2.5 shadow-sm transition-shadow',
        selected ? `${style.borderClass} shadow-md` : 'border-border-strong',
      )}
    >
      <Handle type="target" position={Position.Left} className="!bg-text-faint !w-2 !h-2 !border-0" />

      <div className="flex items-start justify-between gap-2 mb-1.5">
        <span
          className={cn(
            'inline-flex items-center px-1.5 h-[18px] rounded-sm text-[10px] font-semibold uppercase tracking-wide',
            style.badgeBg,
            style.badgeText,
          )}
        >
          {style.badgeLabel}
        </span>
        <button
          type="button"
          onClick={(e) => {
            e.stopPropagation();
            onRemove(id);
          }}
          className="p-1 rounded-sm text-text-muted hover:bg-danger-soft hover:text-danger transition-colors"
          title="Retirer du canvas"
        >
          <Trash2 size={12} />
        </button>
      </div>

      <div className="text-sm font-semibold leading-tight text-text line-clamp-2">{data.label}</div>
      {data.subtitle && (
        <div className="mt-1 text-[11px] text-text-faint leading-snug line-clamp-2">{data.subtitle}</div>
      )}

      {child && (
        <button
          type="button"
          onClick={(e) => {
            e.stopPropagation();
            onAddChild(id);
          }}
          className={cn(
            'absolute -right-3 top-1/2 -translate-y-1/2 z-10',
            'inline-flex items-center gap-1 h-6 px-1.5 rounded-sm border text-[10px] font-medium shadow-sm',
            'bg-surface border-border-strong text-text-dim hover:bg-surface-alt hover:text-text',
          )}
          title={`Ajouter un ${childLabel}`}
        >
          <Plus size={10} />
          {childLabel}
        </button>
      )}

      <Handle type="source" position={Position.Right} className="!bg-text-faint !w-2 !h-2 !border-0" />
    </div>
  );
}

export const BriqueNodeCard = memo(BriqueNodeCardImpl);
