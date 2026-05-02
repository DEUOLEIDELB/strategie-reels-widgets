import type { NodeTypes } from '@xyflow/react';
import { BriqueNodeCard } from './BriqueNodeCard';

// Le même composant gère les 4 types via data.type. Le mapping ci-dessous évite à React Flow de
// râler sur les types inconnus, et permettra plus tard de spécialiser un type sans casser les autres.
export const NODE_TYPES: NodeTypes = {
  avatar: BriqueNodeCard,
  angle: BriqueNodeCard,
  pain: BriqueNodeCard,
  reel: BriqueNodeCard,
};
