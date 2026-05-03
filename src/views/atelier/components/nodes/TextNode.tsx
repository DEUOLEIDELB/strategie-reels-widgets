import { memo, useEffect, useRef, useState } from 'react';
import { type NodeProps, type Node } from '@xyflow/react';
import { Trash2, Type } from 'lucide-react';
import { Tooltip } from '@/shared/components';
import { cn } from '@/shared/lib/utils';
import { useNodeCallbacks } from './NodeCallbacksContext';
import { useAtelierView } from '../../store';

const PRESET_COLORS = [
  { id: 'noir', hex: '#191919' },
  { id: 'violet', hex: '#5914D0' },
  { id: 'pink', hex: '#D40272' },
  { id: 'blue', hex: '#1DC1F9' },
  { id: 'green', hex: '#1F8A4A' },
];

const FONT_SIZES = [12, 14, 18, 24, 32];

interface TextData extends Record<string, unknown> {
  content?: string;
  color?: string;
  fontSize?: number;
}

export type TextNodeType = Node<TextData, 'text'>;

function TextNodeImpl({ id, data, selected }: NodeProps<TextNodeType>) {
  const { onRemove } = useNodeCallbacks();
  const setNoteContent = useAtelierView((s) => s.setNoteContent);
  const setNodeColor = useAtelierView((s) => s.setNodeColor);
  const setTextFontSize = useAtelierView((s) => s.setTextFontSize);

  const [content, setContent] = useState(data.content ?? '');
  useEffect(() => setContent(data.content ?? ''), [data.content]);

  // Mode édition : false par défaut (la card est draggable). True après double-click.
  const [editing, setEditing] = useState(content.length === 0);
  const taRef = useRef<HTMLTextAreaElement>(null);

  // Auto-focus quand on passe en édition
  useEffect(() => {
    if (editing && taRef.current) {
      taRef.current.focus();
      const len = taRef.current.value.length;
      taRef.current.setSelectionRange(len, len);
    }
  }, [editing]);

  // Quand on déselectionne le node, on quitte l'édition
  useEffect(() => {
    if (!selected && editing && content.length > 0) {
      setEditing(false);
    }
  }, [selected, editing, content]);

  const color = data.color ?? '#191919';
  const fontSize = data.fontSize ?? 14;

  return (
    <div
      className={cn(
        'relative min-w-[120px] max-w-[480px] px-1 py-0.5 rounded-sm',
        selected ? 'ring-1 ring-current ring-offset-1' : '',
        editing ? 'bg-surface/40' : 'cursor-grab active:cursor-grabbing',
      )}
      onDoubleClick={(e) => {
        e.stopPropagation();
        setEditing(true);
      }}
    >
      {selected && (
        <div
          className="absolute -top-9 left-0 z-10 inline-flex items-center gap-1 px-1.5 py-1 rounded-sm bg-surface border border-border-strong shadow-sm nodrag nopan"
          onClick={(e) => e.stopPropagation()}
          onMouseDown={(e) => e.stopPropagation()}
        >
          <Type size={11} className="text-text-faint" />
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
          {FONT_SIZES.map((sz) => (
            <button
              key={sz}
              type="button"
              onClick={() => setTextFontSize(id, sz)}
              title={`${sz}px`}
              className={cn(
                'inline-flex items-center justify-center min-w-[24px] h-5 px-1 text-[10px] font-bold rounded-sm transition-colors',
                fontSize === sz
                  ? 'bg-current text-on-current'
                  : 'text-text-faint hover:bg-surface-alt',
              )}
            >
              {sz}
            </button>
          ))}
          <span className="w-px h-4 bg-border mx-0.5" />
          <Tooltip content={editing ? 'Cliquer ailleurs pour finir' : 'Double-clic pour éditer'}>
            <span className="text-[10px] text-text-faint italic px-1">
              {editing ? 'éd.' : '↕ drag'}
            </span>
          </Tooltip>
          <Tooltip content="Supprimer">
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

      {editing ? (
        <textarea
          ref={taRef}
          value={content}
          onChange={(e) => setContent(e.target.value)}
          onBlur={() => {
            if (content !== (data.content ?? '')) setNoteContent(id, content);
            if (content.length > 0) setEditing(false);
          }}
          placeholder="Texte libre..."
          className="w-full bg-transparent border-0 resize-none focus:outline-none focus:ring-0 leading-tight nodrag"
          style={{ color, fontSize: `${fontSize}px`, fontWeight: fontSize >= 24 ? 700 : 500 }}
          rows={1}
        />
      ) : (
        <div
          className="w-full leading-tight whitespace-pre-wrap break-words pointer-events-none select-none"
          style={{ color, fontSize: `${fontSize}px`, fontWeight: fontSize >= 24 ? 700 : 500 }}
        >
          {content || (
            <span className="italic opacity-50" style={{ fontSize: `${fontSize}px` }}>
              Texte vide (double-clic pour éditer)
            </span>
          )}
        </div>
      )}
    </div>
  );
}

export const TextNode = memo(TextNodeImpl);
