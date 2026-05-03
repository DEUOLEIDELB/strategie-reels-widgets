import { memo, useEffect, useState } from 'react';
import { type NodeProps, type Node } from '@xyflow/react';
import { Trash2, StickyNote } from 'lucide-react';
import { cn } from '@/shared/lib/utils';
import { useNodeCallbacks } from './NodeCallbacksContext';
import { useAtelierView } from '../../store';

const NOTE_COLORS = [
  { id: 'yellow', bg: 'bg-accent-soft', border: 'border-accent', text: 'text-text', label: 'Jaune' },
  { id: 'violet', bg: 'bg-current-soft', border: 'border-current/40', text: 'text-text', label: 'Violet' },
  { id: 'blue', bg: 'bg-info-soft', border: 'border-info/40', text: 'text-text', label: 'Bleu' },
  { id: 'green', bg: 'bg-success-soft', border: 'border-success/40', text: 'text-text', label: 'Vert' },
  { id: 'pink', bg: 'bg-danger-soft', border: 'border-danger/40', text: 'text-text', label: 'Rose' },
];

function colorOf(id: string | undefined) {
  return NOTE_COLORS.find((c) => c.id === id) ?? NOTE_COLORS[0];
}

interface NoteData extends Record<string, unknown> {
  content?: string;
  color?: string;
}

export type NoteNodeType = Node<NoteData, 'note'>;

function NoteNodeImpl({ id, data, selected }: NodeProps<NoteNodeType>) {
  const { onRemove } = useNodeCallbacks();
  const setNoteContent = useAtelierView((s) => s.setNoteContent);
  const setNodes = useAtelierView((s) => s.setNodes);

  const [content, setContent] = useState(data.content ?? '');
  useEffect(() => setContent(data.content ?? ''), [data.content]);

  const color = colorOf(data.color);

  const cycleColor = () => {
    const idx = NOTE_COLORS.findIndex((c) => c.id === (data.color ?? 'yellow'));
    const next = NOTE_COLORS[(idx + 1) % NOTE_COLORS.length];
    setNodes((prev) =>
      prev.map((n) => (n.id === id ? { ...n, data: { ...n.data, color: next.id } } : n)),
    );
  };

  return (
    <div
      className={cn(
        'relative w-[220px] min-h-[140px] rounded-md border-2 px-3 py-2 shadow-sm',
        color.bg,
        color.border,
        selected ? 'ring-2 ring-current ring-offset-1' : '',
      )}
    >
      <div className="flex items-center gap-1 mb-1">
        <StickyNote size={11} className={cn(color.text, 'opacity-60')} />
        <span className={cn('text-[10px] uppercase tracking-wide font-semibold opacity-60', color.text)}>
          Note
        </span>
        <span className="ml-auto inline-flex items-center gap-0.5">
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              cycleColor();
            }}
            title={`Couleur : ${color.label} (clique pour changer)`}
            className={cn(
              'w-4 h-4 rounded-full border border-text/20 hover:scale-110 transition-transform',
              color.bg,
            )}
          />
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              onRemove(id);
            }}
            className="p-1 rounded-sm text-text-muted hover:bg-danger-soft hover:text-danger transition-colors"
            title="Supprimer la note"
          >
            <Trash2 size={11} />
          </button>
        </span>
      </div>
      <textarea
        value={content}
        onChange={(e) => setContent(e.target.value)}
        onBlur={() => {
          if (content !== (data.content ?? '')) setNoteContent(id, content);
        }}
        placeholder="Note libre..."
        className={cn(
          'w-full bg-transparent border-0 resize-none focus:outline-none focus:ring-0 text-[12px] leading-snug placeholder:opacity-50 nodrag',
          color.text,
        )}
        rows={5}
      />
    </div>
  );
}

export const NoteNode = memo(NoteNodeImpl);
