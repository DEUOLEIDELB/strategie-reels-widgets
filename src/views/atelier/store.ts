import { create } from 'zustand';
import type { Edge, Node } from '@xyflow/react';
import type { AtelierNodeType } from '@/shared/lib/types';
import { autoLayout } from './lib/autoLayout';
import {
  buildEdge,
  buildFrameNode,
  buildNode,
  buildNoteNode,
  buildTextNode,
  type BriqueNodeData,
} from './lib/nodeFactory';
import { normalizeVariants } from './lib/briqueSlots';

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

  // Le drawer est ouvert pour UNE INSTANCE précise (nodeId), pas un type+briqueId
  // — l'édition modifie les overrides de ce node uniquement.
  openedBriqueDrawer: { nodeId: string } | null;
  openBriqueDrawer: (nodeId: string) => void;
  closeBriqueDrawer: () => void;

  // Multi-variantes V1.6 : un slot peut contenir N variantes (ex: 3 hooks différents pour A/B test).
  setNodeVariants: (nodeId: string, slotId: string, variants: string[]) => void;
  addNodeVariant: (nodeId: string, slotId: string, value: string) => void;
  updateNodeVariant: (nodeId: string, slotId: string, index: number, value: string) => void;
  removeNodeVariant: (nodeId: string, slotId: string, index: number) => void;
  reorderNodeVariants: (nodeId: string, slotId: string, fromIndex: number, toIndex: number) => void;
  resetNodeSlot: (nodeId: string, slotId: string) => void;

  setNodeLabelOverride: (nodeId: string, label: string | undefined) => void;

  // Outils freeform : sticky notes, frames, texte libre
  addNote: (position?: { x: number; y: number }) => string;
  addFrame: (position?: { x: number; y: number }) => string;
  addText: (position?: { x: number; y: number }) => string;
  setNoteContent: (nodeId: string, content: string) => void;
  setNodeColor: (nodeId: string, color: string) => void;
  setFrameBorderWidth: (nodeId: string, width: number) => void;
  setTextFontSize: (nodeId: string, size: number) => void;

  // Snapshot du dernier canvas_state pushé vers Grist (ou chargé depuis Grist).
  // Sert à détecter "modif locale en cours" vs "modif distante d'un autre user".
  lastSavedSnapshot: string | null;
  setLastSavedSnapshot: (s: string | null) => void;
}

const HORIZONTAL_OFFSET = 280;
const VERTICAL_SPREAD = 140;

function defaultFreeformPos(nodes: Node[]): { x: number; y: number } {
  // Quand l'appelant ne fournit pas de position, on évite de spawner sur les nodes existants.
  if (nodes.length === 0) return { x: 0, y: 0 };
  const maxX = nodes.reduce((m, n) => Math.max(m, n.position.x), -Infinity);
  const minY = nodes.reduce((m, n) => Math.min(m, n.position.y), Infinity);
  return {
    x: Number.isFinite(maxX) ? maxX + HORIZONTAL_OFFSET + 60 : 0,
    y: Number.isFinite(minY) ? minY : 0,
  };
}

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
  openBriqueDrawer: (nodeId) => set({ openedBriqueDrawer: { nodeId } }),
  closeBriqueDrawer: () => set({ openedBriqueDrawer: null }),

  setNodeVariants: (nodeId, slotId, variants) => {
    const cleaned = variants.filter((v) => typeof v === 'string');
    set((s) => ({
      nodes: s.nodes.map((n) => {
        if (n.id !== nodeId) return n;
        const data = n.data as BriqueNodeData;
        const prevOv = data.overrides ?? {};
        const nextOv = { ...prevOv };
        if (cleaned.length === 0) delete nextOv[slotId];
        else nextOv[slotId] = cleaned;
        return { ...n, data: { ...data, overrides: nextOv } };
      }),
    }));
  },

  addNodeVariant: (nodeId, slotId, value) => {
    set((s) => ({
      nodes: s.nodes.map((n) => {
        if (n.id !== nodeId) return n;
        const data = n.data as BriqueNodeData;
        const prev = normalizeVariants(data.overrides?.[slotId]);
        const next = [...prev, value];
        return {
          ...n,
          data: { ...data, overrides: { ...(data.overrides ?? {}), [slotId]: next } },
        };
      }),
    }));
  },

  updateNodeVariant: (nodeId, slotId, index, value) => {
    set((s) => ({
      nodes: s.nodes.map((n) => {
        if (n.id !== nodeId) return n;
        const data = n.data as BriqueNodeData;
        const prev = normalizeVariants(data.overrides?.[slotId]);
        if (index < 0 || index >= prev.length) return n;
        const next = [...prev];
        next[index] = value;
        return {
          ...n,
          data: { ...data, overrides: { ...(data.overrides ?? {}), [slotId]: next } },
        };
      }),
    }));
  },

  removeNodeVariant: (nodeId, slotId, index) => {
    set((s) => ({
      nodes: s.nodes.map((n) => {
        if (n.id !== nodeId) return n;
        const data = n.data as BriqueNodeData;
        const prev = normalizeVariants(data.overrides?.[slotId]);
        const next = prev.filter((_, i) => i !== index);
        const nextOv = { ...(data.overrides ?? {}) };
        if (next.length === 0) delete nextOv[slotId];
        else nextOv[slotId] = next;
        return { ...n, data: { ...data, overrides: nextOv } };
      }),
    }));
  },

  reorderNodeVariants: (nodeId, slotId, fromIndex, toIndex) => {
    set((s) => ({
      nodes: s.nodes.map((n) => {
        if (n.id !== nodeId) return n;
        const data = n.data as BriqueNodeData;
        const prev = normalizeVariants(data.overrides?.[slotId]);
        if (fromIndex < 0 || fromIndex >= prev.length) return n;
        if (toIndex < 0 || toIndex >= prev.length) return n;
        const next = [...prev];
        const [moved] = next.splice(fromIndex, 1);
        next.splice(toIndex, 0, moved);
        return {
          ...n,
          data: { ...data, overrides: { ...(data.overrides ?? {}), [slotId]: next } },
        };
      }),
    }));
  },

  resetNodeSlot: (nodeId, slotId) => {
    set((s) => ({
      nodes: s.nodes.map((n) => {
        if (n.id !== nodeId) return n;
        const data = n.data as BriqueNodeData;
        const nextOv = { ...(data.overrides ?? {}) };
        delete nextOv[slotId];
        return { ...n, data: { ...data, overrides: nextOv } };
      }),
    }));
  },

  setNodeLabelOverride: (nodeId, label) => {
    set((s) => ({
      nodes: s.nodes.map((n) => {
        if (n.id !== nodeId) return n;
        const data = n.data as BriqueNodeData;
        const trimmed = label?.trim();
        return {
          ...n,
          data: { ...data, labelOverride: trimmed && trimmed.length > 0 ? trimmed : undefined },
        };
      }),
    }));
  },

  addNote: (position) => {
    const { nodes } = get();
    const pos = position ?? defaultFreeformPos(nodes);
    const note = buildNoteNode('', pos, 'yellow');
    set({ nodes: [...nodes, note] });
    return note.id;
  },

  addFrame: (position) => {
    const { nodes } = get();
    const pos = position ?? defaultFreeformPos(nodes);
    const frame = buildFrameNode(pos);
    set({ nodes: [...nodes, frame] });
    return frame.id;
  },

  addText: (position) => {
    const { nodes } = get();
    const pos = position ?? defaultFreeformPos(nodes);
    const text = buildTextNode(pos);
    set({ nodes: [...nodes, text] });
    return text.id;
  },

  setNoteContent: (nodeId, content) => {
    set((s) => ({
      nodes: s.nodes.map((n) => {
        if (n.id !== nodeId) return n;
        const data = n.data as { content?: string };
        return { ...n, data: { ...data, content } };
      }),
    }));
  },

  setNodeColor: (nodeId, color) => {
    set((s) => ({
      nodes: s.nodes.map((n) => {
        if (n.id !== nodeId) return n;
        const data = n.data as { color?: string };
        return { ...n, data: { ...data, color } };
      }),
    }));
  },

  setFrameBorderWidth: (nodeId, width) => {
    set((s) => ({
      nodes: s.nodes.map((n) => {
        if (n.id !== nodeId) return n;
        const data = n.data as { borderWidth?: number };
        return { ...n, data: { ...data, borderWidth: width } };
      }),
    }));
  },

  setTextFontSize: (nodeId, size) => {
    set((s) => ({
      nodes: s.nodes.map((n) => {
        if (n.id !== nodeId) return n;
        const data = n.data as { fontSize?: number };
        return { ...n, data: { ...data, fontSize: size } };
      }),
    }));
  },

  lastSavedSnapshot: null,
  setLastSavedSnapshot: (s) => set({ lastSavedSnapshot: s }),
}));
