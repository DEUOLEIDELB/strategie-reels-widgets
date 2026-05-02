import { Telescope } from 'lucide-react';
import { EmptyState } from '@/shared/components';

// Placeholder Veille. À implémenter par l'agent dispatché.
// Spec : docs/specs/05-veille.md
export function Veille() {
  return (
    <div className="h-full flex items-center justify-center">
      <EmptyState
        icon={<Telescope size={32} />}
        title="Veille — à implémenter"
        description="Lis docs/specs/05-veille.md, puis 01-shared.md et 02-design-system.md avant de coder."
      />
    </div>
  );
}
