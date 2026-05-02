import { useMemo } from 'react';
import { useMetriquesReels, useReels } from '@/shared/hooks/grist';
import { Skeleton, EmptyState, Badge } from '@/shared/components';
import { Activity } from 'lucide-react';
import type { MetriqueReel, Reel } from '@/shared/lib/types';
import { RadarItemCard } from './RadarItemCard';

interface Props {
  onCapturer: (ctx: { titre: string; source_url?: string; categorie: 'performance' }) => void;
}

function isUnderperforming(m: MetriqueReel): boolean {
  // Décision-rule visuelle : Reel < 200 vues à 48h+
  if (!m.date_post || !m.vues) return false;
  const datePost = new Date(m.date_post);
  if (isNaN(datePost.getTime())) return false;
  const hours = (Date.now() - datePost.getTime()) / 36e5;
  return hours >= 48 && m.vues < 200;
}

export function RadarPerformance({ onCapturer }: Props) {
  const metriques = useMetriquesReels();
  const reels = useReels();

  const data = useMemo(() => {
    if (!metriques.data || !reels.data) return [];
    const reelsById = new Map(reels.data.map((r: Reel) => [r.id, r] as const));
    return [...metriques.data]
      .sort((a, b) => {
        const da = new Date(a.date_post || 0).getTime();
        const db = new Date(b.date_post || 0).getTime();
        return db - da;
      })
      .slice(0, 24)
      .map((m) => ({ m, reel: reelsById.get(m.reel_id) }));
  }, [metriques.data, reels.data]);

  if (metriques.isLoading || reels.isLoading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-3">
        {Array.from({ length: 6 }).map((_, i) => (
          <Skeleton key={i} className="h-32" />
        ))}
      </div>
    );
  }

  if (!data.length) {
    return (
      <EmptyState
        icon={<Activity size={28} />}
        title="Aucune métrique"
        description="Pas de Reel avec métriques. Tourne ton premier Reel et saisis-le dans Grist."
      />
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-3">
      {data.map(({ m, reel }) => {
        const under = isUnderperforming(m);
        const titre = reel?.titre || `Reel #${m.reel_id}`;
        return (
          <RadarItemCard
            key={m.id}
            title={titre}
            subtitle={m.date_post ? new Date(m.date_post).toLocaleDateString('fr-FR') : undefined}
            meta={
              <>
                <Badge variant={under ? 'danger' : 'default'}>
                  {m.vues?.toLocaleString('fr-FR') || '0'} vues
                </Badge>
                <Badge variant="outline">{m.saves || 0} saves</Badge>
                <Badge variant="outline">{m.dm_sends || 0} sends</Badge>
                {under && (
                  <span className="text-[10px] text-danger font-medium">
                    &lt; 200 à 48h : changer le hook
                  </span>
                )}
              </>
            }
            body={
              <>
                Likes : {m.likes || 0} · Comments : {m.comments || 0} · Follows :{' '}
                {m.follows_gagnes || 0}
              </>
            }
            onCapturer={() => onCapturer({ titre, categorie: 'performance' })}
          />
        );
      })}
    </div>
  );
}
