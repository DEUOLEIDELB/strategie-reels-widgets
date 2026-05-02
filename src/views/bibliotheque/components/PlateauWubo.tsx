import { useMemo, useState } from 'react';
import { Search, Film, Calendar, Camera, X, Plus } from 'lucide-react';
import toast from 'react-hot-toast';
import { useBroll, useSessions } from '@/shared/hooks/grist';
import { useDebounce } from '@/shared/hooks/ui';
import {
  Input,
  Skeleton,
  EmptyState,
  Tabs,
  TabsList,
  TabsTrigger,
  TabsContent,
  Button,
  ConfirmDialog,
} from '@/shared/components';
import type { SessionTournage } from '@/shared/lib/types';
import { BrollCard } from './BrollCard';
import { SessionCard } from './SessionCard';
import { SetupCard } from './SetupCard';
import { BrollFormModal } from './BrollFormModal';
import { SessionFormModal } from './SessionFormModal';
import { SETUPS } from '../lib/setups';
import { useDeleteBroll, useDeleteSession } from '../lib/mutations';
import type { BrollWithVideo } from '../types';

type SubTab = 'brolls' | 'sessions' | 'setups';

export function PlateauWubo() {
  const [tab, setTab] = useState<SubTab>('brolls');
  const [search, setSearch] = useState('');
  const [orphelinsOnly, setOrphelinsOnly] = useState(false);
  const debounced = useDebounce(search, 200);

  const { data: brolls, isLoading: loadingBrolls } = useBroll();
  const { data: sessions, isLoading: loadingSessions } = useSessions();
  const brollsTyped = (brolls ?? []) as BrollWithVideo[];

  // Modal states
  const [brollModalOpen, setBrollModalOpen] = useState(false);
  const [editingBroll, setEditingBroll] = useState<BrollWithVideo | null>(null);
  const [sessionModalOpen, setSessionModalOpen] = useState(false);
  const [editingSession, setEditingSession] = useState<SessionTournage | null>(null);
  const [sessionPrefill, setSessionPrefill] = useState<{ type: string; equipement: string } | null>(null);

  const [confirmDeleteBroll, setConfirmDeleteBroll] = useState<BrollWithVideo | null>(null);
  const [confirmDeleteSession, setConfirmDeleteSession] = useState<SessionTournage | null>(null);

  const deleteBroll = useDeleteBroll();
  const deleteSession = useDeleteSession();

  const filteredBrolls = useMemo(() => {
    const q = debounced.trim().toLowerCase();
    return brollsTyped.filter((b) => {
      if (q && !`${b.code ?? ''} ${b.description_plan ?? ''} ${b.setup_technique ?? ''}`
        .toLowerCase().includes(q)) return false;
      if (orphelinsOnly && b.reels_qui_utilisent && b.reels_qui_utilisent.trim() !== '')
        return false;
      return true;
    });
  }, [brollsTyped, debounced, orphelinsOnly]);

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

  function handleNewBroll() {
    setEditingBroll(null);
    setBrollModalOpen(true);
  }
  function handleEditBroll(b: BrollWithVideo) {
    setEditingBroll(b);
    setBrollModalOpen(true);
  }
  function handleNewSession() {
    setEditingSession(null);
    setSessionPrefill(null);
    setSessionModalOpen(true);
  }
  function handleEditSession(s: SessionTournage) {
    setEditingSession(s);
    setSessionPrefill(null);
    setSessionModalOpen(true);
  }
  function handleLaunchFromSetup(setup: typeof SETUPS[number]) {
    setEditingSession(null);
    setSessionPrefill({
      type: setup.nom,
      equipement: setup.equipement.join(', '),
    });
    setSessionModalOpen(true);
    setTab('sessions');
  }

  async function doDeleteBroll() {
    if (!confirmDeleteBroll) return;
    try {
      await deleteBroll.mutateAsync(confirmDeleteBroll.id);
      toast.success('B-roll supprimé');
      setConfirmDeleteBroll(null);
    } catch (e) {
      toast.error(`Échec : ${(e as Error).message}`);
    }
  }
  async function doDeleteSession() {
    if (!confirmDeleteSession) return;
    try {
      await deleteSession.mutateAsync(confirmDeleteSession.id);
      toast.success('Session supprimée');
      setConfirmDeleteSession(null);
    } catch (e) {
      toast.error(`Échec : ${(e as Error).message}`);
    }
  }

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
            Orphelins uniquement
          </label>
        )}

        <div className="ml-auto">
          {tab === 'brolls' && (
            <Button variant="primary" size="sm" onClick={handleNewBroll}>
              <Plus size={12} className="mr-1" />
              Nouveau B-roll
            </Button>
          )}
          {tab === 'sessions' && (
            <Button variant="primary" size="sm" onClick={handleNewSession}>
              <Plus size={12} className="mr-1" />
              Nouvelle session
            </Button>
          )}
        </div>
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
                <Skeleton key={i} className="h-64" />
              ))}
            </Grid>
          ) : filteredBrolls.length === 0 ? (
            <EmptyBrolls
              hasSearch={Boolean(debounced || orphelinsOnly)}
              totalCount={brollsTyped.length}
              onCreate={handleNewBroll}
            />
          ) : (
            <Grid>
              {filteredBrolls.map((b) => (
                <BrollCard
                  key={b.id}
                  broll={b}
                  onEdit={() => handleEditBroll(b)}
                  onDelete={() => setConfirmDeleteBroll(b)}
                />
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
            <EmptySessions
              hasSearch={Boolean(debounced)}
              totalCount={sessions?.length ?? 0}
              onCreate={handleNewSession}
            />
          ) : (
            <Grid>
              {filteredSessions.map((s) => (
                <SessionCard
                  key={s.id}
                  session={s}
                  onEdit={() => handleEditSession(s)}
                  onDelete={() => setConfirmDeleteSession(s)}
                />
              ))}
            </Grid>
          )}
        </TabsContent>

        <TabsContent value="setups" className="pt-3">
          <Grid>
            {SETUPS.map((s) => (
              <SetupCard key={s.id} setup={s} onLaunchSession={() => handleLaunchFromSetup(s)} />
            ))}
          </Grid>
        </TabsContent>
      </Tabs>

      <BrollFormModal
        open={brollModalOpen}
        onOpenChange={setBrollModalOpen}
        initial={editingBroll}
      />
      <SessionFormModal
        open={sessionModalOpen}
        onOpenChange={setSessionModalOpen}
        initial={editingSession}
        prefill={sessionPrefill}
      />

      <ConfirmDialog
        open={Boolean(confirmDeleteBroll)}
        onOpenChange={(o) => !o && setConfirmDeleteBroll(null)}
        title="Supprimer ce B-roll ?"
        description={`"${confirmDeleteBroll?.description_plan?.slice(0, 80) ?? ''}". Cette action est irréversible.`}
        tone="danger"
        confirmLabel="Supprimer"
        onConfirm={doDeleteBroll}
      />
      <ConfirmDialog
        open={Boolean(confirmDeleteSession)}
        onOpenChange={(o) => !o && setConfirmDeleteSession(null)}
        title="Supprimer cette session ?"
        description={`"${confirmDeleteSession?.type ?? ''}". Cette action est irréversible.`}
        tone="danger"
        confirmLabel="Supprimer"
        onConfirm={doDeleteSession}
      />
    </div>
  );
}

function Grid({ children }: { children: React.ReactNode }) {
  return (
    <div className="grid gap-3 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3">{children}</div>
  );
}

function EmptyBrolls({
  hasSearch,
  totalCount,
  onCreate,
}: {
  hasSearch: boolean;
  totalCount: number;
  onCreate: () => void;
}) {
  if (totalCount === 0) {
    return (
      <EmptyState
        icon={<Film size={24} />}
        title="Aucun B-roll enregistré"
        description="Ajoute tes plans réutilisables : code, description, durée, statut, et une URL vidéo pour visualiser."
        action={
          <Button variant="primary" size="sm" onClick={onCreate}>
            <Plus size={12} className="mr-1" />
            Créer le premier B-roll
          </Button>
        }
      />
    );
  }
  return (
    <EmptyState
      title={hasSearch ? 'Aucun B-roll ne matche tes filtres.' : 'Aucun B-roll.'}
      description={hasSearch ? 'Essaie de retirer des filtres.' : 'Ajoute via le bouton ci-dessus.'}
    />
  );
}

function EmptySessions({
  hasSearch,
  totalCount,
  onCreate,
}: {
  hasSearch: boolean;
  totalCount: number;
  onCreate: () => void;
}) {
  if (totalCount === 0) {
    return (
      <EmptyState
        icon={<Calendar size={24} />}
        title="Aucune session de tournage planifiée"
        description="Planifie ton prochain batch : type, date, lieu, équipement, Reels alimentés."
        action={
          <Button variant="primary" size="sm" onClick={onCreate}>
            <Plus size={12} className="mr-1" />
            Créer la première session
          </Button>
        }
      />
    );
  }
  return (
    <EmptyState
      title={hasSearch ? 'Aucune session ne matche.' : 'Aucune session.'}
      description={hasSearch ? 'Essaie de retirer des filtres.' : 'Ajoute via le bouton ci-dessus.'}
    />
  );
}
