import { useCallback, useEffect, useState } from 'react';

// Persistance d'une checklist dans localStorage par storageKey.
// Retourne l'état + toggle + reset + count.
export function useChecklist(storageKey: string, ids: string[]) {
  const [checked, setChecked] = useState<Set<string>>(() => {
    if (typeof window === 'undefined') return new Set();
    try {
      const raw = localStorage.getItem(storageKey);
      if (!raw) return new Set();
      const arr = JSON.parse(raw) as string[];
      return new Set(arr);
    } catch {
      return new Set();
    }
  });

  useEffect(() => {
    try {
      localStorage.setItem(storageKey, JSON.stringify([...checked]));
    } catch {
      // localStorage indispo, fail silently
    }
  }, [storageKey, checked]);

  const toggle = useCallback((id: string) => {
    setChecked((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  }, []);

  const reset = useCallback(() => setChecked(new Set()), []);

  const allDone = ids.length > 0 && ids.every((id) => checked.has(id));
  const doneCount = ids.filter((id) => checked.has(id)).length;

  return { checked, toggle, reset, allDone, doneCount, total: ids.length };
}
