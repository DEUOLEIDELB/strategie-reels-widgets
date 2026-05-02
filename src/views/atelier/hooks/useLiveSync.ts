import { useEffect, useRef, useState } from 'react';
import { useQueryClient } from '@tanstack/react-query';

const POLL_INTERVAL_MS = 5000;
const QUERY_KEYS = [
  ['ateliers'],
  ['avatars'],
  ['angles'],
  ['pain_points'],
  ['reels'],
] as const;

/**
 * Polling périodique pour récupérer les modifs des autres utilisateurs.
 *
 * Limites V1 :
 * - Le canvas en cours d'édition local n'est PAS rechargé (sinon on écraserait les modifs).
 *   Pour voir un canvas modifié par un autre user : changer d'atelier ou recharger la page.
 * - Les briques (avatars/angles/pains/reels) elles, sont rafraîchies en continu
 *   et leurs nouveaux contenus apparaissent dans la sidebar et le drawer édition.
 * - Conflits canvas : last-write-wins (le dernier qui sauvegarde gagne).
 *
 * Quand l'app tourne en iframe Grist, on s'accroche aussi à window.grist.onRecords
 * pour un push instantané (latence ~50ms vs 5s polling).
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

    // Premier refresh immédiat
    refresh();

    const intervalId = window.setInterval(refresh, POLL_INTERVAL_MS);

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
    };
  }, [qc]);

  return { lastSyncedAt };
}
