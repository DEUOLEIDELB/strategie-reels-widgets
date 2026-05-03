// Types locaux Studio Bibliothèque V5.

import type { Ressource, BrollPlan } from '@/shared/lib/types';

// Broll avec colonnes ajoutées en mai 2026 (url_video, url_thumbnail).
export interface BrollWithVideo extends BrollPlan {
  url_video?: string | '';
  url_thumbnail?: string | '';
}

export type RessourceTypeAction = 'banque' | 'asset_direct' | 'outil_logiciel';
export type RessourceDroits = 'public_domain' | 'cc' | 'free' | 'freemium' | 'payant';

// Ressource avec les colonnes Grist ajoutées (type_action, droits, archive).
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
