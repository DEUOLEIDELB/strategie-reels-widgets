import { useMemo, useState } from 'react';
import { Search, Plus, X, Sparkles } from 'lucide-react';
import toast from 'react-hot-toast';
import { useDebounce } from '@/shared/hooks/ui';
import {
  Input,
  Skeleton,
  EmptyState,
  Button,
  ConfirmDialog,
} from '@/shared/components';
import { cn } from '@/shared/lib/utils';
import { useReelsReferences, type ReelReference } from '../lib/queries';
import { useDeleteReelReference } from '../lib/mutations';
import { decodePatterns, PATTERN_KEYS, PATTERN_LABELS, type PatternKey } from '../lib/patternsLabels';
import { ReelReferenceCard } from './ReelReferenceCard';
import { ReelReferenceFormModal } from './ReelReferenceFormModal';

// Section "Mes Reels références" : le coeur de la veille active.
// Tu colles des URLs de Reels qui t'inspirent, tu tagges les patterns,
// tu filtres par pattern quand tu prépares un nouveau Reel dans l'Atelier.
export function ReferencesReels() {
  const { data, isLoading } = useReelsReferences();
  const reels = data ?? [];

  const [search, setSearch] = useState('');
  const [activePatterns, setActivePatterns] = useState<PatternKey[]>([]);
  const [activePlateforme, setActivePlateforme] = useState<string>('');
  const debounced = useDebounce(search, 200);

  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState<ReelReference | null>(null);
  const [confirmDelete, setConfirmDelete] = useState<ReelReference | null>(null);

  const deleteRef = useDeleteReelReference();

  const filtered = useMemo(() => {
    const q = debounced.trim().toLowerCase();
    return reels.filter((r) => {
      if (q) {
        const text = `${r.createur ?? ''} ${r.hook_observe ?? ''} ${r.take_away_wubo ?? ''} ${r.transcript ?? ''}`;
        if (!text.toLowerCase().includes(q)) return false;
      }
      if (activePlateforme && r.plateforme !== activePlateforme) return false;
      if (activePatterns.length > 0) {
        const rp = decodePatterns(r.patterns);
        if (!activePatterns.every((p) => rp.includes(p))) return false;
      }
      return true;
    });
  }, [reels, debounced, activePatterns, activePlateforme]);

  function togglePattern(p: PatternKey) {
    setActivePatterns((prev) => (prev.includes(p) ? prev.filter((x) => x !== p) : [...prev, p]));
  }

  function resetFilters() {
    setSearch('');
    setActivePatterns([]);
    setActivePlateforme('');
  }

  function handleNew() {
    setEditing(null);
    setModalOpen(true);
  }
  function handleEdit(r: ReelReference) {
    setEditing(r);
    setModalOpen(true);
  }
  async function doDelete() {
    if (!confirmDelete) return;
    try {
      await deleteRef.mutateAsync(confirmDelete.id);
      toast.success('Reel référence supprimé');
      setConfirmDelete(null);
    } catch (e) {
      toast.error(`Échec : ${(e as Error).message}`);
    }
  }

  const filterActive =
    Boolean(debounced) || activePatterns.length > 0 || Boolean(activePlateforme);

  return (
    <div className="flex flex-col gap-3">
      <div className="flex items-center gap-3 flex-wrap">
        <div className="relative flex-1 min-w-[240px] max-w-md">
          <Search size={13} className="absolute left-2.5 top-1/2 -translate-y-1/2 text-text-faint" />
          <Input
            size="sm"
            placeholder="Rechercher dans hook, take-away, transcript..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-7"
          />
          {search && (
            <button
              type="button"
              onClick={() => setSearch('')}
              className="absolute right-2 top-1/2 -translate-y-1/2 text-text-faint hover:text-text"
              aria-label="Effacer"
            >
              <X size={12} />
            </button>
          )}
        </div>

        <div className="flex items-center gap-1">
          {(['', 'instagram', 'tiktok', 'youtube_shorts'] as const).map((p) => {
            const labels: Record<string, string> = {
              '': 'Toutes',
              instagram: 'IG',
              tiktok: 'TikTok',
              youtube_shorts: 'YT',
            };
            return (
              <button
                key={p || 'all'}
                type="button"
                onClick={() => setActivePlateforme(p)}
                className={cn(
                  'inline-flex items-center px-2 h-7 rounded-md border text-[11px] transition-colors',
                  activePlateforme === p
                    ? 'bg-current text-on-current border-current'
                    : 'bg-surface text-text-dim border-border-strong hover:bg-surface-alt',
                )}
              >
                {labels[p]}
              </button>
            );
          })}
        </div>

        <div className="ml-auto">
          <Button variant="primary" size="sm" onClick={handleNew}>
            <Plus size={12} className="mr-1" />
            Ajouter un Reel
          </Button>
        </div>
      </div>

      <div className="flex items-center gap-1 flex-wrap">
        <span className="text-[10px] uppercase tracking-wide text-text-dim mr-1">Patterns</span>
        {PATTERN_KEYS.map((p) => {
          const meta = PATTERN_LABELS[p];
          const active = activePatterns.includes(p);
          return (
            <button
              key={p}
              type="button"
              onClick={() => togglePattern(p)}
              className={cn(
                'inline-flex items-center px-2 h-6 rounded-md border text-[11px] transition-colors',
                active
                  ? 'bg-current text-on-current border-current'
                  : 'bg-surface text-text-dim border-border-strong hover:bg-surface-alt',
              )}
              title={`Filtrer : ${meta.label}`}
            >
              {meta.label}
            </button>
          );
        })}
        {filterActive && (
          <Button variant="ghost" size="sm" onClick={resetFilters} className="ml-2">
            <X size={11} className="mr-1" />
            Reset
          </Button>
        )}
      </div>

      {isLoading ? (
        <div className="grid gap-3 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3">
          {Array.from({ length: 6 }).map((_, i) => (
            <Skeleton key={i} className="h-72" />
          ))}
        </div>
      ) : filtered.length === 0 && reels.length === 0 ? (
        <EmptyState
          icon={<Sparkles size={24} />}
          title="Bibliothèque de Reels références vide"
          description="Colle l'URL d'un Reel qui t'inspire (Instagram, TikTok, YouTube Shorts), tagge les patterns visuels que tu y vois, note ce que tu peux voler. Quand tu prépareras un nouveau Reel, tu reviendras filtrer ici par pattern pour piocher l'inspiration."
          action={
            <Button variant="primary" size="sm" onClick={handleNew}>
              <Plus size={12} className="mr-1" />
              Ajouter mon premier Reel
            </Button>
          }
        />
      ) : filtered.length === 0 ? (
        <EmptyState
          title="Aucun Reel ne matche tes filtres."
          description="Essaie de retirer un pattern ou la recherche."
          action={
            <Button variant="primary" size="sm" onClick={resetFilters}>
              Reset filtres
            </Button>
          }
        />
      ) : (
        <div className="grid gap-3 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3">
          {filtered.map((r) => (
            <ReelReferenceCard
              key={r.id}
              reel={r}
              onEdit={() => handleEdit(r)}
              onDelete={() => setConfirmDelete(r)}
            />
          ))}
        </div>
      )}

      <ReelReferenceFormModal open={modalOpen} onOpenChange={setModalOpen} initial={editing} />
      <ConfirmDialog
        open={Boolean(confirmDelete)}
        onOpenChange={(o) => !o && setConfirmDelete(null)}
        title="Supprimer cette référence ?"
        description={`@${confirmDelete?.createur ?? ''}. Cette action est irréversible.`}
        tone="danger"
        confirmLabel="Supprimer"
        onConfirm={doDelete}
      />
    </div>
  );
}
