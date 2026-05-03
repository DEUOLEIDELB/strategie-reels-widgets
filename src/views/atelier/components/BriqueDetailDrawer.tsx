import { useCallback, useEffect, useMemo, useState } from 'react';
import { ExternalLink, RotateCcw, Beaker, Plus, X, ChevronUp, ChevronDown } from 'lucide-react';
import { Drawer, Input, Textarea, Spinner, Badge, Button } from '@/shared/components';
import { useAvatars, useAngles, usePainPoints, useReels } from '@/shared/hooks/grist';
import {
  type Avatar,
  type Angle,
  type PainPoint,
  type Reel,
  type AtelierNodeType,
} from '@/shared/lib/types';
import { nodeStyleOf } from '../lib/nodeStyle';
import { cn } from '@/shared/lib/utils';
import { useAtelierView } from '../store';
import {
  isSlotOverridden,
  slotsForAvatar,
  slotsForAngle,
  slotsForPain,
  slotsForReel,
  emptySlotsFor,
  type BriqueSlot,
  type SlotOverrides,
} from '../lib/briqueSlots';

const TITLE: Record<AtelierNodeType, string> = {
  avatar: 'Avatar',
  angle: 'Angle',
  pain: 'Pain point',
  reel: 'Reel',
};

const GRIST_DOC_URL = 'https://grist.playwubo.com/o8yNauYWgjtjcnTJyKURyk';

// =====================================================================
// VariantTextarea : un champ pour une variante (controlled, save sur blur)
// =====================================================================

interface VariantTextareaProps {
  value: string;
  placeholder?: string;
  onCommit: (v: string) => void;
}

function VariantTextarea({ value, placeholder, onCommit }: VariantTextareaProps) {
  const [v, setV] = useState(value);
  useEffect(() => setV(value), [value]);
  return (
    <Textarea
      value={v}
      onChange={(e) => setV(e.target.value)}
      onBlur={() => {
        if (v !== value) onCommit(v);
      }}
      rows={3}
      placeholder={placeholder}
      className="rounded-t-none border-0 focus:ring-0"
    />
  );
}

// =====================================================================
// SlotEditor : multi-variantes
// =====================================================================

interface SlotEditorProps {
  slot: BriqueSlot;
  nodeId: string;
}

function SlotEditor({ slot, nodeId }: SlotEditorProps) {
  const addNodeVariant = useAtelierView((s) => s.addNodeVariant);
  const updateNodeVariant = useAtelierView((s) => s.updateNodeVariant);
  const removeNodeVariant = useAtelierView((s) => s.removeNodeVariant);
  const reorderNodeVariants = useAtelierView((s) => s.reorderNodeVariants);
  const resetNodeSlot = useAtelierView((s) => s.resetNodeSlot);

  const overridden = isSlotOverridden(slot);
  const variants = slot.variants;

  return (
    <div className="rounded-md border border-border bg-surface-two">
      <div className="flex items-center gap-1.5 px-3 py-1.5 border-b border-border">
        <span className="text-[12px] font-semibold text-text">{slot.label}</span>
        {overridden ? (
          <Badge variant="current" size="xs">
            {variants.length === 1 ? 'local' : `${variants.length} variantes`}
          </Badge>
        ) : (
          <Badge variant="outline" size="xs">template</Badge>
        )}
        <span className="text-[10px] text-text-faint italic ml-auto line-clamp-1">{slot.hint}</span>
        {overridden && (
          <button
            type="button"
            onClick={() => resetNodeSlot(nodeId, slot.id)}
            className="inline-flex items-center gap-1 text-[10px] text-text-faint hover:text-text"
            title="Tout supprimer et revenir au template"
          >
            <RotateCcw size={10} />
            Reset
          </button>
        )}
      </div>

      {!overridden ? (
        <div>
          {/* Affiche le template en read-only avec un bouton "Override" pour démarrer la 1re variante */}
          <div className="px-3 py-2 text-[12px] text-text-faint italic leading-snug whitespace-pre-line">
            {slot.templateValue || '(template vide — édite-le dans Grist)'}
          </div>
          <div className="px-3 pb-2">
            <Button
              variant="secondary"
              size="sm"
              onClick={() => addNodeVariant(nodeId, slot.id, slot.templateValue)}
              className="w-full"
            >
              <Plus size={12} />
              Créer une variante locale
            </Button>
          </div>
        </div>
      ) : (
        <div className="divide-y divide-border">
          {variants.map((value, index) => (
            <div key={index} className="relative">
              <div className="flex items-center gap-1 px-3 py-1 bg-surface-alt">
                <Badge variant="current" size="xs" className="font-bold">
                  Variante {String.fromCharCode(65 + index)}
                </Badge>
                <span className="ml-auto inline-flex items-center gap-0.5">
                  <button
                    type="button"
                    onClick={() => reorderNodeVariants(nodeId, slot.id, index, index - 1)}
                    disabled={index === 0}
                    className="p-1 rounded-sm text-text-muted hover:bg-surface hover:text-text disabled:opacity-30 disabled:cursor-not-allowed"
                    title="Monter"
                  >
                    <ChevronUp size={11} />
                  </button>
                  <button
                    type="button"
                    onClick={() => reorderNodeVariants(nodeId, slot.id, index, index + 1)}
                    disabled={index === variants.length - 1}
                    className="p-1 rounded-sm text-text-muted hover:bg-surface hover:text-text disabled:opacity-30 disabled:cursor-not-allowed"
                    title="Descendre"
                  >
                    <ChevronDown size={11} />
                  </button>
                  <button
                    type="button"
                    onClick={() => removeNodeVariant(nodeId, slot.id, index)}
                    className="p-1 rounded-sm text-text-muted hover:bg-danger-soft hover:text-danger"
                    title="Supprimer cette variante"
                  >
                    <X size={11} />
                  </button>
                </span>
              </div>
              <VariantTextarea
                value={value}
                placeholder={slot.templateValue || `Variante ${String.fromCharCode(65 + index)}...`}
                onCommit={(v) => updateNodeVariant(nodeId, slot.id, index, v)}
              />
            </div>
          ))}
          <div className="px-3 py-2 bg-surface-alt">
            <Button
              variant="secondary"
              size="sm"
              onClick={() => addNodeVariant(nodeId, slot.id, '')}
              className="w-full"
            >
              <Plus size={12} />
              Ajouter une variante (A/B test)
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}

// =====================================================================
// LabelEditor : titre de l'instance
// =====================================================================

interface LabelEditorProps {
  nodeId: string;
  defaultLabel: string;
  currentOverride: string | undefined;
}

function LabelEditor({ nodeId, defaultLabel, currentOverride }: LabelEditorProps) {
  const setNodeLabelOverride = useAtelierView((s) => s.setNodeLabelOverride);
  const initial = currentOverride ?? defaultLabel;
  const [v, setV] = useState(initial);
  useEffect(() => setV(initial), [initial]);
  const isOverride = currentOverride !== undefined;
  return (
    <div className="rounded-md border border-border bg-surface-two">
      <div className="flex items-center gap-1.5 px-3 py-1.5 border-b border-border">
        <span className="text-[12px] font-semibold text-text">Titre de l'instance</span>
        {isOverride ? (
          <Badge variant="current" size="xs">local</Badge>
        ) : (
          <Badge variant="outline" size="xs">template</Badge>
        )}
        <span className="text-[10px] text-text-faint italic ml-auto">Affiché sur la card</span>
        {isOverride && (
          <button
            type="button"
            onClick={() => {
              setV(defaultLabel);
              setNodeLabelOverride(nodeId, undefined);
            }}
            className="inline-flex items-center gap-1 text-[10px] text-text-faint hover:text-text"
          >
            <RotateCcw size={10} />
            Reset
          </button>
        )}
      </div>
      <Input
        value={v}
        onChange={(e) => setV(e.target.value)}
        onBlur={() => {
          if (v === defaultLabel || v === '') {
            if (isOverride) setNodeLabelOverride(nodeId, undefined);
            return;
          }
          setNodeLabelOverride(nodeId, v);
        }}
        className="rounded-t-none border-0 focus:ring-0"
      />
    </div>
  );
}

// =====================================================================
// InstanceBody
// =====================================================================

interface InstanceBodyProps {
  nodeId: string;
  type: AtelierNodeType;
  briqueId: number;
  slots: BriqueSlot[];
  templateLabel: string;
  labelOverride: string | undefined;
}

function InstanceBody({ nodeId, type, briqueId, slots, templateLabel, labelOverride }: InstanceBodyProps) {
  return (
    <div className="space-y-3">
      <div className="rounded-md bg-current-soft border border-current/30 px-3 py-2 text-[11px] text-current leading-snug flex items-start gap-2">
        <Beaker size={14} className="shrink-0 mt-0.5" />
        <div>
          <div className="font-semibold mb-0.5">Édition locale (laboratoire)</div>
          Cette instance a ses propres variantes. Ajoute 2-3 versions par slot pour tester du A/B.
          Le template Grist et les autres instances restent intacts.
        </div>
      </div>

      <LabelEditor nodeId={nodeId} defaultLabel={templateLabel} currentOverride={labelOverride} />

      {slots.map((slot) => (
        <SlotEditor key={slot.id} slot={slot} nodeId={nodeId} />
      ))}

      <div className="pt-2 border-t border-border">
        <a
          href={`${GRIST_DOC_URL}/p/2`}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center gap-1.5 text-[11px] text-current hover:underline"
          title={`Modifier le template ${TITLE[type]} #${briqueId} dans Grist (affecte toutes les instances)`}
        >
          <ExternalLink size={11} />
          Modifier le template dans Grist (affecte toutes les instances)
        </a>
      </div>
    </div>
  );
}

// =====================================================================
// Drawer racine
// =====================================================================

export function BriqueDetailDrawer() {
  const opened = useAtelierView((s) => s.openedBriqueDrawer);
  const close = useAtelierView((s) => s.closeBriqueDrawer);
  const node = useAtelierView((s) => (opened ? s.nodes.find((n) => n.id === opened.nodeId) ?? null : null));

  const avatars = useAvatars();
  const angles = useAngles();
  const pains = usePainPoints();
  const reels = useReels();

  const computed = useMemo(() => {
    if (!node || !node.type) return null;
    if (node.type === 'note') return null;
    const type = node.type as AtelierNodeType;
    const data = node.data as {
      briqueId?: number;
      label?: string;
      overrides?: SlotOverrides;
      labelOverride?: string;
    };
    const briqueId = Number(data?.briqueId ?? 0);
    const overrides = data?.overrides ?? {};
    let slots: BriqueSlot[] = emptySlotsFor(type, overrides);
    let templateLabel = String(data?.label ?? '');

    if (type === 'avatar') {
      const a = avatars.data?.find((x) => x.id === briqueId) as Avatar | undefined;
      if (a) {
        slots = slotsForAvatar(a, overrides);
        templateLabel = a.prenom || templateLabel;
      }
    } else if (type === 'angle') {
      const a = angles.data?.find((x) => x.id === briqueId) as Angle | undefined;
      if (a) {
        slots = slotsForAngle(a, overrides);
        templateLabel = a.nom || templateLabel;
      }
    } else if (type === 'pain') {
      const p = pains.data?.find((x) => x.id === briqueId) as PainPoint | undefined;
      if (p) {
        slots = slotsForPain(p, overrides);
        templateLabel = p.titre || templateLabel;
      }
    } else if (type === 'reel') {
      const r = reels.data?.find((x) => x.id === briqueId) as Reel | undefined;
      if (r) {
        slots = slotsForReel(r, overrides);
        templateLabel = r.titre || templateLabel;
      }
    }

    return { type, briqueId, slots, templateLabel, labelOverride: data?.labelOverride };
  }, [node, avatars.data, angles.data, pains.data, reels.data]);

  const handleClose = useCallback(() => close(), [close]);

  if (!opened) return <Drawer open={false} onOpenChange={() => undefined}>{null}</Drawer>;

  const loading =
    !computed && (avatars.isLoading || angles.isLoading || pains.isLoading || reels.isLoading);

  if (!computed) {
    return (
      <Drawer open onOpenChange={(o) => !o && handleClose()} title="Instance">
        <div className="px-4 py-12 text-center">
          {loading ? <Spinner /> : (
            <div className="text-xs text-text-faint">Cette instance n'est plus sur le canvas.</div>
          )}
        </div>
      </Drawer>
    );
  }

  const { type, briqueId, slots, templateLabel, labelOverride } = computed;
  const displayedLabel = labelOverride && labelOverride.length > 0 ? labelOverride : templateLabel;

  const style = nodeStyleOf(type);

  return (
    <Drawer open onOpenChange={(o) => !o && handleClose()} title={TITLE[type]} width={500}>
      <div className="px-4 py-3">
        <div className="flex items-center gap-2 mb-3">
          <span
            className={cn(
              'inline-flex items-center px-1.5 h-[18px] rounded-sm text-[10px] font-semibold uppercase tracking-wide',
              style.badgeBg,
              style.badgeText,
            )}
          >
            {style.badgeLabel}
          </span>
          <span className="text-sm font-semibold text-text truncate">{displayedLabel}</span>
          <Badge variant="outline" size="xs" className="ml-auto shrink-0">
            #{briqueId}
          </Badge>
        </div>

        <InstanceBody
          nodeId={opened.nodeId}
          type={type}
          briqueId={briqueId}
          slots={slots}
          templateLabel={templateLabel}
          labelOverride={labelOverride}
        />

        <div className="mt-4 flex justify-end">
          <Button variant="ghost" size="sm" onClick={handleClose}>
            Fermer
          </Button>
        </div>
      </div>
    </Drawer>
  );
}
