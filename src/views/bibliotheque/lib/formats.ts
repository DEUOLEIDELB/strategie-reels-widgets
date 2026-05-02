import type { FormatStatic } from '../types';

// Liste constante des formats Reels Wubo. Pas une table Grist.
// Référence : conventions creative strategist + benchmark concurrents.
export const FORMATS: FormatStatic[] = [
  {
    id: 'duel',
    nom: 'Duel',
    description: 'Deux personnes face caméra qui débattent ou comparent. Ton vif, jump cuts.',
    icone: 'Users',
  },
  {
    id: 'monologue',
    nom: 'Monologue caméra',
    description: 'Une voix, face cam, ton direct. Le format grand frère par défaut.',
    icone: 'Mic',
  },
  {
    id: 'tutoriel',
    nom: 'Tutoriel',
    description: 'Étape par étape filmée. Mains, gros plan, voix off.',
    icone: 'BookOpen',
  },
  {
    id: 'reaction',
    nom: 'Réaction',
    description: 'Filmer une réaction à un contenu existant (article, vidéo, donnée).',
    icone: 'Eye',
  },
  {
    id: 'coulisses',
    nom: 'Coulisses',
    description: 'On montre le making-of, le bordel, l\'humain. Authenticité brute.',
    icone: 'Camera',
  },
  {
    id: 'skit',
    nom: 'Skit / mise en scène',
    description: 'Petite saynète. Personnages, situation, punchline. Format storytellé.',
    icone: 'Drama',
  },
  {
    id: 'talking_broll',
    nom: 'Talking head + B-roll',
    description: 'Voix face cam + plans illustratifs en cutaway. Format YouTube / Hormozi.',
    icone: 'Film',
  },
  {
    id: 'trio',
    nom: 'Trio',
    description: 'Trois personnes : un parle, deux réagissent. Énergie collective.',
    icone: 'Users',
  },
  {
    id: 'compilation',
    nom: 'Compilation rapide',
    description: 'Suite de plans courts, montés au tempo. Best-of, listicle visuel.',
    icone: 'Layers',
  },
];
