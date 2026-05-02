import { Sparkles } from 'lucide-react';
import { EmptyState } from '@/shared/components';

// Placeholder Atelier. À implémenter par l'agent dispatché.
// Spec : docs/specs/03-atelier.md
export function Atelier() {
  return (
    <div className="h-full flex items-center justify-center">
      <EmptyState
        icon={<Sparkles size={32} />}
        title="Atelier — à implémenter"
        description="Lis docs/specs/03-atelier.md, puis 01-shared.md et 02-design-system.md avant de coder."
      />
    </div>
  );
}
