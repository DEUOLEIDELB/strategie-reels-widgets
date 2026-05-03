import type { Avatar, Angle, PainPoint, Reel, AtelierNodeType } from '@/shared/lib/types';

// Slots = sous-blocs visibles directement sur la carte du canvas.
// Toujours 3 par type : pour structurer sans surcharger.
//
// Le "template" est la valeur du record Grist (partagée par toutes les instances).
// L'override est local à un node et ne propage à personne d'autre — c'est l'esprit laboratoire :
// chaque instance peut tester sa variante sans toucher au template ni aux autres instances.

export interface BriqueSlot {
  id: string; // ex: 'hook', 'body', 'cta', 'qui'...
  label: string; // ex: 'Hook' (court, affiché sur la card)
  hint: string; // hint pédagogique (tooltip, drawer)
  templateValue: string; // valeur depuis le record Grist
  overrideValue?: string; // valeur locale au node (si overridée)
}

// Helper : valeur effective (override prioritaire)
export function effectiveValue(slot: BriqueSlot): string {
  return slot.overrideValue !== undefined ? slot.overrideValue : slot.templateValue;
}

export function isSlotFilled(slot: BriqueSlot): boolean {
  const v = effectiveValue(slot);
  return Boolean(v && v.trim().length > 0);
}

export function isSlotOverridden(slot: BriqueSlot): boolean {
  return slot.overrideValue !== undefined;
}

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
  emotion: 'Émotion',
  preuve: 'Preuve',
};

const SLOT_IDS: Record<AtelierNodeType, readonly string[]> = {
  reel: ['hook', 'body', 'cta'],
  avatar: ['qui', 'vit', 'achete'],
  angle: ['voix', 'force', 'quand'],
  pain: ['quoi', 'emotion', 'preuve'],
};

function makeSlot(id: string, templateValue: string, overrideValue?: string): BriqueSlot {
  return {
    id,
    label: SLOT_LABEL[id] ?? id,
    hint: SLOT_HINT[id] ?? '',
    templateValue: (templateValue ?? '').trim(),
    overrideValue,
  };
}

export type SlotOverrides = Record<string, string>;

function reelTemplate(r: Reel, id: string): string {
  if (id === 'hook') return r.hook_verbal || r.titre_overlay || '';
  if (id === 'body') return r.structure_body || '';
  if (id === 'cta') return r.cta_texte || '';
  return '';
}

function avatarTemplate(a: Avatar, id: string): string {
  if (id === 'qui') return a.description_synthese || '';
  if (id === 'vit') return [a.situation_familiale, a.profession].filter(Boolean).join(' · ');
  if (id === 'achete') return a.declencheurs_achat || '';
  return '';
}

function angleTemplate(a: Angle, id: string): string {
  if (id === 'voix') return a.ton || '';
  if (id === 'force') return a.force || '';
  if (id === 'quand') return a.meilleur_pour || '';
  return '';
}

function painTemplate(p: PainPoint, id: string): string {
  if (id === 'quoi') return p.description || p.titre || '';
  if (id === 'emotion') {
    const intensity = p.niveau_intensite ? `${p.niveau_intensite}/5` : '';
    return [p.emotion_dominante, intensity].filter(Boolean).join(' — ');
  }
  if (id === 'preuve') return p.chiffre_source || '';
  return '';
}

export function slotsForReel(r: Reel, overrides: SlotOverrides = {}): BriqueSlot[] {
  return SLOT_IDS.reel.map((id) => makeSlot(id, reelTemplate(r, id), overrides[id]));
}

export function slotsForAvatar(a: Avatar, overrides: SlotOverrides = {}): BriqueSlot[] {
  return SLOT_IDS.avatar.map((id) => makeSlot(id, avatarTemplate(a, id), overrides[id]));
}

export function slotsForAngle(a: Angle, overrides: SlotOverrides = {}): BriqueSlot[] {
  return SLOT_IDS.angle.map((id) => makeSlot(id, angleTemplate(a, id), overrides[id]));
}

export function slotsForPain(p: PainPoint, overrides: SlotOverrides = {}): BriqueSlot[] {
  return SLOT_IDS.pain.map((id) => makeSlot(id, painTemplate(p, id), overrides[id]));
}

export function emptySlotsFor(type: AtelierNodeType, overrides: SlotOverrides = {}): BriqueSlot[] {
  return SLOT_IDS[type].map((id) => makeSlot(id, '', overrides[id]));
}
