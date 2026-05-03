import { useCallback, useEffect, useMemo, useState } from 'react';
import { ExternalLink, RotateCcw, Beaker } from 'lucide-react';
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
  effectiveValue,
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

interface SlotEditorProps {
  slot: BriqueSlot;
  onChange: (value: string | undefined) => void;
}

function SlotEditor({ slot, onChange }: SlotEditorProps) {
  const [v, setV] = useState(effectiveValue(slot));
  useEffect(() => setV(effectiveValue(slot)), [slot.templateValue, slot.overrideValue]);

  const overridden = isSlotOverridden(slot);

  return (
    <div className="rounded-md border border-border bg-surface-two">
      <div className="flex items-center gap-1.5 px-3 py-1.5 border-b border-border">
        <span className="text-[12px] font-semibold text-text">{slot.label}</span>
        {overridden ? (
          <Badge variant="current" size="xs">local</Badge>
        ) : (
          <Badge variant="outline" size="xs">template</Badge>
        )}
        <span className="text-[10px] text-text-faint italic ml-auto line-clamp-1">{slot.hint}</span>
        {overridden && (
          <button
            type="button"
            onClick={() => {
              setV(slot.templateValue);
              onChange(undefined);
            }}
            className="inline-flex items-center gap-1 text-[10px] text-text-faint hover:text-text"
            title="Revenir à la valeur du template"
          >
            <RotateCcw size={10} />
            Reset
          </button>
        )}
      </div>
      <Textarea
        value={v}
        onChange={(e) => setV(e.target.value)}
        onBlur={() => {
          // Empty -> remove override (back to template)
          if (v === slot.templateValue || v === '') {
            if (overridden) onChange(undefined);
            return;
          }
          if (v !== effectiveValue(slot)) onChange(v);
        }}
        rows={3}
        className="rounded-t-none border-0 focus:ring-0"
        placeholder={slot.templateValue || `Saisis le ${slot.label.toLowerCase()} pour cette instance...`}
      />
    </div>
  );
}

interface BodyProps {
  nodeId: string;
  type: AtelierNodeType;
  briqueId: number;
  // Tous les slots (overrides déjà inclus si présents)
  slots: BriqueSlot[];
}

function LabelEditor({ nodeId, defaultLabel, currentOverride }: { nodeId: string; defaultLabel: string; currentOverride: string | undefined }) {
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
        <span className="text-[10px] text-text-faint italic ml-auto">Affiché sur la carte du canvas</span>
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

function InstanceBody({ nodeId, type, briqueId, slots }: BodyProps) {
  const setNodeOverride = useAtelierView((s) => s.setNodeOverride);
  const node = useAtelierView((s) => s.nodes.find((n) => n.id === nodeId));
  const labelOverride = (node?.data as { labelOverride?: string } | undefined)?.labelOverride;
  const baseLabel = String((node?.data as { label?: string } | undefined)?.label ?? '');

  return (
    <div className="space-y-3">
      <div className="rounded-md bg-current-soft border border-current/30 px-3 py-2 text-[11px] text-current leading-snug flex items-start gap-2">
        <Beaker size={14} className="shrink-0 mt-0.5" />
        <div>
          <div className="font-semibold mb-0.5">Édition locale (laboratoire)</div>
          Tu modifies cette INSTANCE uniquement. Les autres instances de la même brique et le template Grist restent intacts. Pose la même brique 2 fois pour comparer 2 variantes.
        </div>
      </div>

      <LabelEditor nodeId={nodeId} defaultLabel={baseLabel} currentOverride={labelOverride} />

      {slots.map((slot) => (
        <SlotEditor
          key={slot.id}
          slot={slot}
          onChange={(value) => setNodeOverride(nodeId, slot.id, value)}
        />
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

    return { type, briqueId, slots, templateLabel };
  }, [node, avatars.data, angles.data, pains.data, reels.data]);

  const handleClose = useCallback(() => close(), [close]);

  if (!opened) return <Drawer open={false} onOpenChange={() => undefined}>{null}</Drawer>;

  const loading =
    !computed &&
    ((opened && avatars.isLoading) ||
      angles.isLoading ||
      pains.isLoading ||
      reels.isLoading);

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

  const { type, briqueId, slots, templateLabel } = computed;
  const data = node?.data as { labelOverride?: string } | undefined;
  const displayedLabel = data?.labelOverride && data.labelOverride.length > 0 ? data.labelOverride : templateLabel;

  const style = nodeStyleOf(type);

  return (
    <Drawer open onOpenChange={(o) => !o && handleClose()} title={TITLE[type]} width={460}>
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

        <InstanceBody nodeId={opened.nodeId} type={type} briqueId={briqueId} slots={slots} />

        <div className="mt-4 flex justify-end">
          <Button variant="ghost" size="sm" onClick={handleClose}>
            Fermer
          </Button>
        </div>
      </div>
    </Drawer>
  );
}
