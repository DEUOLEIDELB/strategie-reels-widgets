import '@xyflow/react/dist/style.css';
import { useCallback, useEffect, useMemo, useRef } from 'react';
import {
  Background,
  BackgroundVariant,
  Controls,
  MiniMap,
  ReactFlow,
  ReactFlowProvider,
  addEdge,
  applyEdgeChanges,
  applyNodeChanges,
  useReactFlow,
  type Connection,
  type Edge,
  type EdgeChange,
  type Node,
  type NodeChange,
  type OnConnect,
} from '@xyflow/react';
import toast from 'react-hot-toast';
import { Sparkles } from 'lucide-react';
import { EmptyState } from '@/shared/components';
import {
  parseCanvasState,
  type Atelier,
  type AtelierNodeType,
} from '@/shared/lib/types';
import { useAvatars, useAngles, usePainPoints, useReels } from '@/shared/hooks/grist';
import { canConnect, nextLevelOf } from '../lib/nodeFactory';
import { slotsForAvatar, slotsForAngle, slotsForPain, slotsForReel, emptySlotsFor } from '../lib/briqueSlots';
import { NODE_TYPES } from './nodes/nodeTypes';
import { NodeCallbacksProvider } from './nodes/NodeCallbacksContext';
import { DeletableEdge } from './edges/DeletableEdge';
import { useDebouncedCanvasSave } from '../hooks/useDebouncedCanvasSave';
import { useAtelierView } from '../store';

const EDGE_TYPES = { deletable: DeletableEdge };

interface DragPayload {
  type: AtelierNodeType;
  briqueId: number;
  label: string;
  subtitle?: string;
}

function readDragPayload(event: React.DragEvent): DragPayload | null {
  const raw = event.dataTransfer.getData('application/atelier-brique');
  if (!raw) return null;
  try {
    const parsed = JSON.parse(raw) as DragPayload;
    if (!parsed.type || typeof parsed.briqueId !== 'number') return null;
    return parsed;
  } catch {
    return null;
  }
}

interface Props {
  atelier: Atelier;
}

function CanvasInner({ atelier }: Props) {
  const nodes = useAtelierView((s) => s.nodes);
  const edges = useAtelierView((s) => s.edges);
  const setGraph = useAtelierView((s) => s.setGraph);
  const setNodes = useAtelierView((s) => s.setNodes);
  const setEdges = useAtelierView((s) => s.setEdges);
  const removeNode = useAtelierView((s) => s.removeNode);
  const requestAddChild = useAtelierView((s) => s.requestAddChild);
  const addBrique = useAtelierView((s) => s.addBrique);
  const openBriqueDrawer = useAtelierView((s) => s.openBriqueDrawer);
  const setLastSavedSnapshot = useAtelierView((s) => s.setLastSavedSnapshot);

  const rf = useReactFlow();
  const wrapperRef = useRef<HTMLDivElement>(null);
  const idRef = useRef<number>(-1);

  // Charge le canvas UNE FOIS au switch d'atelier (atelier.id change).
  // Note V1.5 : on ne réagit plus au changement de canvas_state distant (polling) pour eviter
  // les ecrasements intempestifs pendant l'edition. Le multi-user canvas live est trade-off
  // contre la stabilite. Pour voir un canvas modifie par un autre user : switch puis revient
  // sur l'atelier, ou recharge la page.
  // Les TEMPLATES (avatars/angles/pains/reels) restent rafraichis en live → tu vois les modifs
  // de contenu que d'autres users font sur les briques sans reloader le canvas.
  // eslint-disable-next-line react-hooks/exhaustive-deps
  useEffect(() => {
    const remote = atelier.canvas_state ?? '';
    const state = parseCanvasState(remote);
    const initialNodes: Node[] = state.nodes.map((n) => ({
      id: n.id,
      type: n.type,
      position: n.position,
      data: {
        briqueId: n.data.briqueId,
        type: n.type,
        label: n.data.label,
        overrides: n.data.overrides,
        labelOverride: n.data.labelOverride,
      },
    }));
    const initialEdges: Edge[] = state.edges.map((e) => ({
      id: e.id,
      source: e.source,
      target: e.target,
      type: 'deletable',
    }));
    setGraph(initialNodes, initialEdges);
    setLastSavedSnapshot(remote || null);
    idRef.current = atelier.id;
    const t = window.setTimeout(() => rf.fitView({ padding: 0.2, duration: 250 }), 60);
    return () => window.clearTimeout(t);
  }, [atelier.id]);

  const { data: avatars } = useAvatars();
  const { data: angles } = useAngles();
  const { data: pains } = usePainPoints();
  const { data: reels } = useReels();

  // Hydrate les labels, subtitles et slots depuis Grist (template) en respectant les overrides locaux.
  useEffect(() => {
    if (!avatars || !angles || !pains || !reels) return;
    setNodes((prev) =>
      prev.map((n) => {
        const data = n.data as {
          briqueId?: number;
          label?: string;
          overrides?: Record<string, string>;
          labelOverride?: string;
        };
        const briqueId = Number(data?.briqueId ?? 0);
        const nodeType = n.type as AtelierNodeType | undefined;
        const overrides = data?.overrides ?? {};
        let label = String(data?.label ?? '');
        let subtitle: string | undefined;
        let slots = emptySlotsFor(nodeType ?? 'avatar', overrides);
        if (nodeType === 'avatar') {
          const a = avatars.find((x) => x.id === briqueId);
          if (a) {
            label = a.prenom || label;
            subtitle = [a.age_range, a.lieu].filter(Boolean).join(' · ');
            slots = slotsForAvatar(a, overrides);
          }
        } else if (nodeType === 'angle') {
          const a = angles.find((x) => x.id === briqueId);
          if (a) {
            label = a.nom || label;
            subtitle = a.cible_primaire;
            slots = slotsForAngle(a, overrides);
          }
        } else if (nodeType === 'pain') {
          const p = pains.find((x) => x.id === briqueId);
          if (p) {
            label = p.titre || label;
            subtitle = p.frequence_vecue;
            slots = slotsForPain(p, overrides);
          }
        } else if (nodeType === 'reel') {
          const r = reels.find((x) => x.id === briqueId);
          if (r) {
            label = r.titre || label;
            subtitle = [r.statut, r.duree_sec ? `${r.duree_sec}s` : null].filter(Boolean).join(' · ');
            slots = slotsForReel(r, overrides);
          }
        }
        return { ...n, data: { ...n.data, label, subtitle, slots } };
      }),
    );
  }, [avatars, angles, pains, reels, setNodes]);

  const onNodesChange = useCallback(
    (changes: NodeChange[]) => setNodes((nds) => applyNodeChanges(changes, nds)),
    [setNodes],
  );

  const onEdgesChange = useCallback(
    (changes: EdgeChange[]) => setEdges((eds) => applyEdgeChanges(changes, eds)),
    [setEdges],
  );

  const onConnect: OnConnect = useCallback(
    (connection: Connection) => {
      if (!connection.source || !connection.target) return;
      const src = nodes.find((n) => n.id === connection.source);
      const tgt = nodes.find((n) => n.id === connection.target);
      if (!src || !tgt) return;
      if (!canConnect(src.type as AtelierNodeType, tgt.type as AtelierNodeType)) {
        toast.error('Cascade : avatar → angle → pain → reel uniquement.');
        return;
      }
      setEdges((eds) => addEdge({ ...connection, type: 'deletable' }, eds));
    },
    [nodes, setEdges],
  );

  const handleAddChild = useCallback(
    (parentNodeId: string) => {
      const parent = nodes.find((n) => n.id === parentNodeId);
      if (!parent || !parent.type) return;
      const childType = nextLevelOf(parent.type as AtelierNodeType);
      if (!childType) return;
      requestAddChild(parentNodeId, childType);
    },
    [nodes, requestAddChild],
  );

  const callbacks = useMemo(
    () => ({ onAddChild: handleAddChild, onRemove: removeNode, onOpenDrawer: openBriqueDrawer }),
    [handleAddChild, removeNode, openBriqueDrawer],
  );

  const onDragOver = useCallback((event: React.DragEvent) => {
    event.preventDefault();
    event.dataTransfer.dropEffect = 'copy';
  }, []);

  const onDrop = useCallback(
    (event: React.DragEvent) => {
      event.preventDefault();
      const payload = readDragPayload(event);
      if (!payload) return;
      const position = rf.screenToFlowPosition({ x: event.clientX, y: event.clientY });
      addBrique(payload.type, payload.briqueId, payload.label, payload.subtitle, { position });
    },
    [addBrique, rf],
  );

  const onNodeDoubleClick = useCallback(
    (_event: React.MouseEvent, node: Node) => {
      if (!node.type) return;
      openBriqueDrawer(node.id);
    },
    [openBriqueDrawer],
  );

  useDebouncedCanvasSave({ atelierId: atelier.id, nodes, edges, enabled: true });

  return (
    <NodeCallbacksProvider value={callbacks}>
      <div ref={wrapperRef} className="w-full h-full relative" onDragOver={onDragOver} onDrop={onDrop}>
        <ReactFlow
          nodes={nodes}
          edges={edges}
          nodeTypes={NODE_TYPES}
          edgeTypes={EDGE_TYPES}
          onNodesChange={onNodesChange}
          onEdgesChange={onEdgesChange}
          onConnect={onConnect}
          onNodeDoubleClick={onNodeDoubleClick}
          deleteKeyCode={['Delete', 'Backspace']}
          proOptions={{ hideAttribution: true }}
          defaultEdgeOptions={{ type: 'deletable' }}
        >
          <Background variant={BackgroundVariant.Dots} gap={20} size={1.2} color="#D8D2CC" />
          <Controls position="bottom-left" showInteractive={false} />
          <MiniMap pannable zoomable position="bottom-right" maskColor="rgba(244,243,247,0.6)" />
        </ReactFlow>
        {nodes.length === 0 && (
          <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
            <div className="pointer-events-auto">
              <EmptyState
                icon={<Sparkles size={32} />}
                title="Canvas vide"
                description="Glisse un avatar depuis la sidebar à droite pour démarrer la cascade. Tu peux poser la même brique plusieurs fois."
              />
            </div>
          </div>
        )}
      </div>
    </NodeCallbacksProvider>
  );
}

export function CanvasFlow({ atelier }: Props) {
  return (
    <ReactFlowProvider>
      <CanvasInner atelier={atelier} />
    </ReactFlowProvider>
  );
}
