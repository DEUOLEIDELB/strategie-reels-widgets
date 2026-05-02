import { useMemo, useState } from 'react';
import { Search, Users, Compass, AlertTriangle, Film } from 'lucide-react';
import { Input, Tabs, TabsList, TabsTrigger, TabsContent, Skeleton, Badge } from '@/shared/components';
import { useAvatars, useAngles, usePainPoints, useReels } from '@/shared/hooks/grist';
import { cn } from '@/shared/lib/utils';
import type { AtelierNodeType } from '@/shared/lib/types';
import { countInstances } from '../lib/nodeFactory';
import { useAtelierView } from '../store';

interface BriqueItem {
  id: number;
  label: string;
  subtitle?: string;
}

interface BriqueRowProps {
  type: AtelierNodeType;
  item: BriqueItem;
  count: number;
}

function BriqueRow({ type, item, count }: BriqueRowProps) {
  const onDragStart = (event: React.DragEvent<HTMLDivElement>) => {
    event.dataTransfer.setData(
      'application/atelier-brique',
      JSON.stringify({ type, briqueId: item.id, label: item.label, subtitle: item.subtitle }),
    );
    event.dataTransfer.effectAllowed = 'copy';
  };

  return (
    <div
      draggable
      onDragStart={onDragStart}
      className={cn(
        'group cursor-grab active:cursor-grabbing rounded-md border border-border bg-surface px-2.5 py-2',
        'hover:border-border-strong hover:bg-surface-alt transition-colors',
      )}
      title={count > 0 ? `Posé ${count} fois — glisse pour ajouter une instance de plus` : 'Glisse vers le canvas'}
    >
      <div className="flex items-start gap-1.5">
        <div className="flex-1 min-w-0">
          <div className="text-[13px] font-medium text-text leading-snug line-clamp-1">{item.label}</div>
          {item.subtitle && (
            <div className="text-[11px] text-text-faint leading-snug line-clamp-1 mt-0.5">{item.subtitle}</div>
          )}
        </div>
        {count > 0 && (
          <Badge variant="current" size="xs" className="shrink-0">
            ×{count}
          </Badge>
        )}
      </div>
    </div>
  );
}

interface SectionProps {
  type: AtelierNodeType;
  items: BriqueItem[] | undefined;
  loading: boolean;
  search: string;
}

function BriqueSection({ type, items, loading, search }: SectionProps) {
  const nodes = useAtelierView((s) => s.nodes);

  const filtered = useMemo(() => {
    if (!items) return [];
    const q = search.trim().toLowerCase();
    if (!q) return items;
    return items.filter(
      (it) =>
        it.label.toLowerCase().includes(q) || (it.subtitle ?? '').toLowerCase().includes(q),
    );
  }, [items, search]);

  if (loading) {
    return (
      <div className="space-y-1.5">
        {Array.from({ length: 4 }).map((_, i) => (
          <Skeleton key={i} className="h-12 rounded-md" />
        ))}
      </div>
    );
  }

  if (filtered.length === 0) {
    return (
      <div className="py-6 text-center text-xs text-text-faint">
        {search ? 'Aucun résultat.' : 'Pool vide. Ajoute des briques côté Grist.'}
      </div>
    );
  }

  return (
    <div className="space-y-1.5">
      {filtered.map((item) => (
        <BriqueRow key={item.id} type={type} item={item} count={countInstances(nodes, type, item.id)} />
      ))}
    </div>
  );
}

export function BibliothequeSidebar() {
  const [tab, setTab] = useState<AtelierNodeType>('avatar');
  const [search, setSearch] = useState('');

  const avatars = useAvatars();
  const angles = useAngles();
  const pains = usePainPoints();
  const reels = useReels();

  const avatarItems: BriqueItem[] | undefined = useMemo(
    () =>
      avatars.data?.map((a) => ({
        id: a.id,
        label: a.prenom || `Avatar #${a.id}`,
        subtitle: [a.age_range, a.profession].filter(Boolean).join(' · '),
      })),
    [avatars.data],
  );

  const angleItems: BriqueItem[] | undefined = useMemo(
    () =>
      angles.data?.map((a) => ({
        id: a.id,
        label: a.nom || `Angle #${a.id}`,
        subtitle: a.ton,
      })),
    [angles.data],
  );

  const painItems: BriqueItem[] | undefined = useMemo(
    () =>
      pains.data?.map((p) => ({
        id: p.id,
        label: p.titre || `Pain #${p.id}`,
        subtitle: p.emotion_dominante,
      })),
    [pains.data],
  );

  const reelItems: BriqueItem[] | undefined = useMemo(
    () =>
      reels.data?.map((r) => ({
        id: r.id,
        label: r.titre || `Reel #${r.id}`,
        subtitle: r.hook_verbal,
      })),
    [reels.data],
  );

  return (
    <aside className="w-[300px] shrink-0 border-l border-border bg-surface flex flex-col h-full">
      <div className="px-3 py-2.5 border-b border-border">
        <div className="text-[11px] uppercase tracking-wide text-text-faint font-semibold mb-1.5">
          Bibliothèque
        </div>
        <div className="relative">
          <Search size={12} className="absolute left-2 top-1/2 -translate-y-1/2 text-text-muted" />
          <Input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Filtrer..."
            className="pl-7 h-8 text-xs"
          />
        </div>
      </div>

      <Tabs value={tab} onValueChange={(v) => setTab(v as AtelierNodeType)} className="flex-1 flex flex-col">
        <TabsList className="px-2 pt-2 grid grid-cols-4 gap-1">
          <TabsTrigger value="avatar" className="text-[11px] gap-1">
            <Users size={12} />
            <span className="hidden sm:inline">Avatars</span>
          </TabsTrigger>
          <TabsTrigger value="angle" className="text-[11px] gap-1">
            <Compass size={12} />
            <span className="hidden sm:inline">Angles</span>
          </TabsTrigger>
          <TabsTrigger value="pain" className="text-[11px] gap-1">
            <AlertTriangle size={12} />
            <span className="hidden sm:inline">Pains</span>
          </TabsTrigger>
          <TabsTrigger value="reel" className="text-[11px] gap-1">
            <Film size={12} />
            <span className="hidden sm:inline">Reels</span>
          </TabsTrigger>
        </TabsList>

        <div className="flex-1 overflow-y-auto px-2.5 py-2 scrollbar-thin">
          <TabsContent value="avatar">
            <BriqueSection type="avatar" items={avatarItems} loading={avatars.isLoading} search={search} />
          </TabsContent>
          <TabsContent value="angle">
            <BriqueSection type="angle" items={angleItems} loading={angles.isLoading} search={search} />
          </TabsContent>
          <TabsContent value="pain">
            <BriqueSection type="pain" items={painItems} loading={pains.isLoading} search={search} />
          </TabsContent>
          <TabsContent value="reel">
            <BriqueSection type="reel" items={reelItems} loading={reels.isLoading} search={search} />
          </TabsContent>
        </div>
      </Tabs>

      <div className="px-3 py-2 border-t border-border text-[10px] text-text-faint leading-relaxed">
        Glisse une brique vers le canvas. Cascade : avatar → angle → pain → reel.
      </div>
    </aside>
  );
}
