import { useEffect, useMemo, useState } from 'react';
import { Sparkles } from 'lucide-react';
import { ReactFlowProvider } from '@xyflow/react';
import { Button, EmptyState, Spinner } from '@/shared/components';
import { useAteliers } from '@/shared/hooks/grist';
import { useAppStore } from '@/shared/store';
import { AtelierHeader } from './components/AtelierHeader';
import { CanvasFlow } from './components/CanvasFlow';
import { BibliothequeSidebar } from './components/BibliothequeSidebar';
import { BriquePicker } from './components/BriquePicker';
import { BriqueDetailDrawer } from './components/BriqueDetailDrawer';
import { LiveSyncIndicator } from './components/LiveSyncIndicator';
import { ProjectionPanel } from './components/ProjectionPanel';
import { CreateAtelierModal } from './components/modals/CreateAtelierModal';
import { useLiveSync } from './hooks/useLiveSync';

export function AtelierShell() {
  return (
    <ReactFlowProvider>
      <AtelierShellInner />
    </ReactFlowProvider>
  );
}

function AtelierShellInner() {
  const ateliers = useAteliers();
  const currentAtelierId = useAppStore((s) => s.currentAtelierId);
  const setCurrentAtelier = useAppStore((s) => s.setCurrentAtelier);
  const [createOpen, setCreateOpen] = useState(false);
  const { lastSyncedAt } = useLiveSync();

  const list = ateliers.data ?? [];

  // Si l'atelier courant n'existe plus (suppression externe, fresh user), auto-bascule
  useEffect(() => {
    if (ateliers.isLoading) return;
    if (currentAtelierId === null) {
      if (list.length > 0) setCurrentAtelier(list[0].id);
      return;
    }
    const exists = list.some((a) => a.id === currentAtelierId);
    if (!exists && list.length > 0) {
      setCurrentAtelier(list[0].id);
    } else if (!exists && list.length === 0) {
      setCurrentAtelier(null);
    }
  }, [ateliers.isLoading, list, currentAtelierId, setCurrentAtelier]);

  const current = useMemo(
    () => list.find((a) => a.id === currentAtelierId) ?? null,
    [list, currentAtelierId],
  );

  if (ateliers.isLoading) {
    return (
      <div className="h-full flex items-center justify-center">
        <Spinner />
      </div>
    );
  }

  if (ateliers.isError) {
    return (
      <div className="h-full flex items-center justify-center">
        <EmptyState
          icon={<Sparkles size={32} />}
          title="Impossible de charger les ateliers"
          description={ateliers.error instanceof Error ? ateliers.error.message : 'Erreur réseau ou clé API.'}
        />
      </div>
    );
  }

  if (list.length === 0) {
    return (
      <div className="h-full flex flex-col">
        <AtelierHeader current={null} />
        <div className="flex-1 flex items-center justify-center">
          <div className="max-w-[420px] text-center">
            <EmptyState
              icon={<Sparkles size={32} />}
              title="Crée ton premier atelier"
              description="Un atelier = un test de composition. Tu poses un avatar, tu construis l'arbre angle → pain → reel, tu duplique pour tester des variantes."
            />
            <div className="mt-3 flex justify-center">
              <Button variant="primary" onClick={() => setCreateOpen(true)}>
                Créer un atelier
              </Button>
            </div>
          </div>
        </div>
        <CreateAtelierModal open={createOpen} onOpenChange={setCreateOpen} />
      </div>
    );
  }

  return (
    <div className="h-full flex flex-col">
      <AtelierHeader current={current} />
      <div className="flex-1 flex overflow-hidden">
        <main className="flex-1 relative bg-bg">
          {current ? (
            <CanvasFlow atelier={current} />
          ) : (
            <div className="h-full flex items-center justify-center">
              <EmptyState
                icon={<Sparkles size={32} />}
                title="Sélectionne un atelier"
                description="Choisis un atelier dans le menu en haut."
              />
            </div>
          )}
          <div className="absolute top-2 right-2 z-10 px-2 py-1 rounded-sm bg-surface/90 border border-border shadow-sm backdrop-blur-sm">
            <LiveSyncIndicator lastSyncedAt={lastSyncedAt} />
          </div>
        </main>
        <BibliothequeSidebar />
      </div>
      <ProjectionPanel />
      <BriquePicker />
      <BriqueDetailDrawer />
    </div>
  );
}
