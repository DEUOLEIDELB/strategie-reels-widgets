import type { Node, Edge } from '@xyflow/react';
import type { AtelierNodeType } from '@/shared/lib/types';

export interface BriqueNodeData extends Record<string, unknown> {
  briqueId: number;
  type: AtelierNodeType;
  label: string;
  subtitle?: string;
}

export type BriqueNode = Node<BriqueNodeData>;

export function makeNodeId(type: AtelierNodeType, briqueId: number): string {
  return `${type}-${briqueId}`;
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
    type: 'smoothstep',
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
