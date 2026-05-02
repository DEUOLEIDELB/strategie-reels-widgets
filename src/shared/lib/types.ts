// Types Grist pour le modèle combinatoire creative strategist.
// Source : doc Grist o8yNauYWgjtjcnTJyKURyk.
// Modèle : Avatar > Angle > Pain > Reel (pools indépendants, N:N libres).

export interface Avatar {
  id: number;
  prenom: string;
  age_range: string;
  lieu: string;
  situation_familiale: string;
  profession: string;
  revenus_foyer: string;
  reseau_principal: string;
  photo_url: string;
  description_synthese: string;
  declencheurs_achat: string;
  objections: string;
}

export interface Angle {
  id: number;
  nom: string;
  ton: string;
  description: string;
  force: string;
  faiblesse: string;
  meilleur_pour: string;
  cible_primaire: string;
  avatars?: number[] | string[];
}

export interface PainPoint {
  id: number;
  titre: string;
  description: string;
  chiffre_source: string;
  emotion_dominante: string;
  frequence_vecue: string;
  niveau_intensite: number;
  avatars?: number[] | string[];
  angles?: number[] | string[];
}

export type ReelStatutGrist =
  | 'concept'
  | 'scripté'
  | 'filmé'
  | 'monté'
  | 'posté'
  | 'analysé';

export type ReelStatutSynth = 'idée' | 'prêt' | 'posté';

export interface Reel {
  id: number;
  titre: string;
  jour: number | string;
  serie: string;
  type: string;
  duree_sec: number;
  objectif: string;
  signal_algo: string[] | string;
  semaine: number;
  statut: ReelStatutGrist;
  hook_verbal: string;
  hook_visuel: string;
  titre_overlay: string;
  structure_body: string;
  cta_type: string;
  cta_texte: string;
  production_lieu: string;
  personnes: string;
  prediction_metrique: string;
  avatar?: number;
  angle?: number;
  probleme?: number;
  angle_precis?: string;
}

export interface Hook {
  id: number;
  version_source: string;
  texte: string;
  thumbnail: string;
  methode_ou_trigger: string;
  categorie: string;
  serie: string;
  cta_associe: string;
  signal_algo_cible: string[] | string;
  potentiel: string;
}

export interface Script {
  id: number;
  titre: string;
  sujet: string;
  duree_sec: number;
  categorie: string;
  angle: string;
  structure_body: string;
  texte_oral_complet: string;
  texte_overlay: string;
  musique_recommandee: string;
  cta_type: string;
  cta_texte: string;
  signal_algo_cible: string[] | string;
  pain_point_cible: string;
  source_principale: string;
  versions_alternatives: string;
}

export interface Ressource {
  id: number;
  nom: string;
  categorie: string;
  url: string;
  prix: string;
  usage_recommande: string;
  cas_usage_wubo: string;
  score_priorite: number;
}

export interface TaxoEntry {
  id: number;
  type: string;
  nom: string;
  definition: string;
  exemple_wubo: string;
  quand_utiliser: string;
}

export interface VideoVirale {
  id: number;
  createur: string;
  titre_ou_description: string;
  vues_likes: string;
  plateforme: string;
  format: string;
  categorie_pain_point: number;
  pourquoi_a_perce: string;
  hook_pour_wubo: string;
  signal_algo: string[] | string;
  tier_reproductibilite: string;
  source_url: string;
}

export interface Concurrent {
  id: number;
  nom: string;
  username_ig: string;
  followers_ig: number;
  followers_tiktok: number;
  prix: string;
  cible_age: string;
  positionnement: string;
  avatar_cible: string;
  ce_quon_emprunte: string;
  ce_quon_evite: string;
  pays: string;
}

export interface Tendance {
  id: number;
  periode: string;
  vague: string;
  description: string;
  source: string;
  contenu_wubo_recommande: string;
  pic_attendu_date: number | string;
  priorite: number;
}

export interface Serie {
  id: number;
  nom: string;
  type: string;
  concept: string;
  signal_algo_cible: string[] | string;
  regle_dor: string;
  frequence_par_semaine: number;
  nb_total_videos_planifiees: number;
  couleur_hex: string;
}

export interface SessionTournage {
  id: number;
  type: string;
  date_planifiee: number | string;
  duree_estimee_min: number;
  lieu: string;
  personnes_requises: string;
  equipement: string;
  reels_alimentes: string;
  statut: string;
}

export interface BrollPlan {
  id: number;
  code: string;
  description_plan: string;
  setup_technique: string;
  duree_min_secondes: number;
  priorite: string;
  reels_qui_utilisent: string;
  statut: string;
}

export interface Influenceur {
  id: number;
  username: string;
  followers_ig: number;
  followers_estime: boolean;
  categorie: string;
  description: string;
  pertinence_wubo: number;
  cercle_influence: number;
  pays: string;
  tier_contact: string;
  action_prioritaire: string;
  pourquoi: string;
  statut_contact: string;
  url_instagram: string;
  notes: string;
}

export interface MetriqueReel {
  id: number;
  reel_id: number;
  date_post: number | string;
  vues: number;
  likes: number;
  saves: number;
  dm_sends: number;
  comments: number;
  follows_gagnes: number;
  completion_rate: number;
}

export interface Sujet {
  id: number;
  titre: string;
  pourquoi_puissant: string;
  source: string;
  pain_point_cible: number;
  signal_algo: string[] | string;
  format: string;
  duree_sec: number;
  statut: string;
}

export const REEL_STATUTS_GRIST: ReelStatutGrist[] = [
  'concept',
  'scripté',
  'filmé',
  'monté',
  'posté',
  'analysé',
];

export const REEL_STATUTS_SYNTH: ReelStatutSynth[] = ['idée', 'prêt', 'posté'];

export function synthStatut(s: ReelStatutGrist): ReelStatutSynth {
  if (s === 'concept') return 'idée';
  if (s === 'scripté' || s === 'filmé' || s === 'monté') return 'prêt';
  return 'posté';
}
