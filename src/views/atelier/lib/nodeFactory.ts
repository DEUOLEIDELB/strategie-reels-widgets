import type { Node, Edge } from '@xyflow/react';
import type { AtelierNodeType } from '@/shared/lib/types';
import type { BriqueSlot, SlotOverrides } from './briqueSlots';

export interface BriqueNodeData extends Record<string, unknown> {
  briqueId: number;
  type: AtelierNodeType;
  label: string;
  subtitle?: string;
  slots?: BriqueSlot[];
  // Overrides locaux : ne touchent ni le template Grist ni les autres instances.
  // V1.6 : multi-variantes par slot (string[]). Rétrocompat string accepté à la lecture.
  overrides?: SlotOverrides;
  // Override du label (titre affiché sur la card). Si non set, on utilise le label hydraté du template.
  labelOverride?: string;
}

export interface NoteNodeData extends Record<string, unknown> {
  content: string;
  color?: string;
}

export type BriqueNode = Node<BriqueNodeData>;

// Le nodeId est désormais une instance unique. La même brique peut être posée plusieurs fois
// sur le canvas, chaque instance a son propre nodeId. La traçabilité Grist se fait via data.briqueId.
let counter = 0;
function shortId(): string {
  counter = (counter + 1) % 1_000_000;
  return Date.now().toString(36).slice(-4) + counter.toString(36);
}

export function makeNodeId(type: AtelierNodeType, briqueId: number): string {
  return `${type}-${briqueId}-${shortId()}`;
}

export function buildNode(
  type: AtelierNodeType,
  briqueId: number,
  label: string,
  subtitle?: string,
  position: { x: number; y: number } = { x: 0, y: 0 },
): BriqueNode {
  return {
    id: makeNodeId(type, briqueId),
    type,
    position,
    data: { briqueId, type, label, subtitle },
  };
}

export function buildEdge(sourceId: string, targetId: string): Edge {
  return {
    id: `${sourceId}->${targetId}`,
    source: sourceId,
    target: targetId,
    type: 'deletable',
    animated: false,
  };
}

// Hiérarchie autorisée : avatar → angle → pain → reel.
const HIERARCHY: Record<AtelierNodeType, AtelierNodeType | null> = {
  avatar: 'angle',
  angle: 'pain',
  pain: 'reel',
  reel: null,
};

export function nextLevelOf(type: AtelierNodeType): AtelierNodeType | null {
  return HIERARCHY[type];
}

export function canConnect(sourceType: AtelierNodeType, targetType: AtelierNodeType): boolean {
  return HIERARCHY[sourceType] === targetType;
}

// Compte les instances posées sur le canvas pour un (type, briqueId) donné.
export function countInstances(
  nodes: Node[],
  type: AtelierNodeType,
  briqueId: number,
): number {
  return nodes.filter((n) => {
    if (n.type !== type) return false;
    const data = n.data as { briqueId?: number } | undefined;
    return data?.briqueId === briqueId;
  }).length;
}

let freeformCounter = 0;
function makeFreeformId(prefix: string): string {
  freeformCounter = (freeformCounter + 1) % 1_000_000;
  return `${prefix}-${Date.now().toString(36).slice(-4)}${freeformCounter.toString(36)}`;
}

export function buildNoteNode(content: string, position: { x: number; y: number }, color?: string) {
  return {
    id: makeFreeformId('note'),
    type: 'note' as const,
    position,
    data: { content, color },
  };
}

export function buildFrameNode(
  position: { x: number; y: number },
  options: { width?: number; height?: number; color?: string; borderWidth?: number; content?: string } = {},
) {
  return {
    id: makeFreeformId('frame'),
    type: 'frame' as const,
    position,
    width: options.width ?? 320,
    height: options.height ?? 220,
    data: {
      content: options.content ?? '',
      color: options.color ?? '#5914D0',
      borderWidth: options.borderWidth ?? 2,
    },
  };
}

export function buildTextNode(
  position: { x: number; y: number },
  options: { content?: string; color?: string; fontSize?: number } = {},
) {
  return {
    id: makeFreeformId('text'),
    type: 'text' as const,
    position,
    data: {
      content: options.content ?? '',
      color: options.color ?? '#191919',
      fontSize: options.fontSize ?? 14,
    },
  };
}

export function isBriqueNode(node: Node): boolean {
  const t = node.type;
  return t === 'avatar' || t === 'angle' || t === 'pain' || t === 'reel';
}

export function isFreeformNode(node: Node): boolean {
  const t = node.type;
  return t === 'note' || t === 'frame' || t === 'text';
}
