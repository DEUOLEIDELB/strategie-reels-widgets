import {
  Flame,
  BarChart3,
  Waves,
  Trophy,
  Users,
  ClipboardList,
  type LucideIcon,
} from 'lucide-react';
import { useVeilleStore, type BlocVeille } from '../store';
import { cn } from '@/shared/lib/utils';

interface BlocDef {
  id: BlocVeille;
  label: string;
  description: string;
  icon: LucideIcon;
  count?: number;
  highlight?: boolean;
}

interface Props {
  pulseCount?: number;
  syntheseCount?: number;
}

export function VeilleSidebar({ pulseCount, syntheseCount }: Props) {
  const bloc = useVeilleStore((s) => s.bloc);
  const setBloc = useVeilleStore((s) => s.setBloc);

  const BLOCS: BlocDef[] = [
    {
      id: 'pulse-concurrents',
      label: 'Pulse Concurrents',
      description: 'Feed des Reels',
      icon: Flame,
      count: pulseCount,
      highlight: true,
    },
    {
      id: 'pulse-wubo',
      label: 'Pulse Wubo',
      description: 'Tes performances',
      icon: BarChart3,
    },
    {
      id: 'vagues-sons',
      label: 'Vagues & Sons',
      description: 'Tendances externes',
      icon: Waves,
    },
    {
      id: 'hall-of-fame',
      label: 'Hall of Fame',
      description: 'Vidéos virales repères',
      icon: Trophy,
    },
    {
      id: 'reseau',
      label: 'Réseau',
      description: 'Influenceurs cible',
      icon: Users,
    },
    {
      id: 'synthese-hebdo',
      label: 'Synthèse hebdo',
      description: 'Le livrable',
      icon: ClipboardList,
      count: syntheseCount,
    },
  ];

  return (
    <aside className="w-60 shrink-0 border-r border-border bg-surface-two flex flex-col">
      <div className="px-4 py-3 border-b border-border">
        <div className="text-[10px] uppercase tracking-wider text-text-faint font-semibold">
          Veille
        </div>
        <div className="text-sm font-semibold mt-0.5">6 blocs de pilotage</div>
      </div>
      <nav className="flex-1 overflow-y-auto scrollbar-thin p-2 flex flex-col gap-1">
        {BLOCS.map((b) => {
          const Icon = b.icon;
          const active = bloc === b.id;
          return (
            <button
              key={b.id}
              onClick={() => setBloc(b.id)}
              className={cn(
                'flex items-start gap-2.5 px-2.5 py-2 rounded-md text-left transition-all',
                'border border-transparent',
                active
                  ? 'bg-surface border-current/40 shadow-sm'
                  : 'hover:bg-surface hover:border-border',
              )}
            >
              <span
                className={cn(
                  'mt-0.5 shrink-0 flex items-center justify-center w-7 h-7 rounded-md',
                  active
                    ? 'bg-current text-on-current'
                    : b.highlight
                      ? 'bg-accent-soft text-accent'
                      : 'bg-surface-alt text-text-dim',
                )}
              >
                <Icon size={14} strokeWidth={1.75} />
              </span>
              <span className="flex-1 min-w-0">
                <span className="flex items-center gap-1.5">
                  <span
                    className={cn(
                      'text-[13px] font-semibold leading-tight',
                      active ? 'text-text' : 'text-text-dim',
                    )}
                  >
                    {b.label}
                  </span>
                  {typeof b.count === 'number' && b.count > 0 && (
                    <span
                      className={cn(
                        'inline-flex items-center justify-center min-w-[18px] h-[18px] px-1 rounded-full text-[10px] font-semibold',
                        active
                          ? 'bg-current text-on-current'
                          : 'bg-accent text-on-accent',
                      )}
                    >
                      {b.count > 99 ? '99+' : b.count}
                    </span>
                  )}
                </span>
                <span className="block text-[11px] text-text-faint leading-tight mt-0.5">
                  {b.description}
                </span>
              </span>
            </button>
          );
        })}
      </nav>
    </aside>
  );
}
