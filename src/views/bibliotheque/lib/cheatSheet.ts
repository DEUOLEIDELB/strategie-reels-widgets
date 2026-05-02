import type { CheatHook, CheatFormat } from '../types';

// Aide-mémoire compressé. Pas la taxonomie complète (ça vit dans Grist).
// Juste ce qu'on relit en 30 secondes pendant la prod.

export const CHEAT_HOOKS: CheatHook[] = [
  { nom: 'Curiosité', exemple: 'Devinez ce que cette gamine de 9 ans a construit en 15 minutes...' },
  { nom: 'Identité', exemple: 'Si votre enfant peut passer 3h sur Minecraft, il peut construire ça.' },
  { nom: 'Contraste', exemple: 'Hier il regardait des vidéos. Aujourd\'hui il a programmé sa première LED.' },
  { nom: 'Révélation', exemple: 'Y\'a un truc que 95% des parents ne savent pas...' },
  { nom: 'Confrontation', exemple: 'Les enfants français passent 4h11 par jour sur les écrans. Et après ?' },
  { nom: 'Résultat', exemple: 'En 15 minutes, cette fille de 9 ans a programmé sa première animation.' },
  { nom: 'POV', exemple: 'POV : tu montres à tes potes ce que ton gamin a construit.' },
  { nom: 'Listicle', exemple: '3 trucs que votre enfant peut construire ce soir.' },
  { nom: 'Myth buster', exemple: 'Tout le monde me dit que l\'électronique c\'est trop dur pour un enfant.' },
  { nom: 'Question', exemple: 'Votre enfant vous a déjà dit "je m\'ennuie" avec un téléphone dans la main ?' },
  { nom: 'Urgence', exemple: 'Les 100 premiers kits partent ce mois-ci.' },
  { nom: 'Name drop', exemple: 'Ce que Jamy aurait dit en voyant notre kit.' },
];

export const CHEAT_FORMATS: CheatFormat[] = [
  { nom: 'Monologue caméra', description_courte: 'Une voix, face cam, ton direct. Format grand frère par défaut.' },
  { nom: 'Talking head + B-roll', description_courte: 'Voix face cam + cutaways illustratifs. Style Hormozi.' },
  { nom: 'Wow visuel pur', description_courte: 'Pas de voix. Mains, LED, slow-mo, payoff visuel. Format MEL Science.' },
  { nom: 'Tutoriel', description_courte: 'Étapes filmées en gros plan, voix off explicative.' },
  { nom: 'Réaction', description_courte: 'Réagir à un contenu (article, vidéo, donnée). Cadrage face cam + insert.' },
  { nom: 'Coulisses', description_courte: 'Making-of brut, authenticité, sans script.' },
  { nom: 'Skit / mise en scène', description_courte: 'Saynète courte. Personnages, situation, punchline.' },
  { nom: 'Avant / après', description_courte: 'Split screen ou cut sec. Deux états opposés du même enfant.' },
  { nom: 'Compilation', description_courte: 'Suite de plans courts au tempo. Best-of, listicle visuel.' },
];
