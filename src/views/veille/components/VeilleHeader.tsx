import { Archive, Plus } from 'lucide-react';
import { Button } from '@/shared/components';

interface Props {
  semaineIso: string;
  onCapturer: () => void;
  onArchiver: () => void;
  archiverDisabled?: boolean;
  archiverDisabledReason?: string;
}

function semaineLabel(iso: string): string {
  const m = iso.match(/^(\d{4})-W(\d{2})$/);
  if (!m) return iso;
  return `Semaine ${m[2]} (${m[1]})`;
}

export function VeilleHeader({
  semaineIso,
  onCapturer,
  onArchiver,
  archiverDisabled,
  archiverDisabledReason,
}: Props) {
  return (
    <div className="flex items-center justify-between px-4 py-2 border-b border-border bg-surface-two shrink-0">
      <div className="flex items-baseline gap-3">
        <h1 className="text-base font-semibold">Veille</h1>
        <span className="text-xs text-text-faint">{semaineLabel(semaineIso)}</span>
      </div>
      <div className="flex items-center gap-2">
        <Button
          variant="secondary"
          size="sm"
          onClick={onArchiver}
          disabled={archiverDisabled}
          title={archiverDisabled ? archiverDisabledReason : undefined}
        >
          <Archive size={12} className="mr-1.5" />
          Archiver synthèse
        </Button>
        <Button variant="primary" size="sm" onClick={onCapturer}>
          <Plus size={12} className="mr-1.5" />
          Capturer signal
        </Button>
      </div>
    </div>
  );
}
