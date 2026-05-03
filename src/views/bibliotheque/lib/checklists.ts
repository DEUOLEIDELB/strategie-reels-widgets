import type { ChecklistItem } from '../types';

// Checklists épurées : uniquement les pièges qu'on oublie vraiment.
// 4 items max par liste pour rester lisible et utilisable.

export const CHECKLIST_PRE_TOURNAGE: ChecklistItem[] = [
  { id: 'storage', label: 'Stockage libre > 5 Go', detail: '4K = 350 Mo/min, batch 2h = 4 Go.' },
  { id: 'micro', label: 'Micro Boya testé au casque', detail: 'Vérifier qu\'il enregistre bien, pas de larsen.' },
  { id: 'scripts', label: 'Scripts du jour ouverts à portée', detail: 'Hook, structure, CTA visibles.' },
  { id: 'argibi', label: 'Argibi prêt si setup LED', detail: 'Connecté, animation testée 30s avant.' },
];

export const CHECKLIST_POST_TOURNAGE: ChecklistItem[] = [
  { id: 'auto_caption', label: 'Auto-captions vérifiées', detail: 'Orthographe + timing serré + position bas.' },
  { id: 'cut', label: 'Coupes : pas de silence > 0.4s', detail: 'Hormozi style, jump cut sur respirations.' },
  { id: 'sfx', label: 'Whoosh sur les transitions clés' },
  { id: 'export', label: 'Export 1080×1920 30fps H.265', detail: 'Durée < 60s confirmée.' },
];
