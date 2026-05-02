import { useMemo, useState } from 'react';
import { Crosshair, ExternalLink } from 'lucide-react';
import { useConcurrents, useSignauxVeille } from '@/shared/hooks/grist';
import { Skeleton, EmptyState, Badge, Select, Drawer } from '@/shared/components';
import type { Concurrent } from '@/shared/lib/types';
import { RadarItemCard } from './RadarItemCard';

interface Props {
  onCapturer: (ctx: {
    titre: string;
    source_url?: string;
    categorie: 'concurrent';
    concurrent_lie?: number;
  }) => void;
}

export function RadarConcurrents({ onCapturer }: Props) {
  const q = useConcurrents();
  const signaux = useSignauxVeille({ categorie: 'concurrent' });
  const [pays, setPays] = useState<string>('');
  const [age, setAge] = useState<string>('');
  const [openId, setOpenId] = useState<number | null>(null);

  const allPays = useMemo(
    () => Array.from(new Set((q.data || []).map((c) => c.pays).filter(Boolean))).sort(),
    [q.data],
  );
  const allAges = useMemo(
    () => Array.from(new Set((q.data || []).map((c) => c.cible_age).filter(Boolean))).sort(),
    [q.data],
  );

  const filtered = useMemo(
    () =>
      (q.data || []).filter((c) => {
        if (pays && c.pays !== pays) return false;
        if (age && c.cible_age !== age) return false;
        return true;
      }),
    [q.data, pays, age],
  );

  const opened = (q.data || []).find((c) => c.id === openId) || null;
  const signauxOpened = (signaux.data || []).filter((s) => s.concurrent_lie === openId);

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
        icon={<Crosshair size={28} />}
        title="Aucun concurrent"
        description="Ajoute des concurrents via Grist (table Concurrents)."
      />
    );
  }

  return (
    <>
      <div className="flex items-center gap-2 mb-3">
        <Select size="sm" value={pays} onChange={(e) => setPays(e.target.value)}>
          <option value="">Tous pays</option>
          {allPays.map((p) => (
            <option key={p} value={p}>
              {p}
            </option>
          ))}
        </Select>
        <Select size="sm" value={age} onChange={(e) => setAge(e.target.value)}>
          <option value="">Tous âges cibles</option>
          {allAges.map((a) => (
            <option key={a} value={a}>
              {a}
            </option>
          ))}
        </Select>
        {(pays || age) && (
          <button
            onClick={() => {
              setPays('');
              setAge('');
            }}
            className="text-xs text-text-faint hover:text-text"
          >
            Reset
          </button>
        )}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-3">
        {filtered.map((c) => (
          <RadarItemCard
            key={c.id}
            title={c.nom}
            subtitle={c.username_ig}
            meta={
              <>
                <Badge variant="outline">
                  {(c.followers_ig || 0).toLocaleString('fr-FR')} IG
                </Badge>
                {c.followers_tiktok && (
                  <Badge variant="outline">
                    {(c.followers_tiktok || 0).toLocaleString('fr-FR')} TT
                  </Badge>
                )}
                {c.pays && <Badge>{c.pays}</Badge>}
              </>
            }
            body={c.positionnement?.slice(0, 140)}
            footer={
              <>
                <span>{c.cible_age}</span>
                <span>·</span>
                <span>{c.prix}</span>
              </>
            }
            onClick={() => setOpenId(c.id)}
            onCapturer={() =>
              onCapturer({ titre: c.nom, categorie: 'concurrent', concurrent_lie: c.id })
            }
          />
        ))}
      </div>

      <Drawer open={!!opened} onOpenChange={(o) => !o && setOpenId(null)} title={opened?.nom} width={460}>
        {opened && <ConcurrentDetail c={opened} signaux={signauxOpened} />}
      </Drawer>
    </>
  );
}

function ConcurrentDetail({
  c,
  signaux,
}: {
  c: Concurrent;
  signaux: ReturnType<typeof useSignauxVeille>['data'];
}) {
  const url = c.username_ig?.startsWith('@')
    ? `https://instagram.com/${c.username_ig.slice(1)}`
    : c.username_ig;
  return (
    <div className="p-4 flex flex-col gap-4 text-sm">
      <div className="flex items-center justify-between">
        <div className="text-xs text-text-faint">{c.username_ig}</div>
        {url && (
          <a
            href={url}
            target="_blank"
            rel="noopener"
            className="inline-flex items-center gap-1 text-xs text-current hover:underline"
          >
            Ouvrir IG <ExternalLink size={12} />
          </a>
        )}
      </div>

      <div className="grid grid-cols-2 gap-2 text-xs">
        <Field label="Followers IG" value={(c.followers_ig || 0).toLocaleString('fr-FR')} />
        <Field label="Followers TT" value={(c.followers_tiktok || 0).toLocaleString('fr-FR') || '—'} />
        <Field label="Cible âge" value={c.cible_age} />
        <Field label="Prix" value={c.prix} />
        <Field label="Pays" value={c.pays} />
      </div>

      <Block label="Positionnement">{c.positionnement}</Block>
      <Block label="Avatar cible">{c.avatar_cible}</Block>

      {c.ce_quon_emprunte && (
        <Block label="Ce qu'on emprunte" tone="success">
          {c.ce_quon_emprunte}
        </Block>
      )}
      {c.ce_quon_evite && (
        <Block label="Ce qu'on évite" tone="danger">
          {c.ce_quon_evite}
        </Block>
      )}

      {signaux && signaux.length > 0 && (
        <div>
          <div className="text-xs font-semibold mb-2">Signaux capturés ({signaux.length})</div>
          <div className="flex flex-col gap-1.5">
            {signaux.slice(0, 5).map((s) => (
              <div
                key={s.id}
                className="text-xs p-2 rounded-sm bg-surface-alt border border-border"
              >
                <div className="font-medium">{s.titre}</div>
                {s.signal && <div className="text-text-faint mt-0.5">{s.signal}</div>}
              </div>
            ))}
          </div>
        </div>
      )}
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

function Block({
  label,
  children,
  tone,
}: {
  label: string;
  children?: React.ReactNode;
  tone?: 'success' | 'danger';
}) {
  if (!children) return null;
  const cls =
    tone === 'success'
      ? 'bg-success-soft border-success/30'
      : tone === 'danger'
        ? 'bg-danger-soft border-danger/30'
        : 'bg-surface-alt border-border';
  return (
    <div>
      <div className="text-[11px] font-semibold uppercase tracking-wide text-text-faint mb-1">
        {label}
      </div>
      <div className={`text-xs leading-relaxed p-2 rounded-sm border ${cls}`}>{children}</div>
    </div>
  );
}
