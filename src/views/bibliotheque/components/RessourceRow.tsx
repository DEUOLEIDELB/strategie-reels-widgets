import { ExternalLink, Download, Rocket, Star } from 'lucide-react';
import type { LucideIcon } from 'lucide-react';
import toast from 'react-hot-toast';
import { Badge } from '@/shared/components';
import { cn } from '@/shared/lib/utils';
import type { RessourceWithAction, RessourceTypeAction, RessourceDroits } from '../types';

interface Props {
  ressource: RessourceWithAction;
}

const ACTION_LABEL: Record<RessourceTypeAction, { verbe: string; icone: LucideIcon }> = {
  banque: { verbe: 'Ouvrir', icone: ExternalLink },
  asset_direct: { verbe: 'Télécharger', icone: Download },
  outil_logiciel: { verbe: 'Lancer', icone: Rocket },
};

const DROITS_TONE: Record<RessourceDroits, { label: string; tone: 'success' | 'info' | 'warning' | 'danger' | 'default' }> = {
  public_domain: { label: 'public domain', tone: 'success' },
  cc: { label: 'creative commons', tone: 'info' },
  free: { label: 'free', tone: 'success' },
  freemium: { label: 'freemium', tone: 'warning' },
  payant: { label: 'payant', tone: 'danger' },
};

function Stars({ score }: { score: number }) {
  const safe = Math.max(0, Math.min(5, score || 0));
  return (
    <span className="inline-flex items-center gap-0.5" aria-label={`${safe} sur 5`}>
      {Array.from({ length: 5 }).map((_, i) => (
        <Star
          key={i}
          size={10}
          strokeWidth={1.5}
          className={i < safe ? 'fill-accent text-accent' : 'text-border-strong'}
        />
      ))}
    </span>
  );
}

export function RessourceRow({ ressource }: Props) {
  const action = ACTION_LABEL[ressource.type_action as RessourceTypeAction] || ACTION_LABEL.banque;
  const droits = ressource.droits ? DROITS_TONE[ressource.droits as RessourceDroits] : null;
  const Icon = action.icone;

  function handleClick() {
    if (!ressource.url) {
      toast.error('Pas d\'URL pour cette ressource.');
      return;
    }
    window.open(ressource.url, '_blank', 'noopener,noreferrer');
  }

  return (
    <div
      className={cn(
        'group grid grid-cols-[1fr_120px_120px_60px_120px] items-center gap-3 px-3 py-2 rounded-md border border-border bg-surface',
        'hover:bg-surface-alt hover:border-border-strong transition-colors',
      )}
    >
      <div className="min-w-0">
        <div className="text-sm font-medium text-text truncate">{ressource.nom}</div>
        {ressource.usage_recommande && (
          <div className="text-[11px] text-text-faint truncate" title={ressource.usage_recommande}>
            {ressource.usage_recommande}
          </div>
        )}
      </div>
      <Badge variant="outline" size="xs" className="justify-self-start">
        {ressource.categorie || 'sans cat'}
      </Badge>
      {droits ? (
        <Badge variant={droits.tone} size="xs" className="justify-self-start">
          {droits.label}
        </Badge>
      ) : (
        <span className="text-[10px] text-text-faint">—</span>
      )}
      <Stars score={ressource.score_priorite} />
      <button
        type="button"
        onClick={handleClick}
        className={cn(
          'inline-flex items-center justify-center gap-1 h-7 px-2 rounded-md text-[11px] font-medium',
          'bg-accent text-on-accent border border-accent-strong shadow-sm',
          'hover:brightness-95 active:translate-x-px active:translate-y-px active:shadow-none',
        )}
      >
        <Icon size={11} strokeWidth={1.75} />
        {action.verbe}
      </button>
    </div>
  );
}
