import type { Node } from '@xyflow/react';
import type {
  Avatar,
  Angle,
  PainPoint,
  Reel,
  AtelierNodeType,
} from '@/shared/lib/types';
import {
  emptySlotsFor,
  slotsForAvatar,
  slotsForAngle,
  slotsForPain,
  slotsForReel,
  type BriqueSlot,
  type SlotOverrides,
} from './briqueSlots';

export interface BriquesDataSnapshot {
  avatars: Avatar[];
  angles: Angle[];
  pains: PainPoint[];
  reels: Reel[];
}

interface NodeDataLike {
  briqueId?: number;
  overrides?: SlotOverrides;
}

/**
 * Calcule les slots d'un node brique à la volée à partir des records Grist + overrides locaux.
 * Source unique : node.data (briqueId + overrides) + records Grist en cache.
 * Déclenche un re-render à chaque changement de overrides ou de records (live).
 */
export function computeSlotsForNode(node: Node, briques: BriquesDataSnapshot): BriqueSlot[] {
  const data = (node.data ?? {}) as NodeDataLike;
  const briqueId = Number(data.briqueId ?? 0);
  const overrides = data.overrides ?? {};
  const type = node.type as AtelierNodeType | undefined;

  if (type === 'avatar') {
    const a = briques.avatars.find((x) => x.id === briqueId);
    return a ? slotsForAvatar(a, overrides) : emptySlotsFor('avatar', overrides);
  }
  if (type === 'angle') {
    const a = briques.angles.find((x) => x.id === briqueId);
    return a ? slotsForAngle(a, overrides) : emptySlotsFor('angle', overrides);
  }
  if (type === 'pain') {
    const p = briques.pains.find((x) => x.id === briqueId);
    return p ? slotsForPain(p, overrides) : emptySlotsFor('pain', overrides);
  }
  if (type === 'reel') {
    const r = briques.reels.find((x) => x.id === briqueId);
    return r ? slotsForReel(r, overrides) : emptySlotsFor('reel', overrides);
  }
  return [];
}

/**
 * Calcule label + subtitle d'un node à partir des records Grist + labelOverride.
 */
export function computeBriqueDisplay(
  node: Node,
  briques: BriquesDataSnapshot,
): { label: string; subtitle?: string; templateLabel: string } {
  const data = (node.data ?? {}) as { briqueId?: number; labelOverride?: string };
  const briqueId = Number(data.briqueId ?? 0);
  const type = node.type as AtelierNodeType | undefined;

  let templateLabel = '';
  let subtitle: string | undefined;

  if (type === 'avatar') {
    const a = briques.avatars.find((x) => x.id === briqueId);
    if (a) {
      templateLabel = a.prenom || `Avatar #${a.id}`;
      subtitle = [a.age_range, a.lieu].filter(Boolean).join(' · ');
    }
  } else if (type === 'angle') {
    const a = briques.angles.find((x) => x.id === briqueId);
    if (a) {
      templateLabel = a.nom || `Angle #${a.id}`;
      subtitle = a.cible_primaire;
    }
  } else if (type === 'pain') {
    const p = briques.pains.find((x) => x.id === briqueId);
    if (p) {
      templateLabel = p.titre || `Pain #${p.id}`;
      subtitle = p.frequence_vecue;
    }
  } else if (type === 'reel') {
    const r = briques.reels.find((x) => x.id === briqueId);
    if (r) {
      templateLabel = r.titre || `Reel #${r.id}`;
      subtitle = [r.statut, r.duree_sec ? `${r.duree_sec}s` : null].filter(Boolean).join(' · ');
    }
  }

  const label = data.labelOverride && data.labelOverride.length > 0 ? data.labelOverride : templateLabel;
  return { label, subtitle, templateLabel };
}
