import { useState } from 'react';
import { Boxes, Globe, BookOpen } from 'lucide-react';
import { cn } from '@/shared/lib/utils';
import { StudioDashboard } from './components/StudioDashboard';
import { PlateauWubo } from './components/PlateauWubo';
import { StockExterne } from './components/StockExterne';
import { ManuelWubo } from './components/ManuelWubo';
import type { Section } from './types';

const SECTIONS: { id: Section; label: string; icon: typeof Boxes; description: string }[] = [
  {
    id: 'plateau',
    label: 'Plateau Wubo',
    icon: Boxes,
    description: 'Notre matos : B-rolls, sessions de tournage, setups récurrents',
  },
  {
    id: 'stock',
    label: 'Stock externe',
    icon: Globe,
    description: 'Banques sons, assets directs, outils logiciels',
  },
  {
    id: 'manuel',
    label: 'Manuel Wubo',
    icon: BookOpen,
    description: 'Identité visuelle, checklists, cheat sheet',
  },
];

// Studio Wubo : la Bibliothèque de production.
// Pas d'injection ici (c'est l'Atelier qui gère les briques narratives).
// Ici on gère le matos, le savoir-faire et les ressources externes.
export function Bibliotheque() {
  const [section, setSection] = useState<Section>('plateau');

  return (
    <div className="h-full flex flex-col bg-bg overflow-hidden">
      <StudioDashboard />

      <nav className="flex items-center gap-2 px-4 py-3 border-b border-border bg-surface shrink-0">
        {SECTIONS.map(({ id, label, icon: Icon, description }) => {
          const active = section === id;
          return (
            <button
              key={id}
              type="button"
              onClick={() => setSection(id)}
              title={description}
              className={cn(
                'inline-flex items-center gap-2 px-3 h-9 rounded-md text-sm font-medium transition-all',
                active
                  ? 'bg-current text-on-current shadow-sm'
                  : 'bg-surface text-text-dim border border-border-strong hover:bg-surface-alt hover:text-text',
              )}
            >
              <Icon size={14} strokeWidth={1.75} />
              {label}
            </button>
          );
        })}
      </nav>

      <main className="flex-1 overflow-y-auto scrollbar-thin px-4 py-4">
        {section === 'plateau' && <PlateauWubo />}
        {section === 'stock' && <StockExterne />}
        {section === 'manuel' && <ManuelWubo />}
      </main>
    </div>
  );
}
