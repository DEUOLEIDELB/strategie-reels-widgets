import { Film, AlertCircle } from 'lucide-react';
import type { BrollPlan } from '@/shared/lib/types';
import { Card, CardBody, Badge } from '@/shared/components';
import { cn, formatDuration } from '@/shared/lib/utils';

interface Props {
  broll: BrollPlan;
}

function reelsCount(broll: BrollPlan): number {
  if (!broll.reels_qui_utilisent) return 0;
  return broll.reels_qui_utilisent.split(/[,;]/).map((s) => s.trim()).filter(Boolean).length;
}

const STATUT_TONE: Record<string, 'default' | 'warning' | 'success' | 'info'> = {
  à_tourner: 'warning',
  a_tourner: 'warning',
  tourné: 'info',
  tourne: 'info',
  monté: 'success',
  monte: 'success',
};

export function BrollCard({ broll }: Props) {
  const count = reelsCount(broll);
  const orphelin = count === 0;
  const statutKey = (broll.statut || '').toLowerCase().replace(/[\s-]+/g, '_');
  const tone = STATUT_TONE[statutKey] || 'default';

  return (
    <Card className={cn(orphelin && 'border-warning/30')}>
      <CardBody className="flex flex-col gap-2">
        <div className="flex items-start justify-between gap-2">
          <div className="flex items-center gap-1.5 min-w-0">
            <Film size={14} className="text-text-faint shrink-0" />
            <span className="text-[11px] font-mono uppercase tracking-tight text-text-faint">
              {broll.code || `B${broll.id}`}
            </span>
          </div>
          <Badge variant={tone} size="xs">
            {broll.statut || 'sans statut'}
          </Badge>
        </div>

        <p className="text-sm leading-snug text-text line-clamp-3">{broll.description_plan}</p>

        {broll.setup_technique && (
          <p className="text-[11px] text-text-faint line-clamp-2">setup : {broll.setup_technique}</p>
        )}

        <div className="flex items-center gap-2 pt-1">
          {broll.duree_min_secondes ? (
            <Badge variant="default" size="xs">
              {formatDuration(broll.duree_min_secondes)}
            </Badge>
          ) : null}
          {broll.priorite && (
            <Badge variant="outline" size="xs">
              {broll.priorite}
            </Badge>
          )}
          <span
            className={cn(
              'inline-flex items-center gap-1 text-[11px]',
              orphelin ? 'text-warning' : 'text-text-faint',
            )}
            title={orphelin ? 'Jamais réutilisé' : `Utilisé dans ${count} reels`}
          >
            {orphelin && <AlertCircle size={11} />}
            {orphelin ? 'jamais utilisé' : `${count} reel${count > 1 ? 's' : ''}`}
          </span>
        </div>
      </CardBody>
    </Card>
  );
}
