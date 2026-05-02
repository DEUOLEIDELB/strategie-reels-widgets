import { useEffect, useState } from 'react';
import { Wifi } from 'lucide-react';
import { Tooltip } from '@/shared/components';

interface Props {
  lastSyncedAt: number | null;
}

function formatAgo(ms: number): string {
  const sec = Math.round(ms / 1000);
  if (sec < 5) return "à l'instant";
  if (sec < 60) return `il y a ${sec}s`;
  const min = Math.round(sec / 60);
  return `il y a ${min}min`;
}

export function LiveSyncIndicator({ lastSyncedAt }: Props) {
  // Re-render chaque seconde pour mettre à jour le label
  const [, setTick] = useState(0);
  useEffect(() => {
    const id = window.setInterval(() => setTick((t) => t + 1), 1000);
    return () => window.clearInterval(id);
  }, []);

  const ago = lastSyncedAt ? formatAgo(Date.now() - lastSyncedAt) : '...';

  return (
    <Tooltip content="Sync auto toutes les 5s. Le canvas en cours d'édition reste local jusqu'à la sauvegarde. Les autres briques (avatars, angles, etc.) se rafraîchissent en continu.">
      <div className="inline-flex items-center gap-1 text-[10px] text-text-faint cursor-help">
        <Wifi size={10} className="text-success" />
        <span>Sync {ago}</span>
      </div>
    </Tooltip>
  );
}
