import { memo } from 'react';
import { Handle, Position, type NodeProps } from '@xyflow/react';
import { Plus, Trash2, Pencil } from 'lucide-react';
import { cn } from '@/shared/lib/utils';
import { Tooltip } from '@/shared/components';
import { nodeStyleOf } from '../../lib/nodeStyle';
import { nextLevelOf, type BriqueNode } from '../../lib/nodeFactory';
import { useNodeCallbacks } from './NodeCallbacksContext';
import { isSlotFilled, isSlotOverridden, type BriqueSlot } from '../../lib/briqueSlots';

const VARIANT_LETTERS = ['A', 'B', 'C', 'D', 'E', 'F', 'G', 'H'];

interface VariantRowProps {
  slot: BriqueSlot;
  // null = afficher le template (pas d'override). Sinon : afficher variants[index].
  variantIndex: number | null;
  onClick: () => void;
}

function VariantRow({ slot, variantIndex, onClick }: VariantRowProps) {
  const isVariant = variantIndex !== null;
  const value = isVariant ? slot.variants[variantIndex] : slot.templateValue;
  const filled = Boolean(value && value.trim().length > 0);

  // Label : "Hook" si template, "Hook A" / "Hook B" / "Hook C" si variantes
  const labelText = isVariant
    ? `${slot.label} ${VARIANT_LETTERS[variantIndex] ?? variantIndex + 1}`
    : slot.label;

  const showLocalBadge = isVariant && slot.variants.length === 1;

  return (
    <Tooltip
      content={
        <div className="max-w-[280px] space-y-1">
          <div className="flex items-center gap-1.5">
            <span className="text-[10px] uppercase tracking-wide font-semibold opacity-90">{labelText}</span>
            {isVariant ? (
              <span className="text-[9px] uppercase font-semibold px-1 rounded-sm bg-current text-on-current">
                {slot.variants.length > 1 ? `variante ${VARIANT_LETTERS[variantIndex] ?? variantIndex + 1}` : 'local'}
              </span>
            ) : (
              <span className="text-[9px] uppercase font-semibold px-1 rounded-sm bg-surface-alt text-text-faint">
                template
              </span>
            )}
          </div>
          <div className="text-[11px] italic opacity-70">Clique pour éditer · {slot.hint}</div>
          <div className="text-[12px] leading-snug whitespace-pre-line break-words">
            {filled ? value : '(vide — clique pour remplir)'}
          </div>
        </div>
      }
    >
      <button
        type="button"
        onClick={(e) => {
          e.stopPropagation();
          onClick();
        }}
        className={cn(
          'w-full flex items-start gap-2 rounded-sm border px-2 py-1.5 text-left transition-colors',
          filled
            ? isVariant
              ? 'bg-current-soft border-current/40 hover:bg-current-soft/80'
              : 'bg-surface border-border-strong hover:bg-surface-alt'
            : 'bg-surface-alt border-dashed border-border hover:bg-surface',
        )}
      >
        <div className="shrink-0 flex flex-col items-start gap-0.5 mt-0.5 w-[44px]">
          <div
            className={cn(
              'text-[9px] uppercase tracking-wide font-semibold leading-none',
              isVariant ? 'text-current' : 'text-text-faint',
            )}
          >
            {labelText}
          </div>
          {showLocalBadge && (
            <div className="text-[8px] font-bold tabular-nums px-1 rounded-sm bg-current text-on-current leading-tight">
              local
            </div>
          )}
        </div>
        <div
          className={cn(
            'flex-1 min-w-0 text-[11px] leading-snug line-clamp-2 break-words',
            filled ? 'text-text' : 'text-text-muted italic',
          )}
        >
          {filled ? value : '—'}
        </div>
      </button>
    </Tooltip>
  );
}

function BriqueNodeCardImpl({ id, data, selected }: NodeProps<BriqueNode>) {
  const { onAddChild, onRemove, onOpenDrawer } = useNodeCallbacks();
  const style = nodeStyleOf(data.type);
  const child = nextLevelOf(data.type);
  const childLabel = child === 'angle' ? 'Angle' : child === 'pain' ? 'Pain' : child === 'reel' ? 'Reel' : null;

  const slots = data.slots ?? [];
  const filledCount = slots.filter(isSlotFilled).length;
  const overrideCount = slots.filter(isSlotOverridden).length;
  const totalSlots = slots.length || 3;
  const totalVariants = slots.reduce((acc, s) => acc + Math.max(s.variants.length, 1), 0);
  const displayLabel = data.labelOverride && data.labelOverride.length > 0 ? data.labelOverride : data.label;

  return (
    <div
      className={cn(
        'relative w-[300px] rounded-md border bg-surface px-3 py-2.5 shadow-sm transition-shadow',
        selected ? `${style.borderClass} shadow-md` : 'border-border-strong',
      )}
    >
      <Handle
        type="target"
        position={Position.Left}
        className="!bg-current !w-3 !h-3 !border-2 !border-surface hover:!w-4 hover:!h-4 transition-all"
        title="Cible : tirer une connexion vers cette brique"
      />

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
        <Tooltip content={`${filledCount} slots / ${totalSlots} ont au moins une valeur. ${totalVariants} ligne${totalVariants > 1 ? 's' : ''} affichée${totalVariants > 1 ? 's' : ''}.`}>
          <span
            className={cn(
              'text-[10px] tabular-nums px-1 rounded-sm cursor-help',
              filledCount === totalSlots ? 'bg-success-soft text-success' : 'bg-surface-alt text-text-faint',
            )}
          >
            {filledCount}/{totalSlots}
          </span>
        </Tooltip>
        {overrideCount > 0 && (
          <Tooltip content={`${overrideCount} slot${overrideCount > 1 ? 's' : ''} avec override${overrideCount > 1 ? 's' : ''} local${overrideCount > 1 ? 'aux' : ''}.`}>
            <span className="text-[10px] px-1 rounded-sm bg-current-soft text-current cursor-help font-medium">
              local
            </span>
          </Tooltip>
        )}
        <span className="ml-auto inline-flex items-center gap-0.5">
          <Tooltip content="Double-clic ou clique sur un slot pour éditer cette instance">
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
        <div className="text-sm font-semibold leading-tight text-text line-clamp-1">{displayLabel}</div>
        {data.subtitle && (
          <div className="mt-0.5 text-[11px] text-text-faint leading-snug line-clamp-1">{data.subtitle}</div>
        )}
      </div>

      {/* Slots : un row par variante (ou 1 row pour le template si pas d'override). */}
      {slots.length > 0 && (
        <div className="flex flex-col gap-1">
          {slots.flatMap((s) => {
            if (s.variants.length === 0) {
              return [
                <VariantRow
                  key={s.id}
                  slot={s}
                  variantIndex={null}
                  onClick={() => onOpenDrawer(id)}
                />,
              ];
            }
            return s.variants.map((_, i) => (
              <VariantRow
                key={`${s.id}-${i}`}
                slot={s}
                variantIndex={i}
                onClick={() => onOpenDrawer(id)}
              />
            ));
          })}
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

      <Handle
        type="source"
        position={Position.Right}
        className="!bg-current !w-3 !h-3 !border-2 !border-surface hover:!w-4 hover:!h-4 transition-all"
        title="Source : tirer pour créer une nouvelle connexion"
      />
    </div>
  );
}

export const BriqueNodeCard = memo(BriqueNodeCardImpl);
