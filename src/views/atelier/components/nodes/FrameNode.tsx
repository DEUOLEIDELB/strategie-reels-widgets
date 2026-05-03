import { memo, useEffect, useState } from 'react';
import { NodeResizer, type NodeProps, type Node } from '@xyflow/react';
import { Trash2, Square } from 'lucide-react';
import { Tooltip } from '@/shared/components';
import { cn } from '@/shared/lib/utils';
import { useNodeCallbacks } from './NodeCallbacksContext';
import { useAtelierView } from '../../store';

const PRESET_COLORS = [
  { id: 'violet', hex: '#5914D0' },
  { id: 'pink', hex: '#D40272' },
  { id: 'blue', hex: '#1DC1F9' },
  { id: 'green', hex: '#1F8A4A' },
  { id: 'orange', hex: '#B36B00' },
  { id: 'gray', hex: '#6B6B6B' },
];

const BORDER_WIDTHS = [1, 2, 3, 4, 6];

interface FrameData extends Record<string, unknown> {
  content?: string;
  color?: string;
  borderWidth?: number;
}

export type FrameNodeType = Node<FrameData, 'frame'>;

function FrameNodeImpl({ id, data, selected }: NodeProps<FrameNodeType>) {
  const { onRemove } = useNodeCallbacks();
  const setNoteContent = useAtelierView((s) => s.setNoteContent);
  const setNodeColor = useAtelierView((s) => s.setNodeColor);
  const setFrameBorderWidth = useAtelierView((s) => s.setFrameBorderWidth);

  const [content, setContent] = useState(data.content ?? '');
  useEffect(() => setContent(data.content ?? ''), [data.content]);

  const color = data.color ?? '#5914D0';
  const borderWidth = data.borderWidth ?? 2;

  return (
    <>
      <NodeResizer
        isVisible={selected}
        minWidth={120}
        minHeight={80}
        lineClassName="!border-current"
        handleClassName="!bg-current !border-2 !border-surface !w-2.5 !h-2.5 !rounded-sm"
      />

      <div
        className={cn(
          'relative w-full h-full rounded-md bg-transparent flex flex-col',
          selected ? 'shadow-md' : '',
        )}
        style={{
          border: `${borderWidth}px solid ${color}`,
        }}
      >
        {/* Toolbar visible quand selected */}
        {selected && (
          <div
            className="absolute -top-9 left-0 z-10 inline-flex items-center gap-1 px-1.5 py-1 rounded-sm bg-surface border border-border-strong shadow-sm nodrag"
            onClick={(e) => e.stopPropagation()}
          >
            <Square size={11} className="text-text-faint" />
            {/* Couleurs */}
            {PRESET_COLORS.map((c) => (
              <button
                key={c.id}
                type="button"
                onClick={() => setNodeColor(id, c.hex)}
                title={c.id}
                className={cn(
                  'w-4 h-4 rounded-sm border border-text/20 hover:scale-110 transition-transform',
                  color === c.hex ? 'ring-1 ring-text ring-offset-1' : '',
                )}
                style={{ backgroundColor: c.hex }}
              />
            ))}
            <span className="w-px h-4 bg-border mx-0.5" />
            {/* Épaisseur */}
            {BORDER_WIDTHS.map((w) => (
              <button
                key={w}
                type="button"
                onClick={() => setFrameBorderWidth(id, w)}
                title={`Bordure ${w}px`}
                className={cn(
                  'inline-flex items-center justify-center min-w-[20px] h-5 px-1 text-[10px] font-bold rounded-sm transition-colors',
                  borderWidth === w
                    ? 'bg-current text-on-current'
                    : 'text-text-faint hover:bg-surface-alt',
                )}
              >
                {w}
              </button>
            ))}
            <span className="w-px h-4 bg-border mx-0.5" />
            <Tooltip content="Supprimer le cadre">
              <button
                type="button"
                onClick={() => onRemove(id)}
                className="p-1 rounded-sm text-text-muted hover:bg-danger-soft hover:text-danger"
              >
                <Trash2 size={11} />
              </button>
            </Tooltip>
          </div>
        )}

        {/* Label en haut, optionnel */}
        <div className="p-2 flex-1 overflow-hidden">
          <textarea
            value={content}
            onChange={(e) => setContent(e.target.value)}
            onBlur={() => {
              if (content !== (data.content ?? '')) setNoteContent(id, content);
            }}
            placeholder="Titre du cadre (optionnel)..."
            className="w-full bg-transparent border-0 resize-none focus:outline-none focus:ring-0 text-[12px] leading-snug placeholder:text-text-muted nodrag"
            style={{ color }}
            rows={2}
          />
        </div>
      </div>
    </>
  );
}

export const FrameNode = memo(FrameNodeImpl);
