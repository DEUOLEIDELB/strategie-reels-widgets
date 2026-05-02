import { useMemo, useState } from 'react';
import { Search, Globe, Download, Rocket, X } from 'lucide-react';
import { useRessources } from '@/shared/hooks/grist';
import { useDebounce } from '@/shared/hooks/ui';
import { Input, Skeleton, EmptyState, Tabs, TabsList, TabsTrigger, TabsContent } from '@/shared/components';
import { cn, uniqueBy } from '@/shared/lib/utils';
import { RessourceRow } from './RessourceRow';
import type { RessourceWithAction, RessourceDroits, StockSubTab } from '../types';

const DROITS_DEFAUT_VISIBLES: RessourceDroits[] = ['public_domain', 'cc', 'free', 'freemium'];
const DROITS_LABELS: Record<RessourceDroits, string> = {
  public_domain: 'public domain',
  cc: 'creative commons',
  free: 'free',
  freemium: 'freemium',
  payant: 'payant',
};

export function StockExterne() {
  const [tab, setTab] = useState<StockSubTab>('banques');
  const [search, setSearch] = useState('');
  const [droitsActifs, setDroitsActifs] = useState<RessourceDroits[]>(DROITS_DEFAUT_VISIBLES);
  const debounced = useDebounce(search, 200);

  const { data, isLoading } = useRessources();
  const ressources = (data ?? []) as RessourceWithAction[];

  const visibles = useMemo(
    () => ressources.filter((r) => !r.archive && r.type_action),
    [ressources],
  );

  const byTab = useMemo(() => {
    return {
      banques: visibles.filter((r) => r.type_action === 'banque'),
      assets: visibles.filter((r) => r.type_action === 'asset_direct'),
      outils: visibles.filter((r) => r.type_action === 'outil_logiciel'),
    };
  }, [visibles]);

  const filtered = useMemo(() => {
    const list = byTab[tab];
    const q = debounced.trim().toLowerCase();
    return list
      .filter((r) => !r.droits || droitsActifs.includes(r.droits as RessourceDroits))
      .filter((r) => {
        if (!q) return true;
        return `${r.nom ?? ''} ${r.usage_recommande ?? ''} ${r.categorie ?? ''}`
          .toLowerCase()
          .includes(q);
      })
      .sort((a, b) => (b.score_priorite ?? 0) - (a.score_priorite ?? 0));
  }, [byTab, tab, debounced, droitsActifs]);

  const counts = {
    banques: byTab.banques.filter((r) => !r.droits || droitsActifs.includes(r.droits as RessourceDroits)).length,
    assets: byTab.assets.filter((r) => !r.droits || droitsActifs.includes(r.droits as RessourceDroits)).length,
    outils: byTab.outils.filter((r) => !r.droits || droitsActifs.includes(r.droits as RessourceDroits)).length,
  };

  function toggleDroits(d: RessourceDroits) {
    setDroitsActifs((prev) =>
      prev.includes(d) ? prev.filter((x) => x !== d) : [...prev, d],
    );
  }

  const droitsAvailable = useMemo(
    () =>
      uniqueBy(visibles, (r) => r.droits)
        .map((r) => r.droits)
        .filter((d): d is RessourceDroits => Boolean(d)),
    [visibles],
  );

  return (
    <div className="flex flex-col gap-3">
      <div className="flex items-center gap-3 flex-wrap">
        <div className="relative flex-1 min-w-[240px] max-w-md">
          <Search size={13} className="absolute left-2.5 top-1/2 -translate-y-1/2 text-text-faint" />
          <Input
            size="sm"
            placeholder="Rechercher dans le Stock externe..."
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

        <div className="flex items-center gap-1 flex-wrap">
          <span className="text-[10px] uppercase tracking-wide text-text-dim mr-1">droits</span>
          {droitsAvailable.map((d) => {
            const active = droitsActifs.includes(d);
            return (
              <button
                key={d}
                type="button"
                onClick={() => toggleDroits(d)}
                className={cn(
                  'inline-flex items-center px-2 h-6 rounded-md border text-[11px] transition-colors',
                  active
                    ? 'bg-current text-on-current border-current'
                    : 'bg-surface text-text-dim border-border-strong hover:bg-surface-alt',
                )}
              >
                {DROITS_LABELS[d]}
              </button>
            );
          })}
        </div>
      </div>

      <Tabs value={tab} onValueChange={(v) => setTab(v as StockSubTab)}>
        <TabsList>
          <TabsTrigger value="banques" count={counts.banques}>
            <Globe size={12} strokeWidth={1.75} />
            Banques
          </TabsTrigger>
          <TabsTrigger value="assets" count={counts.assets}>
            <Download size={12} strokeWidth={1.75} />
            Assets directs
          </TabsTrigger>
          <TabsTrigger value="outils" count={counts.outils}>
            <Rocket size={12} strokeWidth={1.75} />
            Outils logiciels
          </TabsTrigger>
        </TabsList>

        <TabsContent value={tab} className="pt-3">
          {isLoading ? (
            <div className="flex flex-col gap-1">
              {Array.from({ length: 8 }).map((_, i) => (
                <Skeleton key={i} className="h-12" />
              ))}
            </div>
          ) : filtered.length === 0 ? (
            <EmptyState
              title="Aucune ressource ne matche."
              description="Ajuste les droits ou la recherche, ou ajoute via Grist."
            />
          ) : (
            <div className="flex flex-col gap-1">
              {filtered.map((r) => (
                <RessourceRow key={r.id} ressource={r} />
              ))}
            </div>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
}
