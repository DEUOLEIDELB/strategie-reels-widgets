import { useMemo, useState } from 'react';
import { ExternalLink, Users } from 'lucide-react';
import { useInfluenceurs } from '@/shared/hooks/grist';
import { Skeleton, EmptyState, Badge, Select, Drawer } from '@/shared/components';
import type { Influenceur } from '@/shared/lib/types';
import { RadarItemCard } from './RadarItemCard';

interface Props {
  onCapturer: (ctx: {
    titre: string;
    source_url?: string;
    categorie: 'audience';
    influenceur_lie?: number;
  }) => void;
}

const TIER_VARIANTS: Record<string, 'current' | 'info' | 'warning' | 'default'> = {
  '1': 'current',
  '2': 'info',
  '3': 'warning',
  '4': 'default',
};

function fmtFollowers(n: number): string {
  if (!n) return '—';
  if (n >= 1_000_000) return `${(n / 1_000_000).toFixed(1)}M`;
  if (n >= 1000) return `${(n / 1000).toFixed(1)}K`;
  return String(n);
}

export function RadarAudience({ onCapturer }: Props) {
  const q = useInfluenceurs();
  const [categorie, setCategorie] = useState<string>('');
  const [tier, setTier] = useState<string>('');
  const [statut, setStatut] = useState<string>('');
  const [openId, setOpenId] = useState<number | null>(null);

  const allCategories = useMemo(
    () => Array.from(new Set((q.data || []).map((i) => i.categorie).filter(Boolean))).sort(),
    [q.data],
  );
  const allStatuts = useMemo(
    () => Array.from(new Set((q.data || []).map((i) => i.statut_contact).filter(Boolean))).sort(),
    [q.data],
  );

  const filtered = useMemo(
    () =>
      (q.data || []).filter((i) => {
        if (categorie && i.categorie !== categorie) return false;
        if (tier && String(i.tier_contact) !== tier) return false;
        if (statut && i.statut_contact !== statut) return false;
        return true;
      }),
    [q.data, categorie, tier, statut],
  );

  const opened = (q.data || []).find((i) => i.id === openId) || null;

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
        icon={<Users size={28} />}
        title="Aucun influenceur"
        description="Ajoute des comptes via Grist (table Influenceurs)."
      />
    );
  }

  return (
    <>
      <div className="flex items-center gap-2 mb-3 flex-wrap">
        <Select size="sm" value={categorie} onChange={(e) => setCategorie(e.target.value)}>
          <option value="">Toutes catégories</option>
          {allCategories.map((c) => (
            <option key={c} value={c}>
              {c}
            </option>
          ))}
        </Select>
        <Select size="sm" value={tier} onChange={(e) => setTier(e.target.value)}>
          <option value="">Tous tiers</option>
          <option value="1">Tier 1</option>
          <option value="2">Tier 2</option>
          <option value="3">Tier 3</option>
          <option value="4">Tier 4</option>
        </Select>
        <Select size="sm" value={statut} onChange={(e) => setStatut(e.target.value)}>
          <option value="">Tous statuts</option>
          {allStatuts.map((s) => (
            <option key={s} value={s}>
              {s}
            </option>
          ))}
        </Select>
        {(categorie || tier || statut) && (
          <button
            onClick={() => {
              setCategorie('');
              setTier('');
              setStatut('');
            }}
            className="text-xs text-text-faint hover:text-text"
          >
            Reset
          </button>
        )}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-3">
        {filtered.map((i) => (
          <RadarItemCard
            key={i.id}
            title={i.username}
            subtitle={i.categorie}
            meta={
              <>
                <Badge variant="outline">
                  {fmtFollowers(i.followers_ig)} {i.followers_estime ? '~' : ''}
                </Badge>
                {i.tier_contact && (
                  <Badge variant={TIER_VARIANTS[String(i.tier_contact)] || 'default'}>
                    Tier {i.tier_contact}
                  </Badge>
                )}
                {i.statut_contact && <Badge>{i.statut_contact}</Badge>}
              </>
            }
            body={i.pourquoi?.slice(0, 120)}
            onClick={() => setOpenId(i.id)}
            onCapturer={() =>
              onCapturer({
                titre: i.username,
                source_url: i.url_instagram,
                categorie: 'audience',
                influenceur_lie: i.id,
              })
            }
          />
        ))}
      </div>

      <Drawer
        open={!!opened}
        onOpenChange={(o) => !o && setOpenId(null)}
        title={opened?.username}
        width={460}
      >
        {opened && <InfluenceurDetail i={opened} />}
      </Drawer>
    </>
  );
}

function InfluenceurDetail({ i }: { i: Influenceur }) {
  return (
    <div className="p-4 flex flex-col gap-4 text-sm">
      <div className="flex items-center justify-between">
        <div className="text-xs text-text-faint">{i.categorie}</div>
        {i.url_instagram && (
          <a
            href={i.url_instagram}
            target="_blank"
            rel="noopener"
            className="inline-flex items-center gap-1 text-xs text-current hover:underline"
          >
            Ouvrir IG <ExternalLink size={12} />
          </a>
        )}
      </div>

      <div className="grid grid-cols-2 gap-2 text-xs">
        <Field label="Followers" value={fmtFollowers(i.followers_ig)} />
        <Field label="Pertinence" value={`${i.pertinence_wubo}/5`} />
        <Field label="Tier contact" value={i.tier_contact ? String(i.tier_contact) : '—'} />
        <Field label="Statut" value={i.statut_contact} />
        <Field label="Pays" value={i.pays} />
        <Field label="Cercle" value={i.cercle_influence ? String(i.cercle_influence) : '—'} />
      </div>

      {i.description && <Block label="Description">{i.description}</Block>}
      {i.pourquoi && <Block label="Pourquoi pertinent">{i.pourquoi}</Block>}
      {i.action_prioritaire && <Block label="Action prioritaire">{i.action_prioritaire}</Block>}
      {i.notes && <Block label="Notes">{i.notes}</Block>}
    </div>
  );
}

function Field({ label, value }: { label: string; value?: string | number }) {
  return (
    <div>
      <div className="text-[10px] uppercase tracking-wide text-text-faint">{label}</div>
      <div className="font-medium">{value || '—'}</div>
    </div>
  );
}

function Block({ label, children }: { label: string; children?: React.ReactNode }) {
  if (!children) return null;
  return (
    <div>
      <div className="text-[11px] font-semibold uppercase tracking-wide text-text-faint mb-1">
        {label}
      </div>
      <div className="text-xs leading-relaxed p-2 rounded-sm border border-border bg-surface-alt">
        {children}
      </div>
    </div>
  );
}
