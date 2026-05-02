import { Library } from 'lucide-react';
import { EmptyState } from '@/shared/components';

// Placeholder Bibliothèque. À implémenter par l'agent dispatché.
// Spec : docs/specs/04-bibliotheque.md
export function Bibliotheque() {
  return (
    <div className="h-full flex items-center justify-center">
      <EmptyState
        icon={<Library size={32} />}
        title="Bibliothèque — à implémenter"
        description="Lis docs/specs/04-bibliotheque.md, puis 01-shared.md et 02-design-system.md avant de coder."
      />
    </div>
  );
}
