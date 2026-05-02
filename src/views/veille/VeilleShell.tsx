import { useEffect, useMemo, useState } from 'react';
import toast from 'react-hot-toast';
import { Telescope } from 'lucide-react';
import { EmptyState, Skeleton, ConfirmDialog } from '@/shared/components';
import {
  useSyntheseEnCours,
  useSynthesesHebdo,
  useCreateSynthese,
  useUpdateSynthese,
  useSignauxVeille,
  useUpdateSignalVeille,
} from '@/shared/hooks/grist';
import { currentSemaineIso, type SyntheseHebdo } from '@/shared/lib/types';
import { CapturerSignalModal, type CaptureContext } from './components/CapturerSignalModal';
import { SyntheseHebdo as SyntheseHebdoView } from './components/SyntheseHebdo';
import { VeilleHeader } from './components/VeilleHeader';
import { RadarTabs } from './components/radars/RadarTabs';

function nextSemaineIso(currentIso: string): string {
  // Format "YYYY-Www". On rajoute 7 jours à un Date issu d'un lundi de la semaine courante.
  const m = currentIso.match(/^(\d{4})-W(\d{2})$/);
  if (!m) return currentSemaineIso(new Date(Date.now() + 7 * 864e5));
  const [, yStr, wStr] = m;
  const year = Number(yStr);
  const week = Number(wStr);
  // ISO week 1 contient le 4 janvier
  const jan4 = new Date(Date.UTC(year, 0, 4));
  const jan4Day = jan4.getUTCDay() || 7;
  const week1Monday = new Date(jan4);
  week1Monday.setUTCDate(jan4.getUTCDate() - jan4Day + 1);
  const monday = new Date(week1Monday);
  monday.setUTCDate(week1Monday.getUTCDate() + (week - 1) * 7);
  const nextMonday = new Date(monday);
  nextMonday.setUTCDate(monday.getUTCDate() + 7);
  return currentSemaineIso(nextMonday);
}

export function VeilleShell() {
  const semaineIso = currentSemaineIso();
  const synthesesQ = useSynthesesHebdo();
  const enCoursQ = useSyntheseEnCours();
  const createSynth = useCreateSynthese();
  const updateSynth = useUpdateSynthese();
  const signauxQ = useSignauxVeille({ semaine: semaineIso });
  const updateSignal = useUpdateSignalVeille();

  const [captureOpen, setCaptureOpen] = useState(false);
  const [captureCtx, setCaptureCtx] = useState<CaptureContext | undefined>(undefined);
  const [archiverOpen, setArchiverOpen] = useState(false);
  const [autoCreated, setAutoCreated] = useState(false);

  // Auto-création de la synthèse de la semaine si absente
  useEffect(() => {
    if (synthesesQ.isLoading || autoCreated) return;
    if (enCoursQ.data) return;
    if (createSynth.isPending) return;
    setAutoCreated(true);
    createSynth.mutate(
      {
        semaine_iso: semaineIso,
        date_creation: new Date().toISOString().slice(0, 10),
        date_archivage: null,
        performance_top: '',
        performance_flop: '',
        performance_metrique_surveiller: '',
        concurrents_obs: '',
        trends_now: '',
        signaux_faibles: '',
        actions_1: '',
        actions_2: '',
        actions_3: '',
        notes_libres: '',
        statut: 'en_cours',
      },
      {
        onSuccess: () => toast.success(`Synthèse ${semaineIso} créée`, { duration: 1500 }),
        onError: () => {
          setAutoCreated(false);
          toast.error('Échec création synthèse');
        },
      },
    );
  }, [synthesesQ.isLoading, enCoursQ.data, autoCreated, createSynth, semaineIso]);

  const archiverDisabledReason = useMemo(() => {
    const s = enCoursQ.data;
    if (!s) return 'Aucune synthèse en cours';
    const filled = [s.actions_1, s.actions_2, s.actions_3].filter((a) => a?.trim()).length;
    if (filled === 0) return "Remplis au moins 1 action avant d'archiver";
    return undefined;
  }, [enCoursQ.data]);

  function openCapturer(ctx?: CaptureContext) {
    setCaptureCtx(ctx);
    setCaptureOpen(true);
  }

  async function handleArchiver() {
    const s = enCoursQ.data;
    if (!s) return;
    // 1. archive la synthèse courante
    await new Promise<void>((resolve, reject) => {
      updateSynth.mutate(
        {
          id: s.id,
          fields: {
            statut: 'archivée',
            date_archivage: new Date().toISOString().slice(0, 10),
          } as Partial<SyntheseHebdo>,
        },
        { onSuccess: () => resolve(), onError: (e) => reject(e) },
      );
    });
    // 2. archive tous les signaux intégré_synthèse de la semaine
    const signauxIntegres = (signauxQ.data || []).filter(
      (sig) => sig.statut === 'intégré_synthèse',
    );
    await Promise.all(
      signauxIntegres.map(
        (sig) =>
          new Promise<void>((resolve) => {
            updateSignal.mutate(
              { id: sig.id, fields: { statut: 'archivé' } },
              { onSettled: () => resolve() },
            );
          }),
      ),
    );
    // 3. crée la synthèse de la semaine prochaine
    const nextWeek = nextSemaineIso(semaineIso);
    await new Promise<void>((resolve, reject) => {
      createSynth.mutate(
        {
          semaine_iso: nextWeek,
          date_creation: new Date().toISOString().slice(0, 10),
          date_archivage: null,
          performance_top: '',
          performance_flop: '',
          performance_metrique_surveiller: '',
          concurrents_obs: '',
          trends_now: '',
          signaux_faibles: '',
          actions_1: '',
          actions_2: '',
          actions_3: '',
          notes_libres: '',
          statut: 'en_cours',
        },
        { onSuccess: () => resolve(), onError: (e) => reject(e) },
      );
    });
    toast.success(`Synthèse ${semaineIso} archivée. ${nextWeek} prête.`);
  }

  if (synthesesQ.isLoading) {
    return (
      <div className="h-full flex flex-col">
        <Skeleton className="h-12 w-full" />
        <div className="flex-1 grid grid-cols-12 gap-3 p-4">
          {Array.from({ length: 5 }).map((_, i) => (
            <Skeleton key={i} className="h-32 col-span-6" />
          ))}
        </div>
      </div>
    );
  }

  if (synthesesQ.isError) {
    return (
      <EmptyState
        icon={<Telescope size={32} />}
        title="Erreur de chargement"
        description={(synthesesQ.error as Error)?.message || 'Vérifie ta clé API Grist.'}
      />
    );
  }

  const synthese = enCoursQ.data;

  return (
    <div className="h-full flex flex-col">
      <VeilleHeader
        semaineIso={semaineIso}
        onCapturer={() => openCapturer()}
        onArchiver={() => setArchiverOpen(true)}
        archiverDisabled={!!archiverDisabledReason}
        archiverDisabledReason={archiverDisabledReason}
      />

      <div className="flex-1 overflow-y-auto scrollbar-thin">
        {synthese ? (
          <SyntheseHebdoView synthese={synthese} />
        ) : (
          <div className="p-8">
            <EmptyState
              icon={<Telescope size={28} />}
              title="Création de la synthèse en cours…"
              description="Patiente une seconde."
            />
          </div>
        )}

        <div className="border-t border-border bg-surface-alt/40 min-h-[60vh] flex flex-col">
          <RadarTabs onCapturer={(ctx) => openCapturer(ctx)} />
        </div>
      </div>

      <CapturerSignalModal
        open={captureOpen}
        onOpenChange={setCaptureOpen}
        initial={captureCtx}
      />

      <ConfirmDialog
        open={archiverOpen}
        onOpenChange={setArchiverOpen}
        title={`Archiver la synthèse ${semaineIso} ?`}
        description="Une nouvelle synthèse vide sera créée pour la semaine prochaine. Cette action est définitive côté UI."
        confirmLabel="Archiver"
        onConfirm={handleArchiver}
      />
    </div>
  );
}
