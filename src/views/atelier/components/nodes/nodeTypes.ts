import type { NodeTypes } from '@xyflow/react';
import { BriqueNodeCard } from './BriqueNodeCard';
import { NoteNode } from './NoteNode';

// Le même composant BriqueNodeCard gère les 4 types brique via data.type.
// NoteNode est un sticky note libre, hors hiérarchie.
export const NODE_TYPES: NodeTypes = {
  avatar: BriqueNodeCard,
  angle: BriqueNodeCard,
  pain: BriqueNodeCard,
  reel: BriqueNodeCard,
  note: NoteNode,
};
