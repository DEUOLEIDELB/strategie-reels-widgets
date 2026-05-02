import { useMemo, useState } from 'react';
import { ExternalLink, Sparkles } from 'lucide-react';
import { useVideosVirales } from '@/shared/hooks/grist';
import { Skeleton, EmptyState, Badge, Select, Drawer } from '@/shared/components';
import type { VideoVirale } from '@/shared/lib/types';
import { RadarItemCard } from './RadarItemCard';

interface Props {
  onCapturer: (ctx: {
    titre: string;
    source_url?: string;
    categorie: 'trend_format';
  }) => void;
}

const TIER_VARIANTS: Record<string, 'current' | 'success' | 'warning' | 'default'> = {
  S: 'current',
  A: 'success',
  B: 'warning',
  C: 'default',
};

export function RadarInspiration({ onCapturer }: Props) {
  const q = useVideosVirales();
  const [plateforme, setPlateforme] = useState<string>('');
  const [tier, setTier] = useState<string>('');
  const [openId, setOpenId] = useState<number | null>(null);

  const allPlateformes = useMemo(
    () => Array.from(new Set((q.data || []).map((v) => v.plateforme).filter(Boolean))).sort(),
    [q.data],
  );

  const filtered = useMemo(
    () =>
      (q.data || []).filter((v) => {
        if (plateforme && v.plateforme !== plateforme) return false;
        if (tier && v.tier_reproductibilite !== tier) return false;
        return true;
      }),
    [q.data, plateforme, tier],
  );

  const opened = (q.data || []).find((v) => v.id === openId) || null;

  if (q.isLoading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-3">
        {Array.from({ length: 6 }).map((_, i) => (
          <Skeleton key={i} className="h-32" />
        ))}
      </div>
    );
  }
  if (!q.data?.length) {
    return (
      <EmptyState
        icon={<Sparkles size={28} />}
        title="Aucune vidéo virale"
        description="Ajoute des vidéos via Grist (table Videos_virales)."
      />
    );
  }

  return (
    <>
      <div className="flex items-center gap-2 mb-3">
        <Select size="sm" value={plateforme} onChange={(e) => setPlateforme(e.target.value)}>
          <option value="">Toutes plateformes</option>
          {allPlateformes.map((p) => (
            <option key={p} value={p}>
              {p}
            </option>
          ))}
        </Select>
        <Select size="sm" value={tier} onChange={(e) => setTier(e.target.value)}>
          <option value="">Tous tiers</option>
          <option value="S">S</option>
          <option value="A">A</option>
          <option value="B">B</option>
          <option value="C">C</option>
        </Select>
        {(plateforme || tier) && (
          <button
            onClick={() => {
              setPlateforme('');
              setTier('');
            }}
            className="text-xs text-text-faint hover:text-text"
          >
            Reset
          </button>
        )}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-3">
        {filtered.map((v) => (
          <RadarItemCard
            key={v.id}
            title={v.titre_ou_description?.slice(0, 80) || 'Vidéo virale'}
            subtitle={v.createur}
            meta={
              <>
                {v.plateforme && <Badge>{v.plateforme}</Badge>}
                {v.vues_likes && <Badge variant="outline">{v.vues_likes}</Badge>}
                {v.tier_reproductibilite && (
                  <Badge variant={TIER_VARIANTS[v.tier_reproductibilite] || 'default'}>
                    Tier {v.tier_reproductibilite}
                  </Badge>
                )}
              </>
            }
            body={v.pourquoi_a_perce?.slice(0, 120)}
            onClick={() => setOpenId(v.id)}
            onCapturer={() =>
              onCapturer({
                titre: v.titre_ou_description?.slice(0, 80) || 'Vidéo virale',
                source_url: v.source_url,
                categorie: 'trend_format',
              })
            }
          />
        ))}
      </div>

      <Drawer
        open={!!opened}
        onOpenChange={(o) => !o && setOpenId(null)}
        title={opened?.titre_ou_description?.slice(0, 60)}
        width={460}
      >
        {opened && <VideoDetail v={opened} />}
      </Drawer>
    </>
  );
}

function VideoDetail({ v }: { v: VideoVirale }) {
  return (
    <div className="p-4 flex flex-col gap-4 text-sm">
      <div className="flex items-center justify-between">
        <div className="text-xs text-text-faint">{v.createur}</div>
        {v.source_url && (
          <a
            href={v.source_url}
            target="_blank"
            rel="noopener"
            className="inline-flex items-center gap-1 text-xs text-current hover:underline"
          >
            Voir source <ExternalLink size={12} />
          </a>
        )}
      </div>
      <div className="flex flex-wrap gap-1">
        {v.plateforme && <Badge>{v.plateforme}</Badge>}
        {v.format && <Badge variant="outline">{v.format}</Badge>}
        {v.vues_likes && <Badge variant="outline">{v.vues_likes}</Badge>}
        {v.tier_reproductibilite && (
          <Badge variant={TIER_VARIANTS[v.tier_reproductibilite] || 'default'}>
            Tier {v.tier_reproductibilite}
          </Badge>
        )}
      </div>
      <Block label="Pourquoi ça a percé">{v.pourquoi_a_perce}</Block>
      <Block label="Hook pour Wubo" tone="accent">
        {v.hook_pour_wubo}
      </Block>
    </div>
  );
}

function Block({
  label,
  children,
  tone,
}: {
  label: string;
  children?: React.ReactNode;
  tone?: 'accent';
}) {
  if (!children) return null;
  const cls = tone === 'accent' ? 'bg-accent-soft border-accent/30' : 'bg-surface-alt border-border';
  return (
    <div>
      <div className="text-[11px] font-semibold uppercase tracking-wide text-text-faint mb-1">
        {label}
      </div>
      <div className={`text-xs leading-relaxed p-2 rounded-sm border ${cls}`}>{children}</div>
    </div>
  );
}
