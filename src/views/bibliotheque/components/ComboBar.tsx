import { ArrowUpRight, AlertCircle } from 'lucide-react';
import { useAppStore } from '@/shared/store';
import { useAvatars, useAngles, usePainPoints } from '@/shared/hooks/grist';
import { ColorBadge, Chip, Button } from '@/shared/components';
import { cn, colorFromName } from '@/shared/lib/utils';

// Combo bar sticky : montre la combo courante de l'Atelier.
// Lit le store, ne mute rien sauf via setView.
export function ComboBar() {
  const currentAvatarId = useAppStore((s) => s.currentAvatarId);
  const currentAngleId = useAppStore((s) => s.currentAngleId);
  const currentPainId = useAppStore((s) => s.currentPainId);
  const setView = useAppStore((s) => s.setView);

  const { data: avatars } = useAvatars();
  const { data: angles } = useAngles();
  const { data: pains } = usePainPoints();

  const avatar = avatars?.find((a) => a.id === currentAvatarId);
  const angle = angles?.find((a) => a.id === currentAngleId);
  const pain = pains?.find((p) => p.id === currentPainId);

  const filled = [Boolean(avatar), Boolean(angle), Boolean(pain)].filter(Boolean).length;
  const status: 'complete' | 'partial' | 'empty' =
    filled === 3 ? 'complete' : filled === 0 ? 'empty' : 'partial';

  const bg =
    status === 'complete'
      ? 'bg-current-soft border-current/20'
      : status === 'partial'
      ? 'bg-warning-soft border-warning/20'
      : 'bg-danger-soft border-danger/20';

  const labelStatus =
    status === 'complete'
      ? 'Combo prête à injecter'
      : status === 'partial'
      ? 'Combo incomplète'
      : 'Aucune sélection';

  return (
    <div
      className={cn(
        'sticky top-0 z-10 flex items-center gap-3 px-4 py-2 border-b shadow-sm',
        bg,
      )}
    >
      <div className="flex items-center gap-2">
        {status !== 'complete' && <AlertCircle size={14} className="text-text-dim shrink-0" />}
        <span className="text-[11px] font-medium uppercase tracking-wide text-text-dim">
          {labelStatus}
        </span>
      </div>

      <div className="flex items-center gap-1.5 flex-wrap">
        <ComboChip label={avatar?.prenom ?? 'Avatar ?'} active={Boolean(avatar)} />
        <span className="text-text-faint text-xs">+</span>
        <ComboChip label={angle?.nom ?? 'Angle ?'} active={Boolean(angle)} />
        <span className="text-text-faint text-xs">+</span>
        <ComboChip label={pain?.titre ?? 'Pain ?'} active={Boolean(pain)} />
      </div>

      <div className="ml-auto">
        <Button variant="secondary" size="sm" onClick={() => setView('atelier')}>
          {status === 'complete' ? 'Modifier dans l\'Atelier' : 'Compléter dans l\'Atelier'}
          <ArrowUpRight size={14} strokeWidth={1.75} className="ml-1" />
        </Button>
      </div>
    </div>
  );
}

function ComboChip({ label, active }: { label: string; active: boolean }) {
  if (!active) {
    return (
      <Chip className="opacity-60 italic">
        <span className="text-text-faint">{label}</span>
      </Chip>
    );
  }
  return (
    <Chip>
      <ColorBadge colorHex={colorFromName(label)} size="sm" />
      <span className="ml-1.5 max-w-[160px] truncate" title={label}>
        {label}
      </span>
    </Chip>
  );
}
