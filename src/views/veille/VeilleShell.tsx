import { useState } from 'react';
import { usePostsConcurrents } from '@/shared/hooks/grist';
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

  const [captureOpen, setCaptureOpen] = useState(false);
  const [captureCtx, setCaptureCtx] = useState<CaptureContext | undefined>(undefined);

  // Compteur des posts non-capturés des 7 derniers jours pour la sidebar
  const pulseCount = (postsQ.data || []).filter((p) => {
    if (p.captured_signal) return false;
    if (!p.date_post) return false;
    const t = new Date(p.date_post).getTime();
    return !isNaN(t) && Date.now() - t <= 7 * 864e5;
  }).length;

  function openCapturer(ctx?: CaptureContext) {
    setCaptureCtx(ctx);
    setCaptureOpen(true);
  }

  return (
    <div className="h-full flex">
      <VeilleSidebar pulseCount={pulseCount} />

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
