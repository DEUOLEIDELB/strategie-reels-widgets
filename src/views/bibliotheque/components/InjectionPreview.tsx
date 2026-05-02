import { ArrowRight } from 'lucide-react';
import type { Avatar, Angle, PainPoint, Hook, Script } from '@/shared/lib/types';
import { Badge } from '@/shared/components';
import { cn, colorFromName, formatDuration } from '@/shared/lib/utils';
import { hookToReelInput, scriptToReelInput } from '../lib/injection';

interface Props {
  type: 'hook' | 'script';
  item: Hook | Script;
  avatar: Avatar | undefined;
  angle: Angle | undefined;
  pain: PainPoint | undefined;
}

export function InjectionPreview({ type, item, avatar, angle, pain }: Props) {
  const ready = avatar && angle && pain;
  if (!ready) {
    return (
      <div className="rounded-md border border-warning/30 bg-warning-soft px-3 py-2 text-xs text-text-dim">
        Sélectionne avatar + angle + pain dans l'Atelier avant d'injecter.
      </div>
    );
  }

  const ctx = { avatar: avatar.id, angle: angle.id, probleme: pain.id };
  const reel =
    type === 'hook'
      ? hookToReelInput(item as Hook, ctx)
      : scriptToReelInput(item as Script, ctx);

  return (
    <div className="rounded-md border border-current/25 bg-current-soft p-3 flex flex-col gap-2">
      <div className="text-[11px] uppercase tracking-wide font-semibold text-current">
        Le Reel qui sera créé
      </div>

      <div className="flex items-center gap-1.5 flex-wrap text-xs">
        <PreviewChip label={avatar.prenom} />
        <ArrowRight size={11} className="text-text-faint" />
        <PreviewChip label={angle.nom} />
        <ArrowRight size={11} className="text-text-faint" />
        <PreviewChip label={pain.titre} />
      </div>

      <PreviewRow label="Titre" value={reel.titre} />
      {reel.titre_overlay && <PreviewRow label="Overlay" value={reel.titre_overlay} mono />}
      <PreviewRow label="Hook" value={reel.hook_verbal} />
      {reel.cta_texte && <PreviewRow label="CTA" value={reel.cta_texte} />}
      <div className="flex items-center gap-2 text-[11px]">
        <Badge variant="default" size="xs">
          statut : {reel.statut}
        </Badge>
        {reel.duree_sec ? (
          <Badge variant="default" size="xs">
            durée : {formatDuration(reel.duree_sec)}
          </Badge>
        ) : null}
      </div>
    </div>
  );
}

function PreviewChip({ label }: { label: string }) {
  return (
    <span
      className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded-sm bg-surface text-[11px]"
      style={{ borderLeft: `3px solid ${colorFromName(label)}` }}
    >
      <span className="truncate max-w-[140px]" title={label}>
        {label}
      </span>
    </span>
  );
}

function PreviewRow({ label, value, mono }: { label: string; value?: string; mono?: boolean }) {
  if (!value) return null;
  return (
    <div className="grid grid-cols-[60px_1fr] gap-2 items-baseline">
      <span className="text-[10px] uppercase tracking-wide text-text-faint">{label}</span>
      <span className={cn('text-xs text-text', mono && 'font-mono uppercase tracking-tight')}>
        {value}
      </span>
    </div>
  );
}
