import { useMemo } from 'react';
import { Users, Compass, AlertTriangle, Film, CheckCircle2, Circle } from 'lucide-react';
import { Tooltip } from '@/shared/components';
import { cn } from '@/shared/lib/utils';
import type { AtelierNodeType } from '@/shared/lib/types';
import { useAvatars, useAngles, usePainPoints, useReels } from '@/shared/hooks/grist';
import { useAtelierView } from '../store';
import { isSlotFilled } from '../lib/briqueSlots';
import { computeSlotsForNode, type BriquesDataSnapshot } from '../lib/computeSlots';

interface TypeStats {
  type: AtelierNodeType;
  label: string;
  count: number;
  complete: number; // instances avec 3/3 slots remplis
}

interface BranchStats {
  total: number; // nombre de chemins avatar -> angle -> pain -> reel
  reelsComplete: number; // nombre de Reels au bout d'un chemin complet ET avec 3/3 slots remplis
  reelsPartial: number; // Reels au bout d'un chemin mais pas tous slots remplis
  reelsOrphans: number; // Reels sans chemin amont complet
}

const ICON: Record<AtelierNodeType, typeof Users> = {
  avatar: Users,
  angle: Compass,
  pain: AlertTriangle,
  reel: Film,
};

const COLOR: Record<AtelierNodeType, string> = {
  avatar: 'text-current',
  angle: 'text-info',
  pain: 'text-danger',
  reel: 'text-warning',
};

export function ProjectionPanel() {
  const nodes = useAtelierView((s) => s.nodes);
  const edges = useAtelierView((s) => s.edges);

  const { data: avatars } = useAvatars();
  const { data: angles } = useAngles();
  const { data: pains } = usePainPoints();
  const { data: reels } = useReels();

  const briques: BriquesDataSnapshot = useMemo(
    () => ({ avatars: avatars ?? [], angles: angles ?? [], pains: pains ?? [], reels: reels ?? [] }),
    [avatars, angles, pains, reels],
  );

  const stats = useMemo(() => {
    const types: AtelierNodeType[] = ['avatar', 'angle', 'pain', 'reel'];
    const typeStats: TypeStats[] = types.map((t) => {
      const nodesOfType = nodes.filter((n) => n.type === t);
      const complete = nodesOfType.filter((n) => {
        const slots = computeSlotsForNode(n, briques);
        if (slots.length === 0) return false;
        return slots.every(isSlotFilled);
      }).length;
      return { type: t, label: t === 'pain' ? 'Pains' : t === 'reel' ? 'Reels' : t === 'angle' ? 'Angles' : 'Avatars', count: nodesOfType.length, complete };
    });

    // Branches : tracer chaque Reel jusqu'à un Avatar via Pain → Angle → Avatar
    const childrenOf = new Map<string, string[]>(); // source -> [targets]
    const parentsOf = new Map<string, string[]>();
    edges.forEach((e) => {
      childrenOf.set(e.source, [...(childrenOf.get(e.source) ?? []), e.target]);
      parentsOf.set(e.target, [...(parentsOf.get(e.target) ?? []), e.source]);
    });

    const reelsNodes = nodes.filter((n) => n.type === 'reel');
    let reelsComplete = 0;
    let reelsPartial = 0;
    let reelsOrphans = 0;

    reelsNodes.forEach((reel) => {
      // Cherche un parent Pain
      const painParents = (parentsOf.get(reel.id) ?? [])
        .map((id) => nodes.find((n) => n.id === id))
        .filter((n): n is NonNullable<typeof n> => Boolean(n) && n!.type === 'pain');
      const hasFullChain = painParents.some((pain) => {
        const angleParents = (parentsOf.get(pain.id) ?? [])
          .map((id) => nodes.find((n) => n.id === id))
          .filter((n): n is NonNullable<typeof n> => Boolean(n) && n!.type === 'angle');
        return angleParents.some((angle) => {
          const avatarParents = (parentsOf.get(angle.id) ?? [])
            .map((id) => nodes.find((n) => n.id === id))
            .filter((n): n is NonNullable<typeof n> => Boolean(n) && n!.type === 'avatar');
          return avatarParents.length > 0;
        });
      });

      const slots = computeSlotsForNode(reel, briques);
      const allFilled = slots.length > 0 && slots.every(isSlotFilled);

      if (!hasFullChain) {
        reelsOrphans += 1;
      } else if (allFilled) {
        reelsComplete += 1;
      } else {
        reelsPartial += 1;
      }
    });

    const branch: BranchStats = {
      total: reelsComplete + reelsPartial,
      reelsComplete,
      reelsPartial,
      reelsOrphans,
    };

    return { typeStats, branch };
  }, [nodes, edges, briques]);

  if (nodes.length === 0) return null;

  return (
    <div className="shrink-0 border-t border-border bg-surface-two px-3 py-1.5 flex items-center gap-3 overflow-x-auto scrollbar-thin">
      <div className="text-[10px] uppercase tracking-wide text-text-faint font-semibold whitespace-nowrap">
        État de l'atelier
      </div>

      <div className="flex items-center gap-3">
        {stats.typeStats.map((s) => {
          const Icon = ICON[s.type];
          if (s.count === 0) return null;
          return (
            <Tooltip key={s.type} content={`${s.complete} sur ${s.count} ${s.label.toLowerCase()} ont leurs 3 slots remplis.`}>
              <div className="inline-flex items-center gap-1 cursor-help">
                <Icon size={12} className={cn('shrink-0', COLOR[s.type])} />
                <span className="text-[11px] tabular-nums text-text">
                  {s.complete}/{s.count}
                </span>
                <span className="text-[10px] text-text-faint">{s.label}</span>
              </div>
            </Tooltip>
          );
        })}
      </div>

      <div className="ml-auto flex items-center gap-3">
        {stats.branch.reelsComplete > 0 && (
          <Tooltip content="Reels prêts à filmer : chaîne avatar→angle→pain→reel complète + 3 slots remplis">
            <div className="inline-flex items-center gap-1 cursor-help">
              <CheckCircle2 size={12} className="text-success" />
              <span className="text-[11px] tabular-nums font-semibold text-success">
                {stats.branch.reelsComplete}
              </span>
              <span className="text-[10px] text-text-faint">prêts</span>
            </div>
          </Tooltip>
        )}
        {stats.branch.reelsPartial > 0 && (
          <Tooltip content="Reels avec chaîne complète mais slots incomplets : à finir">
            <div className="inline-flex items-center gap-1 cursor-help">
              <Circle size={12} className="text-warning" />
              <span className="text-[11px] tabular-nums font-semibold text-warning">
                {stats.branch.reelsPartial}
              </span>
              <span className="text-[10px] text-text-faint">à finir</span>
            </div>
          </Tooltip>
        )}
        {stats.branch.reelsOrphans > 0 && (
          <Tooltip content="Reels orphelins : pas de chaîne avatar→angle→pain en amont. Sans cible argumentée, ils ne sont pas justifiés.">
            <div className="inline-flex items-center gap-1 cursor-help">
              <AlertTriangle size={12} className="text-danger" />
              <span className="text-[11px] tabular-nums font-semibold text-danger">
                {stats.branch.reelsOrphans}
              </span>
              <span className="text-[10px] text-text-faint">orphelins</span>
            </div>
          </Tooltip>
        )}
      </div>
    </div>
  );
}
