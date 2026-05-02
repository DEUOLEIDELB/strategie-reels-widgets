import type { IdentiteVisuelle } from '../types';

// Identité visuelle Wubo pour cohérence des Reels.
// Référence : Guidelines colors business/marketing/identite/.
export const IDENTITE: IdentiteVisuelle = {
  palette: [
    { nom: 'Jaune Wubo', hex: '#FFDD0B', usage: 'CTA, accents, surlignages, key moments' },
    { nom: 'Violet Wubo', hex: '#5914D0', usage: 'Texte fort, focus, badge série' },
    { nom: 'Bleu Wubo', hex: '#1DC1F9', usage: 'Infos neutres, chiffres' },
    { nom: 'Pink Wubo', hex: '#D40272', usage: 'Erreur, urgence, alerte' },
    { nom: 'Noir', hex: '#191919', usage: 'Texte body, fond plein' },
    { nom: 'Blanc', hex: '#FFFFFF', usage: 'Texte sur fond foncé, fond plein' },
  ],
  fonts: [
    { nom: 'Anton', usage: 'Texte overlay UPPERCASE bold (titre choc)', url: 'https://fonts.google.com/specimen/Anton' },
    { nom: 'Inter', usage: 'Caption Instagram, captions auto CapCut', url: 'https://fonts.google.com/specimen/Inter' },
  ],
  formats_export: [
    { ratio: '1080×1920', fps: 30, codec: 'H.265', usage: 'Reels Instagram et TikTok (standard)' },
    { ratio: '1080×1920', fps: 60, codec: 'H.265', usage: 'Reels avec slow-mo / mouvement rapide' },
  ],
  regles_overlay: [
    'UPPERCASE pour les titres choc (max 6 mots)',
    'Une couleur d\'accent par Reel (jaune ou violet, jamais les deux)',
    'Texte en bas de l\'écran, pas centré (UI IG cache le centre)',
    'Apparition mot par mot ou phrase par phrase, jamais bloc complet d\'un coup',
    'Animation max 200ms, pas de bounce kitsch',
    'Stroke noir ou ombre solide pour lisibilité sur fond variable',
  ],
};
