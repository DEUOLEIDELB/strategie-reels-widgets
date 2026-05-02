import { useEffect, useMemo, useState } from 'react';
import { Search } from 'lucide-react';
import { Modal, ModalBody, Input, Skeleton, Badge } from '@/shared/components';
import { useAvatars, useAngles, usePainPoints, useReels } from '@/shared/hooks/grist';
import type { AtelierNodeType } from '@/shared/lib/types';
import { useAtelierView } from '../store';
import { nodeStyleOf } from '../lib/nodeStyle';
import { countInstances } from '../lib/nodeFactory';
import { cn } from '@/shared/lib/utils';

const LABELS: Record<AtelierNodeType, string> = {
  avatar: 'avatar',
  angle: 'angle',
  pain: 'pain',
  reel: 'reel',
};

interface PickerItem {
  id: number;
  label: string;
  subtitle?: string;
}

function usePickerItems(type: AtelierNodeType): { items: PickerItem[]; loading: boolean } {
  const avatars = useAvatars();
  const angles = useAngles();
  const pains = usePainPoints();
  const reels = useReels();

  const items: PickerItem[] = useMemo(() => {
    if (type === 'avatar') {
      return (avatars.data ?? []).map((a) => ({
        id: a.id,
        label: a.prenom || `Avatar #${a.id}`,
        subtitle: [a.age_range, a.profession].filter(Boolean).join(' · '),
      }));
    }
    if (type === 'angle') {
      return (angles.data ?? []).map((a) => ({
        id: a.id,
        label: a.nom || `Angle #${a.id}`,
        subtitle: a.ton,
      }));
    }
    if (type === 'pain') {
      return (pains.data ?? []).map((p) => ({
        id: p.id,
        label: p.titre || `Pain #${p.id}`,
        subtitle: p.emotion_dominante,
      }));
    }
    return (reels.data ?? []).map((r) => ({
      id: r.id,
      label: r.titre || `Reel #${r.id}`,
      subtitle: r.hook_verbal,
    }));
  }, [type, avatars.data, angles.data, pains.data, reels.data]);

  const loading =
    type === 'avatar' ? avatars.isLoading
    : type === 'angle' ? angles.isLoading
    : type === 'pain' ? pains.isLoading
    : reels.isLoading;

  return { items, loading };
}

export function BriquePicker() {
  const pending = useAtelierView((s) => s.pendingAddChild);
  const clearPending = useAtelierView((s) => s.clearPendingAddChild);
  const addBrique = useAtelierView((s) => s.addBrique);

  const [search, setSearch] = useState('');
  useEffect(() => {
    setSearch('');
  }, [pending?.parentNodeId, pending?.childType]);

  if (!pending) return null;

  return (
    <BriquePickerInner
      pending={pending}
      onClose={clearPending}
      addBrique={addBrique}
      search={search}
      setSearch={setSearch}
    />
  );
}

interface InnerProps {
  pending: { parentNodeId: string; childType: AtelierNodeType };
  onClose: () => void;
  addBrique: ReturnType<typeof useAtelierView.getState>['addBrique'];
  search: string;
  setSearch: (s: string) => void;
}

function BriquePickerInner({ pending, onClose, addBrique, search, setSearch }: InnerProps) {
  const { childType, parentNodeId } = pending;
  const { items, loading } = usePickerItems(childType);
  const style = nodeStyleOf(childType);
  const nodes = useAtelierView((s) => s.nodes);

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    if (!q) return items;
    return items.filter(
      (it) => it.label.toLowerCase().includes(q) || (it.subtitle ?? '').toLowerCase().includes(q),
    );
  }, [items, search]);

  const handlePick = (item: PickerItem) => {
    addBrique(childType, item.id, item.label, item.subtitle, { parentNodeId });
    onClose();
  };

  return (
    <Modal open onOpenChange={(o) => !o && onClose()} title={`Choisir un ${LABELS[childType]}`}>
      <ModalBody>
        <div className="space-y-3">
          <div className="relative">
            <Search size={12} className="absolute left-2 top-1/2 -translate-y-1/2 text-text-muted" />
            <Input
              autoFocus
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder={`Filtrer les ${LABELS[childType]}s...`}
              className="pl-7 h-8 text-xs"
            />
          </div>

          <div className="max-h-[360px] overflow-y-auto scrollbar-thin -mx-1 px-1">
            {loading ? (
              <div className="space-y-1.5">
                {Array.from({ length: 5 }).map((_, i) => (
                  <Skeleton key={i} className="h-12 rounded-md" />
                ))}
              </div>
            ) : filtered.length === 0 ? (
              <div className="py-8 text-center text-xs text-text-faint">
                {search
                  ? 'Aucun résultat. Crée la brique côté Grist puis reviens.'
                  : `Pool vide pour "${LABELS[childType]}". Ajoute des briques côté Grist.`}
              </div>
            ) : (
              <div className="space-y-1.5">
                {filtered.map((item) => {
                  const count = countInstances(nodes, childType, item.id);
                  return (
                    <button
                      key={item.id}
                      type="button"
                      onClick={() => handlePick(item)}
                      className={cn(
                        'w-full text-left rounded-md border border-border bg-surface px-2.5 py-2',
                        'hover:bg-surface-alt hover:border-border-strong transition-colors',
                      )}
                    >
                      <div className="flex items-center gap-2 mb-0.5">
                        <span
                          className={cn(
                            'inline-flex items-center px-1.5 h-[16px] rounded-sm text-[9px] font-semibold uppercase',
                            style.badgeBg,
                            style.badgeText,
                          )}
                        >
                          {style.badgeLabel}
                        </span>
                        <span className="text-[13px] font-medium text-text leading-snug line-clamp-1 flex-1">
                          {item.label}
                        </span>
                        {count > 0 && (
                          <Badge variant="default" size="xs">
                            ×{count} posé
                          </Badge>
                        )}
                      </div>
                      {item.subtitle && (
                        <div className="text-[11px] text-text-faint leading-snug line-clamp-1 pl-1">
                          {item.subtitle}
                        </div>
                      )}
                    </button>
                  );
                })}
              </div>
            )}
          </div>
        </div>
      </ModalBody>
    </Modal>
  );
}
