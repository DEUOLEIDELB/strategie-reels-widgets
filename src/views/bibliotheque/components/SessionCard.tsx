import { Calendar, MapPin, Users, Pencil, Trash2 } from 'lucide-react';
import type { SessionTournage } from '@/shared/lib/types';
import { Card, CardBody, Badge, IconButton } from '@/shared/components';
import { gristDateToJSDate } from '@/shared/lib/utils';

interface Props {
  session: SessionTournage;
  onEdit: () => void;
  onDelete: () => void;
}

function formatDate(value: number | string | null | undefined): string {
  const d = gristDateToJSDate(value);
  if (!d) return 'date à fixer';
  return d.toLocaleDateString('fr-FR', { weekday: 'short', day: 'numeric', month: 'short' });
}

const STATUT_TONE: Record<string, 'default' | 'warning' | 'success' | 'info'> = {
  à_planifier: 'warning',
  a_planifier: 'warning',
  planifiée: 'info',
  planifiee: 'info',
  tournée: 'success',
  tournee: 'success',
};

export function SessionCard({ session, onEdit, onDelete }: Props) {
  const statutKey = (session.statut || '').toLowerCase().replace(/[\s-]+/g, '_');
  const tone = STATUT_TONE[statutKey] || 'default';
  const reelsCount = session.reels_alimentes
    ? session.reels_alimentes.split(/[,;]/).map((s) => s.trim()).filter(Boolean).length
    : 0;

  return (
    <Card>
      <CardBody className="flex flex-col gap-2">
        <div className="flex items-start justify-between gap-2">
          <div className="flex-1 min-w-0">
            <h3 className="text-sm font-semibold text-text leading-snug">{session.type || 'Session'}</h3>
          </div>
          <Badge variant={tone} size="xs">
            {session.statut || 'sans statut'}
          </Badge>
          <div className="flex items-center gap-0.5 -mr-1.5 -mt-1">
            <IconButton icon={Pencil} label="Modifier" tone="default" size="sm" onClick={onEdit} />
            <IconButton icon={Trash2} label="Supprimer" tone="danger" size="sm" onClick={onDelete} />
          </div>
        </div>

        <div className="flex items-center gap-3 text-[11px] text-text-dim flex-wrap">
          <span className="inline-flex items-center gap-1">
            <Calendar size={11} />
            {formatDate(session.date_planifiee)}
          </span>
          {session.duree_estimee_min ? (
            <span>{session.duree_estimee_min} min</span>
          ) : null}
          {session.lieu && (
            <span className="inline-flex items-center gap-1 truncate" title={session.lieu}>
              <MapPin size={11} />
              {session.lieu}
            </span>
          )}
        </div>

        {session.personnes_requises && (
          <div className="flex items-center gap-1 text-[11px] text-text-faint">
            <Users size={11} />
            <span className="truncate">{session.personnes_requises}</span>
          </div>
        )}

        {session.equipement && (
          <p className="text-[11px] text-text-faint line-clamp-2">éq. : {session.equipement}</p>
        )}

        <div className="pt-1">
          <span className="text-[11px] text-text-dim">
            {reelsCount > 0 ? `Alimente ${reelsCount} reel${reelsCount > 1 ? 's' : ''}` : 'Aucun reel rattaché'}
          </span>
        </div>
      </CardBody>
    </Card>
  );
}
