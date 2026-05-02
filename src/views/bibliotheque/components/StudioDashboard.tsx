import { useMemo } from 'react';
import { TrendingUp, AlertTriangle, Info, Film, Calendar } from 'lucide-react';
import type { LucideIcon } from 'lucide-react';
import { useReels, useBroll, useSessions } from '@/shared/hooks/grist';
import { cn } from '@/shared/lib/utils';
import { buildSnapshot } from '../lib/dashboard';

// Mini dashboard de tête. Lecture en 5 secondes : où on en est en prod.
export function StudioDashboard() {
  const { data: reels } = useReels();
  const { data: brolls } = useBroll();
  const { data: sessions } = useSessions();

  const snapshot = useMemo(
    () => buildSnapshot(reels, brolls, sessions),
    [reels, brolls, sessions],
  );

  return (
    <section className="bg-surface border-b border-border">
      <div className="px-4 py-3 flex items-center gap-3 flex-wrap">
        <div className="flex items-center gap-1.5 text-[11px] uppercase tracking-wide font-semibold text-text-dim">
          <TrendingUp size={13} className="text-current" />
          État de prod
        </div>

        <div className="flex items-center gap-2 flex-wrap">
          <Stat
            icon={Film}
            label="Reels en attente de tournage"
            value={snapshot.reelsScripteAFilmer}
            total={snapshot.reelsTotal}
            tone={snapshot.reelsScripteAFilmer > 5 ? 'warn' : 'ok'}
          />
          <Stat
            icon={Calendar}
            label="Sessions à planifier"
            value={snapshot.sessionsAPlanifier}
            total={snapshot.sessionsTotal}
            tone={snapshot.sessionsAPlanifier === 0 && snapshot.reelsScripteAFilmer > 5 ? 'warn' : 'ok'}
          />
          <Stat
            icon={Film}
            label="B-rolls jamais réutilisés"
            value={snapshot.brollsJamaisUtilises}
            total={snapshot.brollsTotal}
            tone={snapshot.brollsJamaisUtilises > 0 ? 'info' : 'ok'}
          />
        </div>
      </div>

      {snapshot.alertes.length > 0 && (
        <div className="px-4 pb-3 flex flex-col gap-1">
          {snapshot.alertes.map((a) => (
            <div
              key={a.id}
              className={cn(
                'flex items-start gap-2 px-2.5 py-1.5 rounded-md text-[11px] border',
                a.severite === 'warn'
                  ? 'bg-warning-soft border-warning/30 text-text'
                  : 'bg-info-soft border-info/30 text-text',
              )}
            >
              {a.severite === 'warn' ? (
                <AlertTriangle size={12} className="shrink-0 mt-0.5" />
              ) : (
                <Info size={12} className="shrink-0 mt-0.5" />
              )}
              <span>{a.texte}</span>
            </div>
          ))}
        </div>
      )}
    </section>
  );
}

interface StatProps {
  icon: LucideIcon;
  label: string;
  value: number;
  total?: number;
  tone: 'ok' | 'info' | 'warn';
}

function Stat({ icon: Icon, label, value, total, tone }: StatProps) {
  const toneClasses = {
    ok: 'bg-surface-alt border-border',
    info: 'bg-info-soft border-info/30',
    warn: 'bg-warning-soft border-warning/30',
  };
  return (
    <div
      className={cn(
        'inline-flex items-center gap-2 px-2.5 py-1.5 rounded-md border',
        toneClasses[tone],
      )}
      title={label}
    >
      <Icon size={13} strokeWidth={1.75} className="text-text-dim shrink-0" />
      <div className="flex flex-col leading-tight">
        <span className="text-base font-semibold tabular-nums text-text">
          {value}
          {typeof total === 'number' && (
            <span className="text-text-faint text-xs font-normal"> / {total}</span>
          )}
        </span>
        <span className="text-[10px] text-text-faint uppercase tracking-wide">{label}</span>
      </div>
    </div>
  );
}
