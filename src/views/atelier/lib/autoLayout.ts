import dagre from 'dagre';
import type { Edge, Node } from '@xyflow/react';
import { isBriqueNode } from './nodeFactory';
import { computeSlotsForNode, type BriquesDataSnapshot } from './computeSlots';

const NODE_WIDTH = 300;
// Hauteur de base : header (18px) + marges + titre (~32px) + padding ≈ 90px.
// Chaque slot row ≈ 40px (label + 2 lignes de texte + bordures + gap).
const HEIGHT_BASE = 90;
const HEIGHT_PER_ROW = 42;

function estimateHeight(node: Node, briques: BriquesDataSnapshot | undefined): number {
  if (!briques) {
    // Fallback : 3 slots, 1 variante chacun
    return HEIGHT_BASE + 3 * HEIGHT_PER_ROW;
  }
  const slots = computeSlotsForNode(node, briques);
  // Pour chaque slot : 1 row si pas de variantes, sinon variants.length rows
  const totalRows = slots.reduce((sum, s) => sum + Math.max(s.variants.length, 1), 0);
  return HEIGHT_BASE + Math.max(totalRows, 3) * HEIGHT_PER_ROW;
}

/**
 * Auto-layout en cascade orientée G→D pour les briques uniquement.
 * Les nodes freeform (notes, frames, texte) sont laissés à leur position actuelle.
 * Hauteur estimée selon le nombre de variantes affichées sur chaque card.
 */
export function autoLayout<T extends Node>(
  nodes: T[],
  edges: Edge[],
  briques?: BriquesDataSnapshot,
): T[] {
  if (nodes.length === 0) return nodes;

  const briqueNodes = nodes.filter((n) => isBriqueNode(n));
  if (briqueNodes.length === 0) return nodes;

  const briqueIds = new Set(briqueNodes.map((n) => n.id));
  const briqueEdges = edges.filter((e) => briqueIds.has(e.source) && briqueIds.has(e.target));

  const g = new dagre.graphlib.Graph();
  g.setDefaultEdgeLabel(() => ({}));
  g.setGraph({ rankdir: 'LR', nodesep: 80, ranksep: 130, marginx: 32, marginy: 32 });

  briqueNodes.forEach((n) => {
    const height = estimateHeight(n, briques);
    g.setNode(n.id, { width: NODE_WIDTH, height });
  });
  briqueEdges.forEach((e) => g.setEdge(e.source, e.target));

  dagre.layout(g);

  return nodes.map((n) => {
    if (!isBriqueNode(n)) return n; // freeform : on ne touche pas à la position
    const dn = g.node(n.id);
    if (!dn) return n;
    const height = estimateHeight(n, briques);
    return {
      ...n,
      position: { x: dn.x - NODE_WIDTH / 2, y: dn.y - height / 2 },
    };
  });
}
