import { useState } from 'react';
import { Boxes, Sparkles, Scissors, Globe } from 'lucide-react';
import { cn } from '@/shared/lib/utils';
import { StudioDashboard } from './components/StudioDashboard';
import { PlateauWubo } from './components/PlateauWubo';
import { ReferencesReels } from './components/ReferencesReels';
import { TechniquesMontage } from './components/TechniquesMontage';
import { StockExterne } from './components/StockExterne';

type Section = 'plateau' | 'references' | 'techniques' | 'stock';

const SECTIONS: { id: Section; label: string; icon: typeof Boxes; description: string }[] = [
  {
    id: 'references',
    label: 'Reels références',
    icon: Sparkles,
    description: 'Bibliothèque vivante de Reels qui t\'inspirent, taggés par patterns',
  },
  {
    id: 'plateau',
    label: 'Plateau Wubo',
    icon: Boxes,
    description: 'Notre matos : B-rolls, sessions, setups',
  },
  {
    id: 'techniques',
    label: 'Techniques',
    icon: Scissors,
    description: '12 patterns nommés : cuts, transitions, effets, pacing, structures',
  },
  {
    id: 'stock',
    label: 'Stock externe',
    icon: Globe,
    description: 'Banques sons, assets, outils logiciels',
  },
];

// Studio Wubo V5 : 4 sections orientées action.
// Le coeur = Reels références (veille active). Plateau = matos. Techniques = référentiel.
// Stock = banques externes. Manuel Wubo supprimé.
export function Bibliotheque() {
  const [section, setSection] = useState<Section>('references');

  return (
    <div className="h-full flex flex-col bg-bg overflow-hidden">
      <StudioDashboard />

      <nav className="flex items-center gap-2 px-4 py-3 border-b border-border bg-surface shrink-0 flex-wrap">
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
        {section === 'references' && <ReferencesReels />}
        {section === 'plateau' && <PlateauWubo />}
        {section === 'techniques' && <TechniquesMontage />}
        {section === 'stock' && <StockExterne />}
      </main>
    </div>
  );
}
