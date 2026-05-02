import dagre from 'dagre';
import type { Edge, Node } from '@xyflow/react';

const NODE_WIDTH = 240;
const NODE_HEIGHT = 120;

export function autoLayout<T extends Node>(nodes: T[], edges: Edge[]): T[] {
  if (nodes.length === 0) return nodes;
  const g = new dagre.graphlib.Graph();
  g.setDefaultEdgeLabel(() => ({}));
  g.setGraph({ rankdir: 'LR', nodesep: 60, ranksep: 110, marginx: 24, marginy: 24 });

  nodes.forEach((n) => g.setNode(n.id, { width: NODE_WIDTH, height: NODE_HEIGHT }));
  edges.forEach((e) => g.setEdge(e.source, e.target));

  dagre.layout(g);

  return nodes.map((n) => {
    const dn = g.node(n.id);
    if (!dn) return n;
    return {
      ...n,
      position: { x: dn.x - NODE_WIDTH / 2, y: dn.y - NODE_HEIGHT / 2 },
    };
  });
}
