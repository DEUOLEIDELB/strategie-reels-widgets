import { useState } from 'react';
import { Plus, Copy, Pencil, Trash2, LayoutDashboard, StickyNote, Square, Type } from 'lucide-react';
import toast from 'react-hot-toast';
import { useReactFlow } from '@xyflow/react';
import { Button, Select, ConfirmDialog, Tooltip } from '@/shared/components';
import {
  useAteliers,
  useDeleteAtelier,
  useDuplicateAtelier,
  useAvatars,
  useAngles,
  usePainPoints,
  useReels,
} from '@/shared/hooks/grist';
import { useAppStore } from '@/shared/store';
import type { Atelier } from '@/shared/lib/types';
import { CreateAtelierModal } from './modals/CreateAtelierModal';
import { RenameAtelierModal } from './modals/RenameAtelierModal';
import { useAtelierView } from '../store';

interface Props {
  current: Atelier | null;
}

export function AtelierHeader({ current }: Props) {
  const ateliers = useAteliers();
  const setCurrentAtelier = useAppStore((s) => s.setCurrentAtelier);
  const duplicate = useDuplicateAtelier();
  const del = useDeleteAtelier();
  const relayout = useAtelierView((s) => s.relayout);
  const activeTool = useAtelierView((s) => s.activeTool);
  const toggleActiveTool = useAtelierView((s) => s.toggleActiveTool);
  const rf = useReactFlow();

  // Briques pour estimer la hauteur correcte des cards lors du relayout
  const avatars = useAvatars();
  const angles = useAngles();
  const pains = usePainPoints();
  const reels = useReels();
  const handleRelayout = () => {
    relayout({
      avatars: avatars.data ?? [],
      angles: angles.data ?? [],
      pains: pains.data ?? [],
      reels: reels.data ?? [],
    });
    setTimeout(() => rf.fitView({ padding: 0.2, duration: 250 }), 80);
  };


  const [createOpen, setCreateOpen] = useState(false);
  const [renameOpen, setRenameOpen] = useState(false);
  const [deleteOpen, setDeleteOpen] = useState(false);

  const handleSwitch = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const id = Number(e.target.value);
    if (Number.isFinite(id) && id > 0) setCurrentAtelier(id);
  };

  const handleDuplicate = async () => {
    if (!current) return;
    try {
      const id = await duplicate.mutateAsync(current);
      setCurrentAtelier(id);
      toast.success('Atelier dupliqué.');
    } catch (e) {
      toast.error(e instanceof Error ? e.message : 'Erreur duplication');
    }
  };

  const handleDelete = async () => {
    if (!current) return;
    try {
      await del.mutateAsync(current.id);
      // Bascule sur un autre atelier dispo, ou null
      const remaining = (ateliers.data ?? []).filter((a) => a.id !== current.id);
      setCurrentAtelier(remaining.length > 0 ? remaining[0].id : null);
      toast.success('Atelier supprimé.');
    } catch (e) {
      toast.error(e instanceof Error ? e.message : 'Erreur suppression');
    }
  };

  const list = ateliers.data ?? [];

  return (
    <>
      <header className="h-11 shrink-0 flex items-center gap-2 px-3 border-b border-border bg-surface-two">
        <LayoutDashboard size={14} className="text-current shrink-0" />

        {list.length > 0 ? (
          <Select
            size="sm"
            value={current?.id ?? ''}
            onChange={handleSwitch}
            className="min-w-[220px] max-w-[340px]"
          >
            {list.map((a) => (
              <option key={a.id} value={a.id}>
                {a.nom || `Atelier #${a.id}`}
              </option>
            ))}
          </Select>
        ) : (
          <span className="text-xs text-text-faint italic">Aucun atelier</span>
        )}

        <Button variant="primary" size="sm" onClick={() => setCreateOpen(true)}>
          <Plus size={12} />
          Nouveau
        </Button>

        {current && (
          <>
            <Tooltip content="Renommer">
              <Button variant="ghost" size="sm" onClick={() => setRenameOpen(true)}>
                <Pencil size={12} />
              </Button>
            </Tooltip>

            <Tooltip content="Dupliquer (fork)">
              <Button variant="ghost" size="sm" onClick={handleDuplicate} loading={duplicate.isPending}>
                <Copy size={12} />
              </Button>
            </Tooltip>

            <Tooltip content="Réorganiser le canvas (ignore notes/cadres/textes)">
              <Button variant="ghost" size="sm" onClick={handleRelayout}>
                <LayoutDashboard size={12} />
              </Button>
            </Tooltip>

            <Tooltip content={activeTool === 'note' ? 'Click sur le canvas pour poser la note' : 'Sélectionner outil note (puis click sur canvas)'}>
              <Button
                variant={activeTool === 'note' ? 'primary' : 'ghost'}
                size="sm"
                onClick={() => toggleActiveTool('note')}
              >
                <StickyNote size={12} />
              </Button>
            </Tooltip>

            <Tooltip content={activeTool === 'frame' ? 'Click sur le canvas pour poser le cadre' : 'Sélectionner outil cadre'}>
              <Button
                variant={activeTool === 'frame' ? 'primary' : 'ghost'}
                size="sm"
                onClick={() => toggleActiveTool('frame')}
              >
                <Square size={12} />
              </Button>
            </Tooltip>

            <Tooltip content={activeTool === 'text' ? 'Click sur le canvas pour poser le texte' : 'Sélectionner outil texte'}>
              <Button
                variant={activeTool === 'text' ? 'primary' : 'ghost'}
                size="sm"
                onClick={() => toggleActiveTool('text')}
              >
                <Type size={12} />
              </Button>
            </Tooltip>

            <div className="ml-auto" />

            <Tooltip content="Supprimer">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setDeleteOpen(true)}
                className="text-danger hover:bg-danger-soft"
              >
                <Trash2 size={12} />
              </Button>
            </Tooltip>
          </>
        )}
      </header>

      <CreateAtelierModal open={createOpen} onOpenChange={setCreateOpen} />
      <RenameAtelierModal open={renameOpen} atelier={current} onOpenChange={setRenameOpen} />
      <ConfirmDialog
        open={deleteOpen}
        onOpenChange={setDeleteOpen}
        title="Supprimer cet atelier ?"
        description={`"${current?.nom ?? ''}" sera supprimé. Les briques (avatars, angles, pains, reels) restent intactes — seul le canvas de cet atelier disparaît.`}
        tone="danger"
        confirmLabel="Supprimer"
        onConfirm={handleDelete}
      />
    </>
  );
}
