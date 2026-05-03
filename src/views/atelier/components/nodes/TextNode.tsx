import { memo, useEffect, useState } from 'react';
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

  const color = data.color ?? '#191919';
  const fontSize = data.fontSize ?? 14;

  return (
    <div
      className={cn(
        'relative min-w-[120px] max-w-[480px] px-1 py-0.5',
        selected ? 'ring-1 ring-current ring-offset-1' : '',
      )}
    >
      {/* Toolbar visible quand selected */}
      {selected && (
        <div
          className="absolute -top-9 left-0 z-10 inline-flex items-center gap-1 px-1.5 py-1 rounded-sm bg-surface border border-border-strong shadow-sm nodrag"
          onClick={(e) => e.stopPropagation()}
        >
          <Type size={11} className="text-text-faint" />
          {/* Couleur */}
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
          {/* Taille */}
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

      <textarea
        value={content}
        onChange={(e) => setContent(e.target.value)}
        onBlur={() => {
          if (content !== (data.content ?? '')) setNoteContent(id, content);
        }}
        placeholder="Texte libre..."
        className="w-full bg-transparent border-0 resize-none focus:outline-none focus:ring-0 leading-tight nodrag"
        style={{ color, fontSize: `${fontSize}px`, fontWeight: fontSize >= 24 ? 700 : 500 }}
        rows={1}
      />
    </div>
  );
}

export const TextNode = memo(TextNodeImpl);
