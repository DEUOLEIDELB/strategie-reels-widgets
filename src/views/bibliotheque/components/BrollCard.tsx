import { Pencil, Trash2 } from 'lucide-react';
import { Card, CardBody, Badge, IconButton } from '@/shared/components';
import { formatDuration } from '@/shared/lib/utils';
import type { BrollWithVideo } from '../types';
import { VideoPreview } from './VideoPreview';

interface Props {
  broll: BrollWithVideo;
  onEdit: () => void;
  onDelete: () => void;
}

const STATUT_TONE: Record<string, 'default' | 'warning' | 'success' | 'info'> = {
  à_tourner: 'warning',
  a_tourner: 'warning',
  tourné: 'info',
  tourne: 'info',
  monté: 'success',
  monte: 'success',
};

export function BrollCard({ broll, onEdit, onDelete }: Props) {
  const statutKey = (broll.statut || '').toLowerCase().replace(/[\s-]+/g, '_');
  const tone = STATUT_TONE[statutKey] || 'default';

  return (
    <Card>
      <VideoPreview
        url={broll.url_video}
        thumbnail={broll.url_thumbnail}
        alt={broll.description_plan?.slice(0, 40) || 'B-roll'}
      />
      <CardBody className="flex flex-col gap-2">
        <div className="flex items-start justify-between gap-2">
          <Badge variant={tone} size="xs">
            {broll.statut || 'sans statut'}
          </Badge>
          <div className="flex items-center gap-0.5 -mr-1.5 -mt-1">
            <IconButton icon={Pencil} label="Modifier" tone="default" size="sm" onClick={onEdit} />
            <IconButton icon={Trash2} label="Supprimer" tone="danger" size="sm" onClick={onDelete} />
          </div>
        </div>

        <p className="text-sm leading-snug text-text line-clamp-3">{broll.description_plan}</p>

        {broll.setup_technique && (
          <p className="text-[11px] text-text-faint line-clamp-2">setup : {broll.setup_technique}</p>
        )}

        <div className="flex items-center gap-2 pt-1 flex-wrap">
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
        </div>
      </CardBody>
    </Card>
  );
}
