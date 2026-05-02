import { ReactNode } from 'react';
import { Construction } from 'lucide-react';
import { Card } from '@/shared/components';

interface Props {
  icon: ReactNode;
  title: string;
  intent: string;
  features: string[];
}

export function BlocPlaceholder({ icon, title, intent, features }: Props) {
  return (
    <div className="h-full flex flex-col">
      <div className="px-5 py-3 border-b border-border bg-surface shrink-0">
        <h2 className="text-base font-semibold flex items-center gap-2">
          {icon}
          {title}
        </h2>
        <p className="text-[11px] text-text-faint mt-0.5">{intent}</p>
      </div>
      <div className="flex-1 overflow-y-auto scrollbar-thin p-6">
        <Card className="max-w-xl mx-auto">
          <div className="p-6 flex flex-col gap-4">
            <div className="flex items-center gap-2 text-warning">
              <Construction size={16} />
              <span className="text-sm font-semibold">Bloc en attente d'implémentation</span>
            </div>
            <p className="text-sm text-text-dim leading-relaxed">
              Ce bloc fait partie de la spec V3 mais n'est pas encore livré. La V1 du widget se
              concentre sur <span className="font-semibold text-text">Pulse Concurrents</span>{' '}
              (le feed des Reels concurrents) pour valider l'approche visuelle. Les autres blocs
              suivront une fois le pattern validé.
            </p>
            <div className="text-xs">
              <div className="text-[11px] uppercase tracking-wider text-text-faint mb-2">
                Ce que ce bloc contiendra
              </div>
              <ul className="flex flex-col gap-1.5 text-text-dim">
                {features.map((f, i) => (
                  <li key={i} className="flex items-start gap-2">
                    <span className="text-current mt-0.5">→</span>
                    <span>{f}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </Card>
      </div>
    </div>
  );
}
