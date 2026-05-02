import type { ChecklistItem } from '../types';

// Listes courtes, ce qui est vraiment vérifié avant et après tournage.
// Pas une checklist exhaustive, juste les pièges connus.

export const CHECKLIST_PRE_TOURNAGE: ChecklistItem[] = [
  { id: 'batterie', label: 'Téléphone chargé > 80%', detail: 'Filmer 4-5 Reels prend 2h minimum.' },
  { id: 'storage', label: 'Stockage libre > 5 Go', detail: 'Vidéos 4K = 350 Mo/min.' },
  { id: 'micro', label: 'Micro Boya branché et testé', detail: 'Test 10s : écouter au casque.' },
  { id: 'lumiere', label: 'Ring light installé, position OK', detail: 'Visage uniforme, pas d\'ombres marquées.' },
  { id: 'scripts', label: 'Scripts du jour imprimés ou ouverts', detail: 'Hook, structure, CTA en clair.' },
  { id: 'lieu', label: 'Lieu rangé, fond propre', detail: 'Pas de bazar visible derrière.' },
  { id: 'argibi', label: 'Argibi prêt si setup LED', detail: 'Connecté, animation testée.' },
  { id: 'eau', label: 'Eau à portée', detail: 'Pour la voix, surtout en batch 2h.' },
];

export const CHECKLIST_POST_TOURNAGE: ChecklistItem[] = [
  { id: 'export_rushes', label: 'Export rushes vers ordinateur', detail: 'Dossier Reels/2026-MM-DD/' },
  { id: 'capcut_import', label: 'Import dans CapCut + projet par Reel' },
  { id: 'auto_caption', label: 'Auto-captions activé', detail: 'Vérifier orthographe et timing.' },
  { id: 'cut', label: 'Coupes : retirer les hésitations et silences > 0.4s' },
  { id: 'sfx', label: 'SFX placés', detail: 'Whoosh sur transitions, ding sur overlays.' },
  { id: 'music', label: 'Musique trending IG (ou banque libre si pas dispo)', detail: 'Volume musique 30%, voix 80%.' },
  { id: 'overlay', label: 'Texte overlay UPPERCASE sur key moments', detail: 'Police Wubo, jaune ou violet.' },
  { id: 'export', label: 'Export 1080×1920 30fps H.265', detail: 'Vérifier durée < 60s.' },
  { id: 'caption', label: 'Caption rédigée avec hashtags rotation A/B/C' },
  { id: 'depot', label: 'Vidéo déposée dans Drive Wubo et programmée', detail: 'Nommer : YYYY-MM-DD_titre.mp4' },
];
