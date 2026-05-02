import type { Reel, BrollPlan, SessionTournage } from '@/shared/lib/types';

// Calculs cross-tables pour le mini dashboard de tête.
// Tout en mémoire, pas de mutation.

export interface DashboardSnapshot {
  reelsScripteAFilmer: number;
  reelsTotal: number;
  brollsTotal: number;
  brollsJamaisUtilises: number;
  sessionsAPlanifier: number;
  sessionsTotal: number;
  alertes: { id: string; severite: 'info' | 'warn'; texte: string }[];
}

const STATUTS_AVANT_FILMAGE = ['concept', 'scripté'];

export function buildSnapshot(
  reels: Reel[] | undefined,
  brolls: BrollPlan[] | undefined,
  sessions: SessionTournage[] | undefined,
): DashboardSnapshot {
  const r = reels ?? [];
  const b = brolls ?? [];
  const s = sessions ?? [];

  const reelsScripteAFilmer = r.filter((x) => STATUTS_AVANT_FILMAGE.includes(x.statut)).length;
  const sessionsAPlanifier = s.filter((x) => !x.statut || x.statut === 'à_planifier' || x.statut === 'planifiée').length;
  const brollsJamaisUtilises = b.filter((x) => !x.reels_qui_utilisent || x.reels_qui_utilisent.trim() === '').length;

  const alertes: DashboardSnapshot['alertes'] = [];

  if (reelsScripteAFilmer > 5 && sessionsAPlanifier === 0) {
    alertes.push({
      id: 'no_session',
      severite: 'warn',
      texte: `${reelsScripteAFilmer} Reels scriptés en attente, aucune session de tournage planifiée.`,
    });
  }
  if (b.length > 0 && brollsJamaisUtilises / b.length > 0.4) {
    alertes.push({
      id: 'brolls_orphelins',
      severite: 'info',
      texte: `${brollsJamaisUtilises} brolls jamais réutilisés. Pense à les caser dans les Reels en attente.`,
    });
  }
  if (b.length === 0) {
    alertes.push({
      id: 'no_broll',
      severite: 'info',
      texte: 'Aucun broll enregistré dans la table Broll. Ajoute tes plans réutilisables.',
    });
  }
  if (s.length === 0) {
    alertes.push({
      id: 'no_session_global',
      severite: 'info',
      texte: 'Aucune session de tournage enregistrée. Planifie ton prochain batch.',
    });
  }

  return {
    reelsScripteAFilmer,
    reelsTotal: r.length,
    brollsTotal: b.length,
    brollsJamaisUtilises,
    sessionsAPlanifier,
    sessionsTotal: s.length,
    alertes,
  };
}
