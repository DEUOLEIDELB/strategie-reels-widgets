import type { SetupStatic } from '../types';

// Les 4 setups récurrents pour tourner du contenu Wubo.
// Référence : bible-production-reels.md.
export const SETUPS: SetupStatic[] = [
  {
    id: 'face_cam',
    nom: 'Face cam Taki',
    description: 'Mur uni, lumière diffuse, prise de son cravate. Pour scripts grand frère et fondateur.',
    equipement: ['Téléphone récent', 'Trépied', 'Micro Boya BY-M1', 'Ring light', 'Repère eyeline'],
    icone: 'Mic',
    exemple_usage: 'Script "J\'étais l\'iPad Kid" / "Tu proposes quoi ?"',
  },
  {
    id: 'table_sombre_led',
    nom: 'Table sombre + LED',
    description: 'Pièce assombrie, fond noir, plan en plongée 30 à 50 cm de la matrice LED Argibi.',
    equipement: ['Téléphone', 'Trépied avec bras horizontal', 'Argibi alimenté', 'Tissu noir mat'],
    icone: 'Sparkles',
    exemple_usage: 'Hooks visuels MEL Science / Wow visuel pur',
  },
  {
    id: 'atelier_enfants',
    nom: 'Atelier enfants',
    description: 'Plans enfants en train de construire. Autorisation parentale obligatoire.',
    equipement: ['Téléphone', 'Trépied bas', 'Micro ambiance', 'Décharge parentale signée'],
    icone: 'Users',
    exemple_usage: 'UGC familial, réactions premier allumage',
  },
  {
    id: 'broll_libre',
    nom: 'B-roll libre',
    description: 'Plans d\'illustration courts. Composants, mains, magazine, pages, détails.',
    equipement: ['Téléphone', 'Trépied ou main libre', 'Lumière naturelle si possible'],
    icone: 'Camera',
    exemple_usage: 'Cutaway pendant face cam, illustration de chiffre',
  },
];
