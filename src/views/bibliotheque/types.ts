// Types locaux Studio Bibliothèque V2.

import type { Ressource } from '@/shared/lib/types';

export type Section = 'plateau' | 'stock' | 'manuel';

export type RessourceTypeAction = 'banque' | 'asset_direct' | 'outil_logiciel';
export type RessourceDroits = 'public_domain' | 'cc' | 'free' | 'freemium' | 'payant';

// Ressource avec les colonnes Grist nouvelles ajoutées en mai 2026.
// Cast local jusqu'à ce que types.ts shared soit mis à jour par le PO.
export interface RessourceWithAction extends Ressource {
  type_action?: RessourceTypeAction | '';
  droits?: RessourceDroits | '';
  archive?: boolean;
}

export type StockSubTab = 'banques' | 'assets' | 'outils';

export interface SetupStatic {
  id: string;
  nom: string;
  description: string;
  equipement: string[];
  icone: string;
  exemple_usage: string;
}

export interface ChecklistItem {
  id: string;
  label: string;
  detail?: string;
}

export interface IdentiteVisuelle {
  palette: { nom: string; hex: string; usage: string }[];
  fonts: { nom: string; usage: string; url: string }[];
  formats_export: { ratio: string; fps: number; codec: string; usage: string }[];
  regles_overlay: string[];
}

export interface CheatHook {
  nom: string;
  exemple: string;
}

export interface CheatFormat {
  nom: string;
  description_courte: string;
}
