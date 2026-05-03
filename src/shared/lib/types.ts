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

export type AtelierNodeType = 'avatar' | 'angle' | 'pain' | 'reel';

// Le type 'note' est un sticky-note libre, pas une brique pédagogique. Stocké dans le même
// canvas_state pour simplicité, mais les notes n'ont ni briqueId ni slots.
export type CanvasNodeType = AtelierNodeType | 'note';

export interface AtelierNode {
  id: string;
  type: CanvasNodeType;
  position: { x: number; y: number };
  data: {
    // Pour les briques (avatar/angle/pain/reel) :
    briqueId?: number;
    label?: string;
    // Overrides locaux propres à cette instance (ne touchent pas le record Grist).
    // Multi-variantes V1.6 : chaque slot peut contenir un array de strings (variantes A/B).
    // Format legacy V1.4-V1.5 : string simple (rétrocompatibilité gérée à la lecture).
    overrides?: Record<string, string[] | string>;
    // Override du titre affiché sur la card. Si non défini, on utilise le label hydraté du template.
    labelOverride?: string;

    // Pour les sticky notes (type === 'note') :
    content?: string;
    color?: string; // hex couleur (par défaut jaune Wubo)
  };
}

export interface AtelierEdge {
  id: string;
  source: string;
  target: string;
}

export interface AtelierCanvasState {
  nodes: AtelierNode[];
  edges: AtelierEdge[];
}

export interface Atelier {
  id: number;
  nom: string;
  description: string;
  canvas_state: string;
  parent_atelier?: number;
  created_at: number | string;
  updated_at: number | string;
}

export const EMPTY_CANVAS_STATE: AtelierCanvasState = { nodes: [], edges: [] };

export function parseCanvasState(raw: string | null | undefined): AtelierCanvasState {
  if (!raw) return EMPTY_CANVAS_STATE;
  try {
    const parsed = JSON.parse(raw) as Partial<AtelierCanvasState>;
    return {
      nodes: Array.isArray(parsed.nodes) ? parsed.nodes : [],
      edges: Array.isArray(parsed.edges) ? parsed.edges : [],
    };
  } catch {
    return EMPTY_CANVAS_STATE;
  }
}

export function serializeCanvasState(state: AtelierCanvasState): string {
  return JSON.stringify(state);
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

// ============================================================================
// VEILLE V2/V3 (tables Signaux_veille + Synthese_hebdo + Posts_concurrents)
// ============================================================================

export type PostPlateforme = 'instagram' | 'tiktok' | 'youtube';

export type PostFormat =
  | 'face_cam'
  | 'b_roll'
  | 'split_screen'
  | 'talking_head'
  | 'ugc'
  | 'tutorial'
  | 'reaction'
  | 'compilation'
  | 'autre';

export interface PostConcurrent {
  id: number;
  concurrent?: number;
  url_post: string;
  plateforme: PostPlateforme | '';
  date_post: number | string | null;
  thumbnail_url: string;
  caption: string;
  vues: number;
  likes: number;
  comments: number;
  format_detecte: PostFormat | '';
  score_viralite: number;
  captured_signal?: number;
  notes: string;
}

export const POST_PLATEFORMES: PostPlateforme[] = ['instagram', 'tiktok', 'youtube'];

export const POST_FORMATS: PostFormat[] = [
  'face_cam',
  'b_roll',
  'split_screen',
  'talking_head',
  'ugc',
  'tutorial',
  'reaction',
  'compilation',
  'autre',
];

export const POST_FORMAT_LABELS: Record<PostFormat, string> = {
  face_cam: 'Face cam',
  b_roll: 'B-roll',
  split_screen: 'Split screen',
  talking_head: 'Talking head',
  ugc: 'UGC',
  tutorial: 'Tutoriel',
  reaction: 'Réaction',
  compilation: 'Compilation',
  autre: 'Autre',
};



export type SignalSourceType =
  | 'reel'
  | 'article'
  | 'tweet'
  | 'dashboard_perf'
  | 'manuel'
  | 'email'
  | 'bookmarklet';

export type SignalCategorie =
  | 'performance'
  | 'concurrent'
  | 'trend_son'
  | 'trend_format'
  | 'actu'
  | 'audience'
  | 'algo';

export type SignalHorizon = 'now' | 'next' | 'later';

export type SignalStatut = 'capturé' | 'intégré_synthèse' | 'archivé' | 'ignoré';

export interface SignalVeille {
  id: number;
  date_capture: number | string;
  semaine_iso: string;
  source_type: SignalSourceType | '';
  source_url: string;
  categorie: SignalCategorie | '';
  titre: string;
  signal: string;
  insight: string;
  action_proposee: string;
  horizon: SignalHorizon | '';
  statut: SignalStatut | '';
  reel_genere?: number;
  concurrent_lie?: number;
  influenceur_lie?: number;
  notes: string;
}

export type SyntheseStatut = 'en_cours' | 'archivée';

export interface SyntheseHebdo {
  id: number;
  semaine_iso: string;
  date_creation: number | string;
  date_archivage: number | string | null;
  performance_top: string;
  performance_flop: string;
  performance_metrique_surveiller: string;
  concurrents_obs: string;
  trends_now: string;
  signaux_faibles: string;
  actions_1: string;
  actions_2: string;
  actions_3: string;
  notes_libres: string;
  statut: SyntheseStatut;
}

export const SIGNAL_CATEGORIES: SignalCategorie[] = [
  'performance',
  'concurrent',
  'trend_son',
  'trend_format',
  'actu',
  'audience',
  'algo',
];

export const SIGNAL_HORIZONS: SignalHorizon[] = ['now', 'next', 'later'];

export const SIGNAL_SOURCE_TYPES: SignalSourceType[] = [
  'reel',
  'article',
  'tweet',
  'dashboard_perf',
  'manuel',
  'email',
  'bookmarklet',
];

export const SIGNAL_CATEGORIE_LABELS: Record<SignalCategorie, string> = {
  performance: 'Performance',
  concurrent: 'Concurrent',
  trend_son: 'Son trending',
  trend_format: 'Format trending',
  actu: 'Actu',
  audience: 'Audience',
  algo: 'Algo / plateforme',
};

export const SIGNAL_HORIZON_LABELS: Record<SignalHorizon, string> = {
  now: 'Now',
  next: 'Next',
  later: 'Later',
};

// Calcule la semaine ISO au format "YYYY-Www" (ex: "2026-W19")
export function currentSemaineIso(d: Date = new Date()): string {
  const date = new Date(Date.UTC(d.getFullYear(), d.getMonth(), d.getDate()));
  const dayNum = date.getUTCDay() || 7;
  date.setUTCDate(date.getUTCDate() + 4 - dayNum);
  const yearStart = new Date(Date.UTC(date.getUTCFullYear(), 0, 1));
  const weekNum = Math.ceil(((date.getTime() - yearStart.getTime()) / 86400000 + 1) / 7);
  return `${date.getUTCFullYear()}-W${String(weekNum).padStart(2, '0')}`;
}
