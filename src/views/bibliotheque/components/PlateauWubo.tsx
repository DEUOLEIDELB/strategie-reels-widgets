import { useMemo, useState } from 'react';
import { Search, Film, Calendar, Camera, X } from 'lucide-react';
import { useBroll, useSessions } from '@/shared/hooks/grist';
import { useDebounce } from '@/shared/hooks/ui';
import { Input, Skeleton, EmptyState, Tabs, TabsList, TabsTrigger, TabsContent } from '@/shared/components';
import { BrollCard } from './BrollCard';
import { SessionCard } from './SessionCard';
import { SetupCard } from './SetupCard';
import { SETUPS } from '../lib/setups';

type SubTab = 'brolls' | 'sessions' | 'setups';

export function PlateauWubo() {
  const [tab, setTab] = useState<SubTab>('brolls');
  const [search, setSearch] = useState('');
  const [orphelinsOnly, setOrphelinsOnly] = useState(false);
  const debounced = useDebounce(search, 200);

  const { data: brolls, isLoading: loadingBrolls } = useBroll();
  const { data: sessions, isLoading: loadingSessions } = useSessions();

  const filteredBrolls = useMemo(() => {
    if (!brolls) return [];
    const q = debounced.trim().toLowerCase();
    return brolls.filter((b) => {
      if (q && !`${b.code ?? ''} ${b.description_plan ?? ''} ${b.setup_technique ?? ''}`
        .toLowerCase().includes(q)) return false;
      if (orphelinsOnly && b.reels_qui_utilisent && b.reels_qui_utilisent.trim() !== '')
        return false;
      return true;
    });
  }, [brolls, debounced, orphelinsOnly]);

  const filteredSessions = useMemo(() => {
    if (!sessions) return [];
    const q = debounced.trim().toLowerCase();
    if (!q) return sessions;
    return sessions.filter((s) =>
      `${s.type ?? ''} ${s.lieu ?? ''} ${s.equipement ?? ''} ${s.personnes_requises ?? ''}`
        .toLowerCase()
        .includes(q),
    );
  }, [sessions, debounced]);

  const counts = {
    brolls: filteredBrolls.length,
    sessions: filteredSessions.length,
    setups: SETUPS.length,
  };

  return (
    <div className="flex flex-col gap-3">
      <div className="flex items-center gap-2 flex-wrap">
        <div className="relative flex-1 min-w-[240px] max-w-md">
          <Search size={13} className="absolute left-2.5 top-1/2 -translate-y-1/2 text-text-faint" />
          <Input
            size="sm"
            placeholder="Rechercher dans le Plateau..."
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
        {tab === 'brolls' && (
          <label className="inline-flex items-center gap-1 text-[11px] text-text-dim cursor-pointer">
            <input
              type="checkbox"
              checked={orphelinsOnly}
              onChange={(e) => setOrphelinsOnly(e.target.checked)}
              className="cursor-pointer"
            />
            Uniquement les orphelins (jamais réutilisés)
          </label>
        )}
      </div>

      <Tabs value={tab} onValueChange={(v) => setTab(v as SubTab)}>
        <TabsList>
          <TabsTrigger value="brolls" count={counts.brolls}>
            <Film size={12} strokeWidth={1.75} />
            B-rolls
          </TabsTrigger>
          <TabsTrigger value="sessions" count={counts.sessions}>
            <Calendar size={12} strokeWidth={1.75} />
            Sessions
          </TabsTrigger>
          <TabsTrigger value="setups" count={counts.setups}>
            <Camera size={12} strokeWidth={1.75} />
            Setups
          </TabsTrigger>
        </TabsList>

        <TabsContent value="brolls" className="pt-3">
          {loadingBrolls ? (
            <Grid>
              {Array.from({ length: 6 }).map((_, i) => (
                <Skeleton key={i} className="h-32" />
              ))}
            </Grid>
          ) : filteredBrolls.length === 0 ? (
            <EmptyBrolls hasSearch={Boolean(debounced || orphelinsOnly)} totalCount={brolls?.length ?? 0} />
          ) : (
            <Grid>
              {filteredBrolls.map((b) => (
                <BrollCard key={b.id} broll={b} />
              ))}
            </Grid>
          )}
        </TabsContent>

        <TabsContent value="sessions" className="pt-3">
          {loadingSessions ? (
            <Grid>
              {Array.from({ length: 4 }).map((_, i) => (
                <Skeleton key={i} className="h-32" />
              ))}
            </Grid>
          ) : filteredSessions.length === 0 ? (
            <EmptySessions hasSearch={Boolean(debounced)} totalCount={sessions?.length ?? 0} />
          ) : (
            <Grid>
              {filteredSessions.map((s) => (
                <SessionCard key={s.id} session={s} />
              ))}
            </Grid>
          )}
        </TabsContent>

        <TabsContent value="setups" className="pt-3">
          <Grid>
            {SETUPS.map((s) => (
              <SetupCard key={s.id} setup={s} />
            ))}
          </Grid>
        </TabsContent>
      </Tabs>
    </div>
  );
}

function Grid({ children }: { children: React.ReactNode }) {
  return (
    <div className="grid gap-3 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3">{children}</div>
  );
}

function EmptyBrolls({ hasSearch, totalCount }: { hasSearch: boolean; totalCount: number }) {
  if (totalCount === 0) {
    return (
      <EmptyState
        icon={<Film size={24} />}
        title="Aucun B-roll enregistré"
        description="Ajoute tes plans réutilisables dans la table Broll de Grist. Code, description, durée, statut."
      />
    );
  }
  return (
    <EmptyState
      title={hasSearch ? 'Aucun B-roll ne matche tes filtres.' : 'Aucun B-roll.'}
      description={hasSearch ? 'Essaie de retirer des filtres.' : 'Ajoute via Grist.'}
    />
  );
}

function EmptySessions({ hasSearch, totalCount }: { hasSearch: boolean; totalCount: number }) {
  if (totalCount === 0) {
    return (
      <EmptyState
        icon={<Calendar size={24} />}
        title="Aucune session de tournage planifiée"
        description="Planifie ton prochain batch dans la table Sessions_tournage : type, date, lieu, équipement, Reels alimentés."
      />
    );
  }
  return (
    <EmptyState
      title={hasSearch ? 'Aucune session ne matche.' : 'Aucune session.'}
      description={hasSearch ? 'Essaie de retirer des filtres.' : 'Planifie via Grist.'}
    />
  );
}
