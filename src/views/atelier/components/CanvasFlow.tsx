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
  serializeCanvasState,
  type Atelier,
  type AtelierNodeType,
  type AtelierEdge,
  type AtelierNode,
} from '@/shared/lib/types';
import { useAvatars, useAngles, usePainPoints, useReels } from '@/shared/hooks/grist';
import { canConnect, nextLevelOf } from '../lib/nodeFactory';
import { slotsForAvatar, slotsForAngle, slotsForPain, slotsForReel, emptySlotsFor } from '../lib/briqueSlots';
import { NODE_TYPES } from './nodes/nodeTypes';
import { NodeCallbacksProvider } from './nodes/NodeCallbacksContext';
import { useDebouncedCanvasSave } from '../hooks/useDebouncedCanvasSave';
import { useAtelierView } from '../store';

function snapshotOfRf(nodes: Node[], edges: Edge[]): string {
  const n: AtelierNode[] = nodes.map((nd) => ({
    id: nd.id,
    type: (nd.type as AtelierNodeType) ?? 'avatar',
    position: { x: Math.round(nd.position.x), y: Math.round(nd.position.y) },
    data: {
      briqueId: Number((nd.data as { briqueId?: number })?.briqueId ?? 0),
      label: String((nd.data as { label?: string })?.label ?? ''),
    },
  }));
  const e: AtelierEdge[] = edges.map((ed) => ({ id: ed.id, source: ed.source, target: ed.target }));
  return serializeCanvasState({ nodes: n, edges: e });
}

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
  const lastSavedSnapshot = useAtelierView((s) => s.lastSavedSnapshot);
  const setLastSavedSnapshot = useAtelierView((s) => s.setLastSavedSnapshot);

  const rf = useReactFlow();
  const wrapperRef = useRef<HTMLDivElement>(null);
  const idRef = useRef<number>(-1);

  // Hydrate le canvas depuis l'atelier courant. Au changement d'atelier.id : reload + fitView.
  // Au changement de canvas_state (= polling distant) : reload silencieux SI on n'a pas de modif
  // locale en attente (last-write-wins doux : tant que tu édites, on n'écrase pas).
  // eslint-disable-next-line react-hooks/exhaustive-deps
  useEffect(() => {
    const remote = atelier.canvas_state ?? '';
    const idChanged = idRef.current !== atelier.id;

    if (!idChanged) {
      // Modif distante éventuelle : on ne reload que si :
      //  - le state distant n'est pas notre propre save (lastSavedSnapshot)
      //  - notre canvas local est en sync avec lastSavedSnapshot (= pas de modif locale en cours)
      if (remote === lastSavedSnapshot) return;
      const localSnapshot = snapshotOfRf(nodes, edges);
      const localDirty = lastSavedSnapshot !== null && localSnapshot !== lastSavedSnapshot;
      if (localDirty) return; // on garde la version locale, save écrasera tout à l'heure
    }

    const state = parseCanvasState(remote);
    const initialNodes: Node[] = state.nodes.map((n) => ({
      id: n.id,
      type: n.type,
      position: n.position,
      data: { briqueId: n.data.briqueId, type: n.type, label: n.data.label },
    }));
    const initialEdges: Edge[] = state.edges.map((e) => ({
      id: e.id,
      source: e.source,
      target: e.target,
      type: 'smoothstep',
    }));
    setGraph(initialNodes, initialEdges);
    setLastSavedSnapshot(remote || null);

    if (idChanged) {
      idRef.current = atelier.id;
      const t = window.setTimeout(() => rf.fitView({ padding: 0.2, duration: 250 }), 60);
      return () => window.clearTimeout(t);
    }
  }, [atelier.id, atelier.canvas_state]);

  const { data: avatars } = useAvatars();
  const { data: angles } = useAngles();
  const { data: pains } = usePainPoints();
  const { data: reels } = useReels();

  // Hydrate les labels, subtitles et slots depuis Grist (au cas où ils ont changé entre 2 sessions)
  useEffect(() => {
    if (!avatars || !angles || !pains || !reels) return;
    setNodes((prev) =>
      prev.map((n) => {
        const briqueId = Number((n.data as { briqueId?: number })?.briqueId ?? 0);
        const nodeType = n.type as AtelierNodeType | undefined;
        let label = String((n.data as { label?: string })?.label ?? '');
        let subtitle: string | undefined;
        let slots = emptySlotsFor(nodeType ?? 'avatar');
        if (nodeType === 'avatar') {
          const a = avatars.find((x) => x.id === briqueId);
          if (a) {
            label = a.prenom || label;
            subtitle = [a.age_range, a.lieu].filter(Boolean).join(' · ');
            slots = slotsForAvatar(a);
          }
        } else if (nodeType === 'angle') {
          const a = angles.find((x) => x.id === briqueId);
          if (a) {
            label = a.nom || label;
            subtitle = a.cible_primaire;
            slots = slotsForAngle(a);
          }
        } else if (nodeType === 'pain') {
          const p = pains.find((x) => x.id === briqueId);
          if (p) {
            label = p.titre || label;
            subtitle = p.frequence_vecue;
            slots = slotsForPain(p);
          }
        } else if (nodeType === 'reel') {
          const r = reels.find((x) => x.id === briqueId);
          if (r) {
            label = r.titre || label;
            subtitle = [r.statut, r.duree_sec ? `${r.duree_sec}s` : null].filter(Boolean).join(' · ');
            slots = slotsForReel(r);
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
      setEdges((eds) => addEdge({ ...connection, type: 'smoothstep' }, eds));
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
    () => ({ onAddChild: handleAddChild, onRemove: removeNode }),
    [handleAddChild, removeNode],
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
      const briqueId = Number((node.data as { briqueId?: number })?.briqueId ?? 0);
      if (!briqueId) return;
      openBriqueDrawer(node.type as AtelierNodeType, briqueId);
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
          onNodesChange={onNodesChange}
          onEdgesChange={onEdgesChange}
          onConnect={onConnect}
          onNodeDoubleClick={onNodeDoubleClick}
          proOptions={{ hideAttribution: true }}
          defaultEdgeOptions={{ type: 'smoothstep' }}
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
