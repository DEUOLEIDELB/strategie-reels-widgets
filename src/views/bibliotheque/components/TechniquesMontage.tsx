import { useMemo, useState } from 'react';
import { Search, X, Scissors, Wand2, Zap, Gauge, Layers } from 'lucide-react';
import type { LucideIcon } from 'lucide-react';
import { useDebounce } from '@/shared/hooks/ui';
import { Input, Skeleton, EmptyState, Card, CardBody, Badge } from '@/shared/components';
import { cn } from '@/shared/lib/utils';
import { useTechniquesMontage, type TechniqueMontage } from '../lib/queries';
import { TYPE_TONES, type PatternType } from '../lib/patternsLabels';

const TYPE_ICONS: Record<PatternType, LucideIcon> = {
  cut: Scissors,
  transition: Wand2,
  effet: Zap,
  pacing: Gauge,
  structure: Layers,
};

const TYPE_LABELS: Record<PatternType, string> = {
  cut: 'Cuts',
  transition: 'Transitions',
  effet: 'Effets',
  pacing: 'Pacing',
  structure: 'Structures',
};

const TYPE_ORDER: PatternType[] = ['cut', 'transition', 'pacing', 'effet', 'structure'];

// Section référentiel : 12 techniques nommées et reconnaissables.
// Sert de checklist quand on décortique un Reel référence : on lit la
// description, on coche le pattern dans la card du Reel.
export function TechniquesMontage() {
  const { data, isLoading } = useTechniquesMontage();
  const techs = data ?? [];

  const [search, setSearch] = useState('');
  const [activeType, setActiveType] = useState<PatternType | ''>('');
  const debounced = useDebounce(search, 200);

  const grouped = useMemo(() => {
    const q = debounced.trim().toLowerCase();
    const filtered = techs.filter((t) => {
      if (q && !`${t.nom ?? ''} ${t.description ?? ''} ${t.exemple_wubo ?? ''}`
        .toLowerCase().includes(q)) return false;
      if (activeType && t.type !== activeType) return false;
      return true;
    });
    const map: Record<string, TechniqueMontage[]> = {};
    for (const t of filtered) {
      const k = (t.type as string) || 'autre';
      (map[k] = map[k] || []).push(t);
    }
    return map;
  }, [techs, debounced, activeType]);

  const total = techs.length;
  const shownCount = Object.values(grouped).reduce((acc, arr) => acc + arr.length, 0);

  return (
    <div className="flex flex-col gap-3">
      <div className="flex items-center gap-3 flex-wrap">
        <div className="relative flex-1 min-w-[240px] max-w-md">
          <Search size={13} className="absolute left-2.5 top-1/2 -translate-y-1/2 text-text-faint" />
          <Input
            size="sm"
            placeholder="Rechercher une technique..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-7"
          />
          {search && (
            <button
              type="button"
              onClick={() => setSearch('')}
              className="absolute right-2 top-1/2 -translate-y-1/2 text-text-faint hover:text-text"
              aria-label="Effacer"
            >
              <X size={12} />
            </button>
          )}
        </div>

        <div className="flex items-center gap-1 flex-wrap">
          <button
            type="button"
            onClick={() => setActiveType('')}
            className={cn(
              'inline-flex items-center px-2 h-7 rounded-md border text-[11px] transition-colors',
              activeType === ''
                ? 'bg-current text-on-current border-current'
                : 'bg-surface text-text-dim border-border-strong hover:bg-surface-alt',
            )}
          >
            Tous
          </button>
          {TYPE_ORDER.map((t) => {
            const Icon = TYPE_ICONS[t];
            const active = activeType === t;
            return (
              <button
                key={t}
                type="button"
                onClick={() => setActiveType(t)}
                className={cn(
                  'inline-flex items-center gap-1 px-2 h-7 rounded-md border text-[11px] transition-colors',
                  active
                    ? 'bg-current text-on-current border-current'
                    : 'bg-surface text-text-dim border-border-strong hover:bg-surface-alt',
                )}
              >
                <Icon size={11} />
                {TYPE_LABELS[t]}
              </button>
            );
          })}
        </div>

        <span className="ml-auto text-[11px] text-text-faint tabular-nums">
          {shownCount} / {total}
        </span>
      </div>

      {isLoading ? (
        <div className="grid gap-3 grid-cols-1 md:grid-cols-2">
          {Array.from({ length: 6 }).map((_, i) => (
            <Skeleton key={i} className="h-32" />
          ))}
        </div>
      ) : total === 0 ? (
        <EmptyState
          title="Aucune technique chargée"
          description="La table Techniques_montage Grist n'a pas encore d'entrées."
        />
      ) : (
        <div className="flex flex-col gap-4">
          {TYPE_ORDER.map((t) => {
            const list = grouped[t] || [];
            if (list.length === 0) return null;
            const Icon = TYPE_ICONS[t];
            return (
              <section key={t} className="flex flex-col gap-2">
                <div className="flex items-center gap-1.5">
                  <Icon size={13} strokeWidth={1.75} className="text-current" />
                  <h3 className="text-[11px] uppercase tracking-wide font-semibold text-text-dim">
                    {TYPE_LABELS[t]} ({list.length})
                  </h3>
                </div>
                <div className="grid gap-3 grid-cols-1 md:grid-cols-2">
                  {list.map((tech) => (
                    <TechniqueCard key={tech.id} tech={tech} />
                  ))}
                </div>
              </section>
            );
          })}
        </div>
      )}
    </div>
  );
}

function TechniqueCard({ tech }: { tech: TechniqueMontage }) {
  const tone = TYPE_TONES[(tech.type as PatternType) || 'cut'] || 'default';
  return (
    <Card>
      <CardBody className="flex flex-col gap-1.5">
        <div className="flex items-center gap-2">
          <h4 className="text-sm font-semibold text-text">{tech.nom}</h4>
          <Badge variant={tone} size="xs">
            {tech.type}
          </Badge>
        </div>
        {tech.description && (
          <p className="text-xs text-text-dim leading-snug">{tech.description}</p>
        )}
        {tech.comment_reconnaitre && (
          <p className="text-[11px] text-text-faint leading-snug">
            <span className="font-semibold">Reconnaître : </span>
            {tech.comment_reconnaitre}
          </p>
        )}
        {tech.exemple_wubo && (
          <p className="text-[11px] leading-snug text-text-dim border-l-2 border-current pl-2 mt-1">
            <span className="font-semibold text-current">Wubo : </span>
            {tech.exemple_wubo}
          </p>
        )}
      </CardBody>
    </Card>
  );
}
