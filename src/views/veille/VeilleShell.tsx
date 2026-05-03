import { useMemo, useState } from 'react';
import {
  usePostsConcurrents,
  useSyntheseEnCours,
} from '@/shared/hooks/grist';
import { CapturerSignalModal, type CaptureContext } from './components/CapturerSignalModal';
import { VeilleSidebar } from './components/VeilleSidebar';
import { useVeilleStore } from './store';
import { PulseConcurrents } from './blocs/PulseConcurrents';
import { PulseWubo } from './blocs/PulseWubo';
import { VaguesSons } from './blocs/VaguesSons';
import { HallOfFame } from './blocs/HallOfFame';
import { Reseau } from './blocs/Reseau';
import { SyntheseHebdo } from './blocs/SyntheseHebdo';

export function VeilleShell() {
  const bloc = useVeilleStore((s) => s.bloc);
  const postsQ = usePostsConcurrents();
  const syntheseQ = useSyntheseEnCours();

  const [captureOpen, setCaptureOpen] = useState(false);
  const [captureCtx, setCaptureCtx] = useState<CaptureContext | undefined>(undefined);

  // Compteurs dynamiques pour la sidebar
  const { pulseCount, pulseViraux } = useMemo(() => {
    const posts = postsQ.data || [];
    const last7 = posts.filter((p) => {
      if (!p.date_post) return false;
      const t = new Date(p.date_post).getTime();
      return !isNaN(t) && Date.now() - t <= 7 * 864e5;
    });
    return {
      pulseCount: last7.filter((p) => !p.captured_signal).length,
      pulseViraux: last7.filter((p) => p.score_viralite >= 2).length,
    };
  }, [postsQ.data]);

  const syntheseStatut = useMemo<'manquante' | 'vide' | 'partielle' | 'prete'>(() => {
    const s = syntheseQ.data;
    if (!s) return 'manquante';
    const actions = [s.actions_1, s.actions_2, s.actions_3].filter((a) => a?.trim()).length;
    if (actions === 3) return 'prete';
    if (actions > 0 || s.performance_top || s.trends_now) return 'partielle';
    return 'vide';
  }, [syntheseQ.data]);

  function openCapturer(ctx?: CaptureContext) {
    setCaptureCtx(ctx);
    setCaptureOpen(true);
  }

  return (
    <div className="h-full flex">
      <VeilleSidebar
        pulseCount={pulseCount}
        pulseViraux={pulseViraux}
        syntheseStatut={syntheseStatut}
      />

      <main className="flex-1 min-w-0 bg-bg">
        {bloc === 'pulse-concurrents' && <PulseConcurrents onCapturer={openCapturer} />}
        {bloc === 'pulse-wubo' && <PulseWubo />}
        {bloc === 'vagues-sons' && <VaguesSons />}
        {bloc === 'hall-of-fame' && <HallOfFame />}
        {bloc === 'reseau' && <Reseau />}
        {bloc === 'synthese-hebdo' && <SyntheseHebdo />}
      </main>

      <CapturerSignalModal
        open={captureOpen}
        onOpenChange={setCaptureOpen}
        initial={captureCtx}
      />
    </div>
  );
}
