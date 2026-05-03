import type { NodeTypes } from '@xyflow/react';
import { BriqueNodeCard } from './BriqueNodeCard';
import { NoteNode } from './NoteNode';
import { FrameNode } from './FrameNode';
import { TextNode } from './TextNode';

// Le même composant BriqueNodeCard gère les 4 types brique via data.type.
// Note / Frame / Text sont des outils freeform hors hiérarchie pédagogique.
export const NODE_TYPES: NodeTypes = {
  avatar: BriqueNodeCard,
  angle: BriqueNodeCard,
  pain: BriqueNodeCard,
  reel: BriqueNodeCard,
  note: NoteNode,
  frame: FrameNode,
  text: TextNode,
};
