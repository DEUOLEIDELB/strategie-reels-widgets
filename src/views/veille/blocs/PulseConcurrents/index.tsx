import { useMemo, useState } from 'react';
import { Plus, Flame, Filter } from 'lucide-react';
import {
  usePostsConcurrents,
  useConcurrents,
} from '@/shared/hooks/grist';
import {
  Button,
  Skeleton,
  EmptyState,
  Select,
} from '@/shared/components';
import type {
  PostConcurrent,
  PostFormat,
  PostPlateforme,
  Concurrent,
} from '@/shared/lib/types';
import { POST_FORMATS, POST_FORMAT_LABELS } from '@/shared/lib/types';
import { ConcurrentPostCard } from './ConcurrentPostCard';
import { ConcurrentPostDrawer } from './ConcurrentPostDrawer';
import { AjouterPostModal } from './AjouterPostModal';
import { InsightsBar } from './InsightsBar';
import { withComputedScores } from './lib/viralScore';

interface Props {
  onCapturer: (ctx: {
    titre: string;
    source_url?: string;
    categorie: 'concurrent';
    concurrent_lie?: number;
  }) => void;
}

export function PulseConcurrents({ onCapturer }: Props) {
  const postsQ = usePostsConcurrents();
  const concurrentsQ = useConcurrents();

  const [filterConcurrent, setFilterConcurrent] = useState<number | ''>('');
  const [filterPlateforme, setFilterPlateforme] = useState<PostPlateforme | ''>('');
  const [filterFormat, setFilterFormat] = useState<PostFormat | ''>('');
  const [filterFenetre, setFilterFenetre] = useState<'7' | '30' | '90' | 'all'>('30');
  const [filterTop, setFilterTop] = useState<'all' | 'viral'>('all');

  const [openId, setOpenId] = useState<number | null>(null);
  const [ajouterOpen, setAjouterOpen] = useState(false);

  const concurrentsById = useMemo(() => {
    const m = new Map<number, Concurrent>();
    (concurrentsQ.data || []).forEach((c) => m.set(c.id, c));
    return m;
  }, [concurrentsQ.data]);

  // Recalcule les scores de viralité en mémoire à chaque update du feed
  const postsWithScores = useMemo(
    () => withComputedScores(postsQ.data || []),
    [postsQ.data],
  );

  const filtered = useMemo(() => {
    let out: PostConcurrent[] = postsWithScores;
    if (filterConcurrent !== '') {
      out = out.filter((p) => p.concurrent === filterConcurrent);
    }
    if (filterPlateforme) {
      out = out.filter((p) => p.plateforme === filterPlateforme);
    }
    if (filterFormat) {
      out = out.filter((p) => p.format_detecte === filterFormat);
    }
    if (filterFenetre !== 'all') {
      const days = Number(filterFenetre);
      const cutoff = Date.now() - days * 864e5;
      out = out.filter((p) => {
        if (!p.date_post) return false;
        const t = new Date(p.date_post).getTime();
        return !isNaN(t) && t >= cutoff;
      });
    }
    if (filterTop === 'viral') {
      out = out.filter((p) => p.score_viralite >= 2);
    }
    // Sort by date desc
    out = [...out].sort((a, b) => {
      const da = new Date(a.date_post || 0).getTime();
      const db = new Date(b.date_post || 0).getTime();
      return db - da;
    });
    return out;
  }, [postsWithScores, filterConcurrent, filterPlateforme, filterFormat, filterFenetre, filterTop]);

  const opened = postsWithScores.find((p) => p.id === openId) || null;

  const filterActive =
    !!filterConcurrent || !!filterPlateforme || !!filterFormat || filterFenetre !== '30' || filterTop !== 'all';

  function resetFilters() {
    setFilterConcurrent('');
    setFilterPlateforme('');
    setFilterFormat('');
    setFilterFenetre('30');
    setFilterTop('all');
  }

  const isLoading = postsQ.isLoading || concurrentsQ.isLoading;

  return (
    <div className="h-full flex flex-col">
      {/* Header */}
      <div className="px-5 py-3 border-b border-border bg-surface flex items-center justify-between gap-3 shrink-0">
        <div>
          <h2 className="text-base font-semibold flex items-center gap-2">
            <Flame size={16} className="text-accent" />
            Pulse Concurrents
          </h2>
          <p className="text-[11px] text-text-faint mt-0.5">
            {postsQ.data?.length || 0} post{(postsQ.data?.length || 0) > 1 ? 's' : ''} dans le feed,
            {' '}
            {filtered.length} affiché{filtered.length > 1 ? 's' : ''}
          </p>
        </div>
        <Button variant="primary" size="sm" onClick={() => setAjouterOpen(true)}>
          <Plus size={12} className="mr-1.5" />
          Ajouter un post
        </Button>
      </div>

      {/* Insights bar */}
      <InsightsBar posts={postsWithScores} concurrents={concurrentsById} />

      {/* Filter bar */}
      <div className="px-5 py-2 border-b border-border bg-surface-two flex items-center gap-2 flex-wrap shrink-0">
        <Filter size={12} className="text-text-faint" />
        <Select
          size="sm"
          value={filterConcurrent === '' ? '' : String(filterConcurrent)}
          onChange={(e) => setFilterConcurrent(e.target.value ? Number(e.target.value) : '')}
        >
          <option value="">Tous concurrents</option>
          {(concurrentsQ.data || []).map((c) => (
            <option key={c.id} value={c.id}>
              {c.nom}
            </option>
          ))}
        </Select>
        <Select
          size="sm"
          value={filterPlateforme}
          onChange={(e) => setFilterPlateforme(e.target.value as PostPlateforme | '')}
        >
          <option value="">Toutes plateformes</option>
          <option value="instagram">Instagram</option>
          <option value="tiktok">TikTok</option>
          <option value="youtube">YouTube</option>
        </Select>
        <Select
          size="sm"
          value={filterFenetre}
          onChange={(e) => setFilterFenetre(e.target.value as typeof filterFenetre)}
        >
          <option value="7">7 derniers jours</option>
          <option value="30">30 derniers jours</option>
          <option value="90">90 derniers jours</option>
          <option value="all">Tout</option>
        </Select>
        <Select
          size="sm"
          value={filterFormat}
          onChange={(e) => setFilterFormat(e.target.value as PostFormat | '')}
        >
          <option value="">Tous formats</option>
          {POST_FORMATS.map((f) => (
            <option key={f} value={f}>
              {POST_FORMAT_LABELS[f]}
            </option>
          ))}
        </Select>
        <Select
          size="sm"
          value={filterTop}
          onChange={(e) => setFilterTop(e.target.value as typeof filterTop)}
        >
          <option value="all">Tout</option>
          <option value="viral">Viraux uniquement</option>
        </Select>
        {filterActive && (
          <button
            onClick={resetFilters}
            className="text-xs text-text-faint hover:text-text"
          >
            Reset
          </button>
        )}
      </div>

      {/* Feed */}
      <div className="flex-1 overflow-y-auto scrollbar-thin p-5">
        {isLoading ? (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-3">
            {Array.from({ length: 10 }).map((_, i) => (
              <Skeleton key={i} className="aspect-[9/16]" />
            ))}
          </div>
        ) : !postsQ.data?.length ? (
          <EmptyState
            icon={<Flame size={32} />}
            title="Aucun post dans le feed"
            description="Ajoute un post concurrent en collant l'URL d'un Reel Instagram, TikTok ou YouTube."
            action={
              <Button variant="primary" size="sm" onClick={() => setAjouterOpen(true)}>
                <Plus size={12} className="mr-1.5" />
                Ajouter mon premier post
              </Button>
            }
          />
        ) : !filtered.length ? (
          <EmptyState
            icon={<Filter size={28} />}
            title="Aucun post ne matche tes filtres"
            description="Reset les filtres ou élargis la fenêtre temporelle."
            action={
              <Button variant="ghost" size="sm" onClick={resetFilters}>
                Reset les filtres
              </Button>
            }
          />
        ) : (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-3">
            {filtered.map((post) => (
              <ConcurrentPostCard
                key={post.id}
                post={post}
                concurrent={concurrentsById.get(post.concurrent || -1)}
                onClick={() => setOpenId(post.id)}
                onCapturer={() => {
                  const c = concurrentsById.get(post.concurrent || -1);
                  onCapturer({
                    titre: c ? `${c.nom} : ${post.vues || 0} vues` : `Post #${post.id}`,
                    source_url: post.url_post,
                    categorie: 'concurrent',
                    concurrent_lie: post.concurrent,
                  });
                }}
              />
            ))}
          </div>
        )}
      </div>

      <ConcurrentPostDrawer
        post={opened}
        concurrent={opened ? concurrentsById.get(opened.concurrent || -1) : undefined}
        open={!!opened}
        onOpenChange={(o) => !o && setOpenId(null)}
        onCapturer={(p) => {
          const c = concurrentsById.get(p.concurrent || -1);
          onCapturer({
            titre: c ? `${c.nom} : ${p.vues || 0} vues` : `Post #${p.id}`,
            source_url: p.url_post,
            categorie: 'concurrent',
            concurrent_lie: p.concurrent,
          });
        }}
      />

      <AjouterPostModal open={ajouterOpen} onOpenChange={setAjouterOpen} />
    </div>
  );
}
