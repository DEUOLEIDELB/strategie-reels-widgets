import { create } from 'zustand';
import type { Edge, Node } from '@xyflow/react';
import type { AtelierNodeType } from '@/shared/lib/types';
import { autoLayout } from './lib/autoLayout';
import { buildEdge, buildNode, makeNodeId } from './lib/nodeFactory';

interface PendingAddChild {
  parentNodeId: string;
  childType: AtelierNodeType;
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
    subtitle?: string,
    parentNodeId?: string,
  ) => { ok: boolean; reason?: 'duplicate' };
  removeNode: (nodeId: string) => void;
  relayout: () => void;

  pendingAddChild: PendingAddChild | null;
  requestAddChild: (parentNodeId: string, childType: AtelierNodeType) => void;
  clearPendingAddChild: () => void;
}

export const useAtelierView = create<AtelierViewStore>((set, get) => ({
  nodes: [],
  edges: [],

  setGraph: (nodes, edges) => set({ nodes, edges }),

  setNodes: (updater) => set((s) => ({ nodes: updater(s.nodes) })),

  setEdges: (updater) => set((s) => ({ edges: updater(s.edges) })),

  addBrique: (type, briqueId, label, subtitle, parentNodeId) => {
    const newId = makeNodeId(type, briqueId);
    const { nodes, edges } = get();
    if (nodes.some((n) => n.id === newId)) {
      return { ok: false, reason: 'duplicate' };
    }
    const node = buildNode(type, briqueId, label, subtitle);
    const nextNodes = [...nodes, node];
    const nextEdges = parentNodeId
      ? edges.some((e) => e.id === buildEdge(parentNodeId, newId).id)
        ? edges
        : [...edges, buildEdge(parentNodeId, newId)]
      : edges;
    set({ nodes: autoLayout(nextNodes, nextEdges), edges: nextEdges });
    return { ok: true };
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
}));
