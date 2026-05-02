import { useEffect, useRef, useState } from 'react';
import { useQueryClient } from '@tanstack/react-query';

const POLL_INTERVAL_MS = 1500;
const QUERY_KEYS = [
  ['ateliers'],
  ['avatars'],
  ['angles'],
  ['painPoints'],
  ['reels'],
] as const;

/**
 * Polling périodique pour récupérer les modifs des autres utilisateurs.
 *
 * Latence perçue :
 * - Polling 1.5s par défaut → max ~1.5s de latence
 * - Refetch instantané au retour de focus de la fenêtre (tab switch / minimize)
 * - Si en iframe Grist : push instantané via window.grist.onRecords
 *
 * Stratégie de conflit canvas (gérée dans CanvasFlow) :
 * - Tant que tu es en train d'éditer (canvas local diffère du dernier save), on n'écrase pas
 * - Sinon, reload silencieux du canvas dès qu'un autre user a sauvé
 */
export function useLiveSync(): { lastSyncedAt: number | null } {
  const qc = useQueryClient();
  const [lastSyncedAt, setLastSyncedAt] = useState<number | null>(null);
  const mounted = useRef(true);

  useEffect(() => {
    mounted.current = true;
    return () => {
      mounted.current = false;
    };
  }, []);

  useEffect(() => {
    const refresh = () => {
      QUERY_KEYS.forEach((key) => {
        qc.invalidateQueries({ queryKey: key });
      });
      if (mounted.current) setLastSyncedAt(Date.now());
    };

    refresh();
    const intervalId = window.setInterval(refresh, POLL_INTERVAL_MS);

    // Refetch instantané quand la fenêtre redevient active
    const onVisibility = () => {
      if (!document.hidden) refresh();
    };
    document.addEventListener('visibilitychange', onVisibility);
    window.addEventListener('focus', refresh);

    // Push instantané quand on est dans l'iframe Grist
    const w = window as unknown as {
      grist?: {
        onRecord?: (cb: (record: unknown) => void) => void;
        onRecords?: (cb: (records: unknown[]) => void) => void;
      };
    };
    if (w.grist?.onRecords) {
      try {
        w.grist.onRecords(() => refresh());
      } catch {
        // pas grave, le polling fait le job
      }
    }

    return () => {
      window.clearInterval(intervalId);
      document.removeEventListener('visibilitychange', onVisibility);
      window.removeEventListener('focus', refresh);
    };
  }, [qc]);

  return { lastSyncedAt };
}
