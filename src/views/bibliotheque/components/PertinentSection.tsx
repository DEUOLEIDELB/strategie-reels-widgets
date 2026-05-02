import { Sparkles } from 'lucide-react';
import type { ReactNode } from 'react';

interface Props {
  show: boolean;
  count: number;
  children: ReactNode;
}

// Bandeau "Pertinent pour ta combo". Masqué si combo incomplète ou rien à montrer.
export function PertinentSection({ show, count, children }: Props) {
  if (!show || count === 0) return null;
  return (
    <section className="flex flex-col gap-2 rounded-md bg-current-soft border border-current/20 p-3">
      <div className="flex items-center gap-2">
        <Sparkles size={14} strokeWidth={1.75} className="text-current" />
        <span className="text-[11px] uppercase tracking-wide font-semibold text-current">
          Pertinent pour ta combo
        </span>
        <span className="text-[11px] text-text-faint">
          ({count} {count > 1 ? 'éléments' : 'élément'})
        </span>
      </div>
      {children}
    </section>
  );
}
