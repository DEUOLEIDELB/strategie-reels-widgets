import { TrendingUp, Heart, Zap, Globe, Lightbulb } from 'lucide-react';
import type { PostConcurrent, Concurrent } from '@/shared/lib/types';
import {
  computeKpis,
  computeInsights,
  computeRecommendation,
  fmtNum,
  fmtPct,
  type Insight,
} from './lib/analytics';
import { cn } from '@/shared/lib/utils';

interface Props {
  post: PostConcurrent;
  allPosts: PostConcurrent[];
  concurrent?: Concurrent;
}

const TONE_CLASSES: Record<Insight['tone'], string> = {
  success: 'bg-success-soft border-success/30 text-success',
  warning: 'bg-warning-soft border-warning/30 text-warning',
  info: 'bg-info-soft border-info/30 text-info',
  danger: 'bg-danger-soft border-danger/30 text-danger',
  neutral: 'bg-surface-alt border-border text-text-dim',
};

export function PostAnalytics({ post, allPosts, concurrent }: Props) {
  const kpis = computeKpis(post, allPosts, concurrent);
  const insights = computeInsights(post, allPosts, concurrent, kpis);
  const recommendation = computeRecommendation(post, kpis, concurrent);

  const hasMetrics = post.vues > 0 || post.likes > 0 || post.comments > 0;

  if (!hasMetrics) {
    return (
      <div className="p-4 text-center text-sm text-text-faint">
        Saisis ou auto-récupère les métriques pour voir l'analyse.
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-4">
      {/* KPIs grid 2x2 */}
      <div className="grid grid-cols-2 gap-2">
        <KpiCard
          icon={<TrendingUp size={14} />}
          label="Score viralité"
          value={kpis.viralScore > 0 ? `×${kpis.viralScore.toFixed(1)}` : '—'}
          hint={
            kpis.accountSampleSize >= 3
              ? `vs médiane compte (${kpis.accountSampleSize} autres posts)`
              : 'données insuffisantes'
          }
          tone={
            kpis.viralScore >= 2
              ? 'danger'
              : kpis.viralScore >= 1
                ? 'success'
                : 'neutral'
          }
        />
        <KpiCard
          icon={<Heart size={14} />}
          label="Engagement rate"
          value={fmtPct(kpis.engagementRate)}
          hint="(likes + comments) / vues"
          tone={
            kpis.engagementRate >= 5
              ? 'success'
              : kpis.engagementRate >= 2
                ? 'info'
                : 'neutral'
          }
        />
        <KpiCard
          icon={<Zap size={14} />}
          label="Velocity"
          value={kpis.velocity > 0 ? `${fmtNum(kpis.velocity)}/j` : '—'}
          hint={
            kpis.daysSincePost > 0
              ? `${fmtNum(post.vues)} vues sur ${kpis.daysSincePost}j`
              : 'date manquante'
          }
          tone={kpis.velocity >= 10000 ? 'success' : 'neutral'}
        />
        <KpiCard
          icon={<Globe size={14} />}
          label="Reach efficiency"
          value={
            kpis.reachEfficiency !== null ? fmtPct(kpis.reachEfficiency, 0) : '—'
          }
          hint={
            kpis.reachEfficiency !== null
              ? `vues / followers compte`
              : 'followers compte inconnu'
          }
          tone={
            kpis.reachEfficiency !== null && kpis.reachEfficiency >= 20
              ? 'success'
              : kpis.reachEfficiency !== null && kpis.reachEfficiency >= 5
                ? 'info'
                : 'neutral'
          }
        />
      </div>

      {/* Comparaison visuelle : ce post / médiane compte / top compte */}
      {kpis.accountSampleSize >= 3 && post.vues > 0 && (
        <div className="border border-border rounded-md bg-surface p-3">
          <div className="text-[11px] font-semibold uppercase tracking-wide text-text-faint mb-2">
            Position dans le compte
          </div>
          <BarComparison
            current={post.vues}
            median={kpis.accountMedian}
            top={kpis.accountTop}
          />
          {kpis.percentileInAccount !== null && (
            <div className="text-[11px] text-text-faint mt-2">
              {kpis.percentileInAccount >= 90
                ? `Top ${(100 - kpis.percentileInAccount).toFixed(0)}% du compte`
                : kpis.percentileInAccount >= 50
                  ? `Au-dessus de la médiane (${kpis.percentileInAccount.toFixed(0)}e percentile)`
                  : `${kpis.percentileInAccount.toFixed(0)}e percentile du compte`}
            </div>
          )}
        </div>
      )}

      {/* Insights textuels */}
      {insights.length > 0 && (
        <div className="flex flex-col gap-1.5">
          <div className="text-[11px] font-semibold uppercase tracking-wide text-text-faint">
            Lecture rapide
          </div>
          {insights.map((i, idx) => (
            <div
              key={idx}
              className={cn(
                'flex items-start gap-2 px-2.5 py-1.5 rounded-sm border text-xs leading-snug',
                TONE_CLASSES[i.tone],
              )}
            >
              <span className="shrink-0">{i.emoji}</span>
              <span className="font-medium">{i.text}</span>
            </div>
          ))}
        </div>
      )}

      {/* Recommandation actionnable */}
      {recommendation && (
        <div
          className={cn(
            'rounded-md border p-3',
            recommendation.tone === 'success'
              ? 'bg-success-soft border-success/40'
              : recommendation.tone === 'warning'
                ? 'bg-warning-soft border-warning/40'
                : 'bg-info-soft border-info/40',
          )}
        >
          <div className="flex items-center gap-1.5 mb-1">
            <Lightbulb size={14} className="text-current shrink-0" />
            <div className="text-xs font-bold uppercase tracking-wide">
              Reco actionnable
            </div>
          </div>
          <div className="text-sm font-semibold mb-1">{recommendation.title}</div>
          <div className="text-xs text-text-dim leading-relaxed">{recommendation.body}</div>
        </div>
      )}
    </div>
  );
}

function KpiCard({
  icon,
  label,
  value,
  hint,
  tone = 'neutral',
}: {
  icon: React.ReactNode;
  label: string;
  value: string;
  hint?: string;
  tone?: Insight['tone'];
}) {
  const valueCls = {
    success: 'text-success',
    danger: 'text-danger',
    info: 'text-info',
    warning: 'text-warning',
    neutral: 'text-text',
  }[tone];

  return (
    <div className="border border-border rounded-md bg-surface p-3 flex flex-col gap-0.5">
      <div className="flex items-center gap-1 text-[10px] uppercase tracking-wide text-text-faint">
        {icon}
        <span>{label}</span>
      </div>
      <div className={cn('text-2xl font-bold tabular-nums leading-tight', valueCls)}>
        {value}
      </div>
      {hint && (
        <div className="text-[10px] text-text-faint leading-tight truncate" title={hint}>
          {hint}
        </div>
      )}
    </div>
  );
}

function BarComparison({
  current,
  median,
  top,
}: {
  current: number;
  median: number;
  top: number;
}) {
  const max = Math.max(current, median, top, 1);
  return (
    <div className="flex flex-col gap-1.5">
      <Bar label="Médiane compte" value={median} max={max} tone="text-text-faint" />
      <Bar label="Ce post" value={current} max={max} tone="text-current" highlight />
      <Bar label="Top compte" value={top} max={max} tone="text-accent" />
    </div>
  );
}

function Bar({
  label,
  value,
  max,
  tone,
  highlight,
}: {
  label: string;
  value: number;
  max: number;
  tone: string;
  highlight?: boolean;
}) {
  const pct = max > 0 ? (value / max) * 100 : 0;
  const barCls = highlight
    ? 'bg-current'
    : tone === 'text-accent'
      ? 'bg-accent'
      : 'bg-text-muted';
  return (
    <div className="flex items-center gap-2 text-[11px]">
      <div className={cn('w-24 shrink-0 truncate', highlight ? 'font-semibold' : '', tone)}>
        {label}
      </div>
      <div className="flex-1 h-3 bg-surface-alt rounded-sm overflow-hidden">
        <div
          className={cn('h-full transition-all', barCls)}
          style={{ width: `${pct}%` }}
        />
      </div>
      <div
        className={cn(
          'w-16 text-right tabular-nums shrink-0',
          highlight ? 'font-bold text-text' : 'text-text-dim',
        )}
      >
        {fmtNum(value)}
      </div>
    </div>
  );
}
