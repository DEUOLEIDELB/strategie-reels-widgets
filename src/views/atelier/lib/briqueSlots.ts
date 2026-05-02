import type { Avatar, Angle, PainPoint, Reel, AtelierNodeType } from '@/shared/lib/types';

// Slots = sous-blocs visibles directement sur la carte du canvas.
// Toujours 3 par type : pour structurer sans surcharger.
// Le tooltip au hover révèle le contenu complet ; le drawer (double-clic) permet d'éditer.

export interface BriqueSlot {
  id: string;
  label: string; // courte (4-7 char) — affichée sur la card
  hint: string; // long — affichée au hover dans le tooltip
  value: string; // contenu réel depuis Grist
}

const REEL_SLOTS = ['hook', 'body', 'cta'] as const;
const AVATAR_SLOTS = ['qui', 'vit', 'achete'] as const;
const ANGLE_SLOTS = ['voix', 'force', 'quand'] as const;
const PAIN_SLOTS = ['quoi', 'emotion', 'preuve'] as const;

const SLOT_LABEL: Record<string, string> = {
  hook: 'Hook',
  body: 'Body',
  cta: 'CTA',
  qui: 'Qui',
  vit: 'Vit',
  achete: 'Achète',
  voix: 'Voix',
  force: 'Force',
  quand: 'Quand',
  quoi: 'Quoi',
  emotion: 'Émo',
  preuve: 'Preuve',
};

const SLOT_HINT: Record<string, string> = {
  hook: 'Les 3 premières secondes : ce qui aimante le scroll',
  body: 'Le corps narratif : promesse, tension, payoff',
  cta: "L'appel à l'action concret",
  qui: 'Synthèse de qui est cette personne',
  vit: 'Situation familiale et contexte de vie',
  achete: "Ce qui le fait passer à l'action",
  voix: "Le ton et la posture de l'angle",
  force: 'Pourquoi cet angle marche',
  quand: 'Le contexte où cet angle est le plus puissant',
  quoi: 'La douleur en une phrase concrète',
  emotion: "L'émotion dominante et son intensité",
  preuve: 'Le chiffre, la source qui rend ce pain indiscutable',
};

function slot(id: string, value: string): BriqueSlot {
  return { id, label: SLOT_LABEL[id] ?? id, hint: SLOT_HINT[id] ?? '', value: (value ?? '').trim() };
}

export function slotsForReel(r: Reel): BriqueSlot[] {
  return REEL_SLOTS.map((id) => {
    if (id === 'hook') return slot(id, r.hook_verbal || r.titre_overlay || '');
    if (id === 'body') return slot(id, r.structure_body || '');
    return slot(id, r.cta_texte || '');
  });
}

export function slotsForAvatar(a: Avatar): BriqueSlot[] {
  return AVATAR_SLOTS.map((id) => {
    if (id === 'qui') return slot(id, a.description_synthese || '');
    if (id === 'vit') return slot(id, [a.situation_familiale, a.profession].filter(Boolean).join(' · ') || '');
    return slot(id, a.declencheurs_achat || '');
  });
}

export function slotsForAngle(a: Angle): BriqueSlot[] {
  return ANGLE_SLOTS.map((id) => {
    if (id === 'voix') return slot(id, a.ton || '');
    if (id === 'force') return slot(id, a.force || '');
    return slot(id, a.meilleur_pour || '');
  });
}

export function slotsForPain(p: PainPoint): BriqueSlot[] {
  return PAIN_SLOTS.map((id) => {
    if (id === 'quoi') return slot(id, p.description || p.titre || '');
    if (id === 'emotion') {
      const intensity = p.niveau_intensite ? `${p.niveau_intensite}/5` : '';
      return slot(id, [p.emotion_dominante, intensity].filter(Boolean).join(' — ') || '');
    }
    return slot(id, p.chiffre_source || '');
  });
}

export function emptySlotsFor(type: AtelierNodeType): BriqueSlot[] {
  const ids = type === 'reel' ? REEL_SLOTS : type === 'avatar' ? AVATAR_SLOTS : type === 'angle' ? ANGLE_SLOTS : PAIN_SLOTS;
  return ids.map((id) => slot(id, ''));
}
