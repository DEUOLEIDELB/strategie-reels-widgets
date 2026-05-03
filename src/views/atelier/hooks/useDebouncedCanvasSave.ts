import { useEffect, useRef } from 'react';
import type { Edge, Node } from '@xyflow/react';
import { useUpdateAtelier } from '@/shared/hooks/grist';
import {
  serializeCanvasState,
  type AtelierCanvasState,
  type AtelierEdge,
  type AtelierNode,
  type AtelierNodeType,
} from '@/shared/lib/types';
import { useAtelierView } from '../store';

const DEBOUNCE_MS = 1000;

function rfToCanvas(nodes: Node[], edges: Edge[]): AtelierCanvasState {
  const cleanNodes: AtelierNode[] = nodes.map((n) => {
    const d = n.data as {
      briqueId?: number;
      label?: string;
      overrides?: Record<string, string>;
      labelOverride?: string;
    };
    return {
      id: n.id,
      type: (n.type as AtelierNodeType) ?? 'avatar',
      position: { x: Math.round(n.position.x), y: Math.round(n.position.y) },
      data: {
        briqueId: Number(d?.briqueId ?? 0),
        label: String(d?.label ?? ''),
        overrides: d?.overrides && Object.keys(d.overrides).length > 0 ? d.overrides : undefined,
        labelOverride: d?.labelOverride,
      },
    };
  });
  const cleanEdges: AtelierEdge[] = edges.map((e) => ({
    id: e.id,
    source: e.source,
    target: e.target,
  }));
  return { nodes: cleanNodes, edges: cleanEdges };
}

interface Options {
  atelierId: number | null;
  nodes: Node[];
  edges: Edge[];
  enabled: boolean;
}

export function useDebouncedCanvasSave({ atelierId, nodes, edges, enabled }: Options) {
  const update = useUpdateAtelier();
  const setLastSavedSnapshot = useAtelierView((s) => s.setLastSavedSnapshot);
  const timer = useRef<number | null>(null);
  const lastFlushed = useRef<string>('');

  useEffect(() => {
    if (!enabled || atelierId === null) return;
    const state = rfToCanvas(nodes, edges);
    const payload = serializeCanvasState(state);
    if (payload === lastFlushed.current) return;

    if (timer.current !== null) window.clearTimeout(timer.current);
    timer.current = window.setTimeout(() => {
      lastFlushed.current = payload;
      setLastSavedSnapshot(payload);
      update.mutate({ id: atelierId, fields: { canvas_state: payload } });
    }, DEBOUNCE_MS);

    return () => {
      if (timer.current !== null) window.clearTimeout(timer.current);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [atelierId, nodes, edges, enabled]);

  useEffect(() => {
    lastFlushed.current = '';
  }, [atelierId]);
}
