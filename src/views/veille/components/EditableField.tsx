import { useEffect, useRef, useState } from 'react';
import { Textarea, Input } from '@/shared/components';
import type { TextareaProps, InputProps } from '@/shared/components';

interface BaseProps {
  value: string;
  onSave: (next: string) => void;
  placeholder?: string;
  debounceMs?: number;
}

type EditableTextareaProps = BaseProps & {
  multiline: true;
  rows?: number;
} & Omit<TextareaProps, 'value' | 'onChange'>;

type EditableInputProps = BaseProps & {
  multiline?: false;
} & Omit<InputProps, 'value' | 'onChange'>;

type Props = EditableTextareaProps | EditableInputProps;

// Atome wrapper autour d'un Textarea/Input shared. Autosave debounce.
export function EditableField(props: Props) {
  const { value, onSave, placeholder, debounceMs = 500, multiline, ...rest } = props;
  const [local, setLocal] = useState(value);
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const lastSaved = useRef(value);

  // Sync from outside (e.g. quand la synthèse est rechargée)
  useEffect(() => {
    if (value !== lastSaved.current && value !== local) {
      setLocal(value);
      lastSaved.current = value;
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [value]);

  function scheduleSave(next: string) {
    if (timer.current) clearTimeout(timer.current);
    timer.current = setTimeout(() => {
      if (next !== lastSaved.current) {
        lastSaved.current = next;
        onSave(next);
      }
    }, debounceMs);
  }

  function handleChange(e: React.ChangeEvent<HTMLTextAreaElement | HTMLInputElement>) {
    const v = e.target.value;
    setLocal(v);
    scheduleSave(v);
  }

  function handleBlur() {
    if (timer.current) {
      clearTimeout(timer.current);
      timer.current = null;
    }
    if (local !== lastSaved.current) {
      lastSaved.current = local;
      onSave(local);
    }
  }

  if (multiline) {
    const taProps = rest as Omit<TextareaProps, 'value' | 'onChange'>;
    return (
      <Textarea
        {...taProps}
        value={local}
        onChange={handleChange}
        onBlur={handleBlur}
        placeholder={placeholder}
      />
    );
  }
  const inProps = rest as Omit<InputProps, 'value' | 'onChange'>;
  return (
    <Input
      {...inProps}
      value={local}
      onChange={handleChange}
      onBlur={handleBlur}
      placeholder={placeholder}
    />
  );
}
