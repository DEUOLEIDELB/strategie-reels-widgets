import { Pencil, Trash2, ExternalLink } from 'lucide-react';
import { Card, CardBody, Badge, IconButton } from '@/shared/components';
import { cn, formatDuration, gristDateToJSDate } from '@/shared/lib/utils';
import { VideoPreview } from './VideoPreview';
import { decodePatterns, PATTERN_LABELS, TYPE_TONES } from '../lib/patternsLabels';
import type { ReelReference } from '../lib/queries';

interface Props {
  reel: ReelReference;
  onEdit: () => void;
  onDelete: () => void;
}

const PLATEFORME_LABEL: Record<string, string> = {
  instagram: 'IG',
  tiktok: 'TT',
  youtube_shorts: 'YT',
};

function formatAge(value: string | number | undefined): string | null {
  const d = gristDateToJSDate(value);
  if (!d) return null;
  const days = Math.floor((Date.now() - d.getTime()) / 86400000);
  if (days < 1) return 'aujourd\'hui';
  if (days === 1) return 'hier';
  if (days < 7) return `il y a ${days}j`;
  if (days < 30) return `il y a ${Math.floor(days / 7)}sem`;
  return `il y a ${Math.floor(days / 30)} mois`;
}

export function ReelReferenceCard({ reel, onEdit, onDelete }: Props) {
  const patterns = decodePatterns(reel.patterns);
  const age = formatAge(reel.date_ajout);

  return (
    <Card>
      <VideoPreview url={reel.url} thumbnail={reel.url_thumbnail} alt={reel.createur || 'Reel'} />
      <CardBody className="flex flex-col gap-2">
        <div className="flex items-start justify-between gap-2">
          <div className="flex items-center gap-1.5 min-w-0 flex-1">
            <Badge variant="outline" size="xs">
              {PLATEFORME_LABEL[reel.plateforme] || reel.plateforme || '?'}
            </Badge>
            {reel.createur && (
              <span className="text-[11px] font-medium text-text truncate" title={reel.createur}>
                @{reel.createur}
              </span>
            )}
          </div>
          <div className="flex items-center gap-0.5 -mr-1.5 -mt-1">
            {reel.url && (
              <a
                href={reel.url}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center justify-center h-7 w-7 rounded-sm text-text-faint hover:bg-surface-alt hover:text-text"
                title="Ouvrir le Reel"
                aria-label="Ouvrir le Reel"
              >
                <ExternalLink size={13} strokeWidth={1.75} />
              </a>
            )}
            <IconButton icon={Pencil} label="Modifier" tone="default" size="sm" onClick={onEdit} />
            <IconButton icon={Trash2} label="Supprimer" tone="danger" size="sm" onClick={onDelete} />
          </div>
        </div>

        {reel.hook_observe && (
          <p className="text-sm leading-snug text-text line-clamp-2 italic">
            {String.fromCharCode(8220)}{reel.hook_observe}{String.fromCharCode(8221)}
          </p>
        )}

        {patterns.length > 0 && (
          <div className="flex flex-wrap gap-1">
            {patterns.map((p) => {
              const meta = PATTERN_LABELS[p];
              if (!meta) return null;
              return (
                <Badge key={p} variant={TYPE_TONES[meta.type]} size="xs">
                  {meta.label}
                </Badge>
              );
            })}
          </div>
        )}

        {reel.take_away_wubo && (
          <p
            className={cn(
              'text-[11px] leading-snug text-text-dim border-l-2 border-current pl-2 mt-1',
            )}
            title={reel.take_away_wubo}
          >
            <span className="font-semibold text-current">À voler : </span>
            <span className="line-clamp-2">{reel.take_away_wubo}</span>
          </p>
        )}

        <div className="flex items-center gap-2 pt-1 text-[11px] text-text-faint">
          {reel.vues_estimees && <span>{reel.vues_estimees} vues</span>}
          {reel.duree_sec ? <span>{formatDuration(reel.duree_sec)}</span> : null}
          {age && <span className="ml-auto">{age}</span>}
        </div>
      </CardBody>
    </Card>
  );
}
