import { memo } from 'react';
import { Handle, Position, type NodeProps } from '@xyflow/react';
import { Plus, Trash2, Pencil } from 'lucide-react';
import { cn } from '@/shared/lib/utils';
import { Tooltip } from '@/shared/components';
import { nodeStyleOf } from '../../lib/nodeStyle';
import { nextLevelOf, type BriqueNode } from '../../lib/nodeFactory';
import { useNodeCallbacks } from './NodeCallbacksContext';
import type { BriqueSlot } from '../../lib/briqueSlots';

interface SlotPillProps {
  slot: BriqueSlot;
  filled: boolean;
}

function SlotPill({ slot, filled }: SlotPillProps) {
  const preview = filled ? slot.value.slice(0, 80) + (slot.value.length > 80 ? '…' : '') : '(vide)';
  return (
    <Tooltip
      content={
        <div className="max-w-[260px] space-y-1">
          <div className="text-[10px] uppercase tracking-wide opacity-80">{slot.label}</div>
          <div className="text-[11px] italic opacity-70">{slot.hint}</div>
          <div className="text-[12px] leading-snug whitespace-pre-line break-words">{preview}</div>
        </div>
      }
    >
      <div
        className={cn(
          'flex-1 min-w-0 rounded-sm border px-1.5 py-1 cursor-help',
          filled
            ? 'bg-surface border-border-strong text-text'
            : 'bg-surface-alt border-dashed border-border text-text-muted',
        )}
      >
        <div className="text-[9px] uppercase tracking-wide font-semibold opacity-70 leading-none mb-0.5">
          {slot.label}
        </div>
        <div className="text-[10px] leading-tight line-clamp-1">
          {filled ? slot.value : '—'}
        </div>
      </div>
    </Tooltip>
  );
}

function BriqueNodeCardImpl({ id, data, selected }: NodeProps<BriqueNode>) {
  const { onAddChild, onRemove } = useNodeCallbacks();
  const style = nodeStyleOf(data.type);
  const child = nextLevelOf(data.type);
  const childLabel = child === 'angle' ? 'Angle' : child === 'pain' ? 'Pain' : child === 'reel' ? 'Reel' : null;

  const slots = data.slots ?? [];
  const filledCount = slots.filter((s) => s.value && s.value.length > 0).length;
  const totalSlots = slots.length || 3;

  return (
    <div
      className={cn(
        'relative w-[260px] rounded-md border bg-surface px-3 py-2.5 shadow-sm transition-shadow',
        selected ? `${style.borderClass} shadow-md` : 'border-border-strong',
      )}
    >
      <Handle type="target" position={Position.Left} className="!bg-text-faint !w-2 !h-2 !border-0" />

      {/* Header : badge type + indicateurs + actions */}
      <div className="flex items-center gap-1.5 mb-1.5">
        <span
          className={cn(
            'inline-flex items-center px-1.5 h-[18px] rounded-sm text-[10px] font-semibold uppercase tracking-wide shrink-0',
            style.badgeBg,
            style.badgeText,
          )}
        >
          {style.badgeLabel}
        </span>
        {totalSlots > 0 && (
          <Tooltip content={`${filledCount} sur ${totalSlots} slots remplis. Double-clic pour éditer.`}>
            <span
              className={cn(
                'text-[10px] tabular-nums px-1 rounded-sm cursor-help',
                filledCount === totalSlots ? 'bg-success-soft text-success' : 'bg-surface-alt text-text-faint',
              )}
            >
              {filledCount}/{totalSlots}
            </span>
          </Tooltip>
        )}
        <span className="ml-auto inline-flex items-center gap-0.5">
          <Tooltip content="Double-clic sur la carte pour ouvrir le drawer d'édition">
            <Pencil size={10} className="text-text-muted" />
          </Tooltip>
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
        </span>
      </div>

      {/* Titre + subtitle */}
      <div className="mb-2">
        <div className="text-sm font-semibold leading-tight text-text line-clamp-1">{data.label}</div>
        {data.subtitle && (
          <div className="mt-0.5 text-[11px] text-text-faint leading-snug line-clamp-1">{data.subtitle}</div>
        )}
      </div>

      {/* Slots : 3 mini-pills compactes */}
      {slots.length > 0 && (
        <div className="flex items-stretch gap-1">
          {slots.map((s) => (
            <SlotPill key={s.id} slot={s} filled={Boolean(s.value && s.value.length > 0)} />
          ))}
        </div>
      )}

      {/* Bouton + child à droite */}
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
