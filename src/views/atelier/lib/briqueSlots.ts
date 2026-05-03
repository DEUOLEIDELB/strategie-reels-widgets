import type { Avatar, Angle, PainPoint, Reel, AtelierNodeType } from '@/shared/lib/types';

// Slots = sous-blocs visibles directement sur la carte du canvas.
// Toujours 3 par type : pour structurer sans surcharger.
//
// Multi-variantes V1.6 :
// Chaque slot peut avoir N "variantes" stockées localement (ex: 3 hooks différents pour le même reel).
// Aucune variante = le slot affiche la valeur du template Grist.
// 1+ variantes = le slot affiche la 1re et indique le compteur des autres.
// Permet l'A/B testing sans dupliquer toute la brique.

export interface BriqueSlot {
  id: string;
  label: string;
  hint: string;
  templateValue: string; // valeur du record Grist
  variants: string[]; // overrides locaux (peut être vide → utilise template)
}

export function effectiveValue(slot: BriqueSlot): string {
  if (slot.variants.length > 0) return slot.variants[0];
  return slot.templateValue;
}

export function isSlotFilled(slot: BriqueSlot): boolean {
  const v = effectiveValue(slot);
  return Boolean(v && v.trim().length > 0);
}

export function isSlotOverridden(slot: BriqueSlot): boolean {
  return slot.variants.length > 0;
}

export function variantCount(slot: BriqueSlot): number {
  return slot.variants.length;
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

// Type stocké dans le canvas_state : peut être string[] (V1.6+) ou string (legacy V1.4-V1.5).
// La normalisation se fait à la lecture.
export type SlotOverrides = Record<string, string[] | string>;

export function normalizeVariants(raw: string[] | string | undefined): string[] {
  if (raw === undefined || raw === null) return [];
  if (Array.isArray(raw)) {
    return raw.filter((v) => typeof v === 'string');
  }
  if (typeof raw === 'string' && raw.length > 0) return [raw];
  return [];
}

export function normalizeOverrides(raw: SlotOverrides | undefined): Record<string, string[]> {
  if (!raw) return {};
  const result: Record<string, string[]> = {};
  for (const k of Object.keys(raw)) {
    const variants = normalizeVariants(raw[k]);
    if (variants.length > 0) result[k] = variants;
  }
  return result;
}

function makeSlot(id: string, templateValue: string, variants: string[]): BriqueSlot {
  return {
    id,
    label: SLOT_LABEL[id] ?? id,
    hint: SLOT_HINT[id] ?? '',
    templateValue: (templateValue ?? '').trim(),
    variants,
  };
}

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
  return SLOT_IDS.reel.map((id) =>
    makeSlot(id, reelTemplate(r, id), normalizeVariants(overrides[id])),
  );
}

export function slotsForAvatar(a: Avatar, overrides: SlotOverrides = {}): BriqueSlot[] {
  return SLOT_IDS.avatar.map((id) =>
    makeSlot(id, avatarTemplate(a, id), normalizeVariants(overrides[id])),
  );
}

export function slotsForAngle(a: Angle, overrides: SlotOverrides = {}): BriqueSlot[] {
  return SLOT_IDS.angle.map((id) =>
    makeSlot(id, angleTemplate(a, id), normalizeVariants(overrides[id])),
  );
}

export function slotsForPain(p: PainPoint, overrides: SlotOverrides = {}): BriqueSlot[] {
  return SLOT_IDS.pain.map((id) =>
    makeSlot(id, painTemplate(p, id), normalizeVariants(overrides[id])),
  );
}

export function emptySlotsFor(type: AtelierNodeType, overrides: SlotOverrides = {}): BriqueSlot[] {
  return SLOT_IDS[type].map((id) => makeSlot(id, '', normalizeVariants(overrides[id])));
}
