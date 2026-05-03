import { useMemo } from 'react';
import { Flame, TrendingUp, Trophy, Sparkles } from 'lucide-react';
import type { PostConcurrent, Concurrent, PostFormat } from '@/shared/lib/types';
import { POST_FORMAT_LABELS } from '@/shared/lib/types';

interface Props {
  posts: PostConcurrent[];
  concurrents: Map<number, Concurrent>;
}

interface Insight {
  icon: React.ReactNode;
  label: string;
  value: string;
  hint: string;
  tone: 'accent' | 'success' | 'danger' | 'info' | 'current';
}

function fmtNum(n: number): string {
  if (n >= 1_000_000) return `${(n / 1_000_000).toFixed(1)}M`;
  if (n >= 1000) return `${(n / 1000).toFixed(1)}k`;
  return String(n);
}

function median(nums: number[]): number {
  if (!nums.length) return 0;
  const s = [...nums].sort((a, b) => a - b);
  const m = Math.floor(s.length / 2);
  return s.length % 2 ? s[m] : (s[m - 1] + s[m]) / 2;
}

export function InsightsBar({ posts, concurrents }: Props) {
  const insights = useMemo<Insight[]>(() => {
    if (!posts.length) return [];

    const last7 = posts.filter((p) => {
      if (!p.date_post) return false;
      const t = new Date(p.date_post).getTime();
      return !isNaN(t) && Date.now() - t <= 7 * 864e5;
    });

    const viraux = posts.filter((p) => p.score_viralite >= 2);

    // Top concurrent par viralité moyenne (sur posts ayant au moins un score)
    const byConc = new Map<number, { sum: number; n: number; nom: string }>();
    posts.forEach((p) => {
      if (!p.concurrent || p.score_viralite <= 0) return;
      const c = concurrents.get(p.concurrent);
      if (!c) return;
      const cur = byConc.get(p.concurrent) || { sum: 0, n: 0, nom: c.nom };
      cur.sum += p.score_viralite;
      cur.n += 1;
      byConc.set(p.concurrent, cur);
    });
    const topConc = [...byConc.values()]
      .filter((v) => v.n >= 2)
      .sort((a, b) => b.sum / b.n - a.sum / a.n)[0];

    // Top format
    const byFormat = new Map<PostFormat, { sum: number; n: number }>();
    posts.forEach((p) => {
      if (!p.format_detecte || !p.vues) return;
      const cur = byFormat.get(p.format_detecte) || { sum: 0, n: 0 };
      cur.sum += p.vues;
      cur.n += 1;
      byFormat.set(p.format_detecte, cur);
    });
    const topFormatEntry = [...byFormat.entries()]
      .filter(([, v]) => v.n >= 2)
      .sort((a, b) => b[1].sum / b[1].n - a[1].sum / a[1].n)[0];

    const out: Insight[] = [];

    if (last7.length > 0) {
      const med = median(last7.filter((p) => p.vues).map((p) => p.vues));
      out.push({
        icon: <Sparkles size={14} />,
        label: '7 derniers jours',
        value: `${last7.length} post${last7.length > 1 ? 's' : ''}`,
        hint: `médiane ${fmtNum(med)} vues`,
        tone: 'current',
      });
    }

    if (viraux.length > 0) {
      out.push({
        icon: <Flame size={14} />,
        label: 'Viraux (×2 ou +)',
        value: String(viraux.length),
        hint: 'à analyser en priorité',
        tone: 'danger',
      });
    }

    if (topConc) {
      out.push({
        icon: <Trophy size={14} />,
        label: 'Compte le plus viral',
        value: topConc.nom,
        hint: `score moyen ×${(topConc.sum / topConc.n).toFixed(1)}`,
        tone: 'accent',
      });
    }

    if (topFormatEntry) {
      const [format, stats] = topFormatEntry;
      out.push({
        icon: <TrendingUp size={14} />,
        label: 'Format qui performe',
        value: POST_FORMAT_LABELS[format],
        hint: `moyenne ${fmtNum(Math.round(stats.sum / stats.n))} vues`,
        tone: 'success',
      });
    }

    return out;
  }, [posts, concurrents]);

  if (!insights.length) return null;

  return (
    <div className="px-5 py-3 border-b border-border bg-gradient-to-r from-current-soft/40 via-accent-soft/30 to-surface-two">
      <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
        {insights.map((i, idx) => (
          <InsightCard key={idx} insight={i} />
        ))}
      </div>
    </div>
  );
}

function InsightCard({ insight }: { insight: Insight }) {
  const toneCls = {
    accent: 'bg-accent-soft text-accent border-accent/20',
    success: 'bg-success-soft text-success border-success/20',
    danger: 'bg-danger-soft text-danger border-danger/20',
    info: 'bg-info-soft text-info border-info/20',
    current: 'bg-current-soft text-current border-current/20',
  }[insight.tone];

  return (
    <div className="flex items-center gap-2 px-2.5 py-1.5 rounded-md bg-surface border border-border">
      <span
        className={`inline-flex items-center justify-center w-7 h-7 rounded-md border ${toneCls}`}
      >
        {insight.icon}
      </span>
      <div className="min-w-0">
        <div className="text-[10px] uppercase tracking-wide text-text-faint leading-tight">
          {insight.label}
        </div>
        <div className="text-[13px] font-bold leading-tight truncate">{insight.value}</div>
        <div className="text-[10px] text-text-faint leading-tight truncate">{insight.hint}</div>
      </div>
    </div>
  );
}
