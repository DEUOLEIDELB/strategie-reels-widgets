import { create } from 'zustand';
import type { Edge, Node } from '@xyflow/react';
import type { AtelierNodeType } from '@/shared/lib/types';
import { autoLayout } from './lib/autoLayout';
import { buildEdge, buildNode } from './lib/nodeFactory';

interface PendingAddChild {
  parentNodeId: string;
  childType: AtelierNodeType;
}

interface AddBriqueOptions {
  position?: { x: number; y: number };
  parentNodeId?: string;
}

interface AtelierViewStore {
  nodes: Node[];
  edges: Edge[];
  setGraph: (nodes: Node[], edges: Edge[]) => void;
  setNodes: (updater: (prev: Node[]) => Node[]) => void;
  setEdges: (updater: (prev: Edge[]) => Edge[]) => void;
  addBrique: (
    type: AtelierNodeType,
    briqueId: number,
    label: string,
    subtitle: string | undefined,
    options: AddBriqueOptions,
  ) => string;
  removeNode: (nodeId: string) => void;
  relayout: () => void;

  pendingAddChild: PendingAddChild | null;
  requestAddChild: (parentNodeId: string, childType: AtelierNodeType) => void;
  clearPendingAddChild: () => void;

  openedBriqueDrawer: { type: AtelierNodeType; briqueId: number } | null;
  openBriqueDrawer: (type: AtelierNodeType, briqueId: number) => void;
  closeBriqueDrawer: () => void;
}

const HORIZONTAL_OFFSET = 280;
const VERTICAL_SPREAD = 140;

function positionForChild(parent: Node, existingChildren: Node[]): { x: number; y: number } {
  // On empile vers le bas si plusieurs enfants déjà posés sur le même parent.
  const baseX = parent.position.x + HORIZONTAL_OFFSET;
  const baseY = parent.position.y + existingChildren.length * VERTICAL_SPREAD;
  return { x: baseX, y: baseY };
}

export const useAtelierView = create<AtelierViewStore>((set, get) => ({
  nodes: [],
  edges: [],

  setGraph: (nodes, edges) => set({ nodes, edges }),

  setNodes: (updater) => set((s) => ({ nodes: updater(s.nodes) })),

  setEdges: (updater) => set((s) => ({ edges: updater(s.edges) })),

  addBrique: (type, briqueId, label, subtitle, options) => {
    const { nodes, edges } = get();
    let position = options.position;
    if (!position && options.parentNodeId) {
      const parent = nodes.find((n) => n.id === options.parentNodeId);
      if (parent) {
        const siblings = edges
          .filter((e) => e.source === options.parentNodeId)
          .map((e) => nodes.find((n) => n.id === e.target))
          .filter((n): n is Node => Boolean(n));
        position = positionForChild(parent, siblings);
      }
    }
    if (!position) {
      // Fallback : empile à droite des nodes existants pour ne pas spawner sur les autres.
      const maxX = nodes.reduce((m, n) => Math.max(m, n.position.x), -Infinity);
      const baseX = Number.isFinite(maxX) ? maxX + HORIZONTAL_OFFSET : 0;
      position = { x: baseX, y: 0 };
    }
    const node = buildNode(type, briqueId, label, subtitle, position);
    const nextEdges = options.parentNodeId
      ? [...edges, buildEdge(options.parentNodeId, node.id)]
      : edges;
    set({ nodes: [...nodes, node], edges: nextEdges });
    return node.id;
  },

  removeNode: (nodeId) => {
    set((s) => ({
      nodes: s.nodes.filter((n) => n.id !== nodeId),
      edges: s.edges.filter((e) => e.source !== nodeId && e.target !== nodeId),
    }));
  },

  relayout: () => {
    set((s) => ({ nodes: autoLayout(s.nodes, s.edges) }));
  },

  pendingAddChild: null,
  requestAddChild: (parentNodeId, childType) => set({ pendingAddChild: { parentNodeId, childType } }),
  clearPendingAddChild: () => set({ pendingAddChild: null }),

  openedBriqueDrawer: null,
  openBriqueDrawer: (type, briqueId) => set({ openedBriqueDrawer: { type, briqueId } }),
  closeBriqueDrawer: () => set({ openedBriqueDrawer: null }),
}));
