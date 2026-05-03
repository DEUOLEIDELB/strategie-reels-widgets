// Analytics du post : KPIs calcules, comparaisons, insights textuels.
// Tout est calcule cote front a partir du feed en memoire (pas de stockage Grist).

import type { PostConcurrent, Concurrent } from '@/shared/lib/types';
import { POST_FORMAT_LABELS } from '@/shared/lib/types';

export interface PostKpis {
  // Ratios bruts
  engagementRate: number; // (likes + comments) / vues * 100
  velocity: number; // vues / max(1, daysSincePost)
  reachEfficiency: number | null; // vues / followers_ig * 100. null si followers inconnu.
  daysSincePost: number; // peut etre 0
  viralScore: number; // vues / mediane compte (deja calcule en amont)

  // Comparaisons
  accountMedian: number; // mediane vues des autres posts du compte
  accountTop: number; // top vues des autres posts du compte
  accountSampleSize: number; // nb autres posts pour le compte
  feedMedian: number; // mediane vues feed global
  formatMedian: number; // mediane vues du meme format dans le feed
  formatSampleSize: number;

  // Percentiles
  percentileInAccount: number | null; // 0-100, position du post dans son compte
  percentileInFeed: number; // 0-100, position du post dans le feed total
}

export type InsightTone = 'success' | 'warning' | 'info' | 'danger' | 'neutral';

export interface Insight {
  tone: InsightTone;
  text: string;
  emoji: string;
}

export function fmtNum(n: number): string {
  if (!n) return '0';
  if (n >= 1_000_000) return `${(n / 1_000_000).toFixed(1)}M`;
  if (n >= 1000) return `${(n / 1000).toFixed(1)}k`;
  return String(Math.round(n));
}

export function fmtPct(n: number, digits = 1): string {
  if (!isFinite(n)) return '—';
  return `${n.toFixed(digits)}%`;
}

function median(nums: number[]): number {
  const arr = nums.filter((n) => n > 0);
  if (!arr.length) return 0;
  const s = [...arr].sort((a, b) => a - b);
  const m = Math.floor(s.length / 2);
  return s.length % 2 ? s[m] : (s[m - 1] + s[m]) / 2;
}

function percentile(value: number, dataset: number[]): number {
  const arr = dataset.filter((n) => n > 0);
  if (!arr.length || value <= 0) return 0;
  const below = arr.filter((n) => n < value).length;
  return (below / arr.length) * 100;
}

function daysSince(d: number | string | null | undefined): number {
  if (!d) return 0;
  const t = new Date(d).getTime();
  if (isNaN(t)) return 0;
  return Math.max(0, Math.floor((Date.now() - t) / 864e5));
}

export function computeKpis(
  post: PostConcurrent,
  allPosts: PostConcurrent[],
  concurrent?: Concurrent,
): PostKpis {
  const sameAccountOthers = allPosts.filter(
    (p) => p.concurrent === post.concurrent && p.id !== post.id,
  );
  const sameFormatOthers = allPosts.filter(
    (p) => p.id !== post.id && p.format_detecte && p.format_detecte === post.format_detecte,
  );
  const allOthers = allPosts.filter((p) => p.id !== post.id);

  const accountMedian = median(sameAccountOthers.map((p) => p.vues));
  const accountTop = sameAccountOthers.reduce((m, p) => Math.max(m, p.vues || 0), 0);
  const feedMedian = median(allOthers.map((p) => p.vues));
  const formatMedian = median(sameFormatOthers.map((p) => p.vues));

  const days = daysSince(post.date_post);
  const engagementRate =
    post.vues > 0 ? ((post.likes + post.comments) / post.vues) * 100 : 0;
  const velocity = post.vues > 0 ? post.vues / Math.max(1, days) : 0;
  const reachEfficiency =
    concurrent && concurrent.followers_ig > 0 && post.vues > 0
      ? (post.vues / concurrent.followers_ig) * 100
      : null;

  const viralScore = post.score_viralite || 0;

  const percentileInAccount =
    sameAccountOthers.length >= 3
      ? percentile(post.vues, sameAccountOthers.map((p) => p.vues))
      : null;
  const percentileInFeed = percentile(post.vues, allOthers.map((p) => p.vues));

  return {
    engagementRate,
    velocity,
    reachEfficiency,
    daysSincePost: days,
    viralScore,
    accountMedian,
    accountTop,
    accountSampleSize: sameAccountOthers.length,
    feedMedian,
    formatMedian,
    formatSampleSize: sameFormatOthers.length,
    percentileInAccount,
    percentileInFeed,
  };
}

// Mediane engagement rate des posts du meme compte (pour comparaison ER)
function accountEngagementMedian(
  post: PostConcurrent,
  allPosts: PostConcurrent[],
): number {
  const sameAccount = allPosts.filter(
    (p) => p.concurrent === post.concurrent && p.id !== post.id && p.vues > 0,
  );
  const ers = sameAccount.map((p) => ((p.likes + p.comments) / p.vues) * 100);
  return median(ers);
}

export function computeInsights(
  post: PostConcurrent,
  allPosts: PostConcurrent[],
  concurrent: Concurrent | undefined,
  kpis: PostKpis,
): Insight[] {
  const insights: Insight[] = [];

  // Score viralite vs compte
  if (kpis.viralScore >= 3) {
    insights.push({
      tone: 'danger',
      emoji: '🔥',
      text: `Hit massif : ${kpis.viralScore.toFixed(1)}× la médiane du compte ${concurrent?.nom || ''}`,
    });
  } else if (kpis.viralScore >= 1.5) {
    insights.push({
      tone: 'success',
      emoji: '📈',
      text: `Sur-performance : ${kpis.viralScore.toFixed(1)}× la médiane du compte`,
    });
  } else if (kpis.viralScore > 0 && kpis.viralScore < 0.5) {
    insights.push({
      tone: 'warning',
      emoji: '📉',
      text: `Sous-performance : ${(kpis.viralScore * 100).toFixed(0)}% de la médiane du compte`,
    });
  }

  // Engagement rate vs compte
  if (kpis.engagementRate > 0 && kpis.accountSampleSize >= 3) {
    const accountER = accountEngagementMedian(post, allPosts);
    if (accountER > 0) {
      const ratio = kpis.engagementRate / accountER;
      if (ratio >= 1.5) {
        insights.push({
          tone: 'success',
          emoji: '💬',
          text: `Engagement ${kpis.engagementRate.toFixed(1)}% (médiane compte ${accountER.toFixed(1)}%, +${((ratio - 1) * 100).toFixed(0)}%)`,
        });
      } else if (ratio <= 0.6) {
        insights.push({
          tone: 'warning',
          emoji: '💬',
          text: `Engagement faible : ${kpis.engagementRate.toFixed(1)}% (médiane compte ${accountER.toFixed(1)}%)`,
        });
      }
    }
  }

  // Format performance
  if (
    post.format_detecte &&
    kpis.formatMedian > 0 &&
    kpis.feedMedian > 0 &&
    kpis.formatSampleSize >= 3
  ) {
    const ratio = kpis.formatMedian / kpis.feedMedian;
    if (ratio >= 1.4) {
      insights.push({
        tone: 'info',
        emoji: '🎯',
        text: `Format "${POST_FORMAT_LABELS[post.format_detecte]}" performe ${ratio.toFixed(1)}× la médiane du feed`,
      });
    }
  }

  // Velocity
  if (kpis.velocity > 0 && kpis.daysSincePost >= 1) {
    insights.push({
      tone: 'neutral',
      emoji: '⚡',
      text: `Velocity : ${fmtNum(kpis.velocity)} vues/jour sur ${kpis.daysSincePost}j`,
    });
  }

  // Reach efficiency
  if (kpis.reachEfficiency !== null && kpis.reachEfficiency > 0 && concurrent) {
    if (kpis.reachEfficiency >= 30) {
      insights.push({
        tone: 'success',
        emoji: '🌍',
        text: `Hors-audience : ${kpis.reachEfficiency.toFixed(0)}% des followers atteints (algo a poussé)`,
      });
    } else if (kpis.reachEfficiency < 5) {
      insights.push({
        tone: 'warning',
        emoji: '🌍',
        text: `Reach limité : ${kpis.reachEfficiency.toFixed(1)}% des followers atteints`,
      });
    }
  }

  // Percentile in account
  if (kpis.percentileInAccount !== null) {
    if (kpis.percentileInAccount >= 90) {
      insights.push({
        tone: 'success',
        emoji: '🏆',
        text: `Top 10% du compte ${concurrent?.nom || ''}`,
      });
    } else if (kpis.percentileInAccount <= 20 && kpis.accountSampleSize >= 5) {
      insights.push({
        tone: 'warning',
        emoji: '⬇️',
        text: `Bottom 20% du compte`,
      });
    }
  }

  return insights;
}

export interface Recommendation {
  tone: 'success' | 'info' | 'warning';
  title: string;
  body: string;
}

export function computeRecommendation(
  post: PostConcurrent,
  kpis: PostKpis,
  concurrent: Concurrent | undefined,
): Recommendation | null {
  // Reco principale : reproduire si format sous-utilise et performant
  if (
    post.format_detecte &&
    kpis.formatMedian > 0 &&
    kpis.feedMedian > 0 &&
    kpis.formatMedian / kpis.feedMedian >= 1.3 &&
    kpis.viralScore >= 1.5
  ) {
    return {
      tone: 'success',
      title: `Reproduire le format "${POST_FORMAT_LABELS[post.format_detecte]}"`,
      body: `Format performant chez les concurrents (${(kpis.formatMedian / kpis.feedMedian).toFixed(1)}× médiane feed) et ce post ${concurrent?.nom ? `de ${concurrent.nom}` : ''} sur-performe (${kpis.viralScore.toFixed(1)}× médiane compte). Forte probabilité de marcher pour Wubo. Crée un Reel inspiré.`,
    };
  }

  // Reco velocity exceptionnelle
  if (kpis.velocity >= 50000 && kpis.daysSincePost <= 14) {
    return {
      tone: 'success',
      title: 'Vague active, surfer maintenant',
      body: `${fmtNum(kpis.velocity)} vues/jour sur ${kpis.daysSincePost}j depuis publication. Le sujet/format est en train de décoller. Capture le signal et tourne dans les 48h.`,
    };
  }

  // Reco hit massif
  if (kpis.viralScore >= 3) {
    return {
      tone: 'success',
      title: 'Hit massif, analyser le pourquoi',
      body: `Score ${kpis.viralScore.toFixed(1)}× la médiane. Analyse le hook et le format précis. Ce qui marche ici peut marcher pour Wubo dans le bon angle.`,
    };
  }

  // Reco sous-performance d'un grand compte
  if (kpis.viralScore > 0 && kpis.viralScore < 0.4 && (concurrent?.followers_ig || 0) > 100000) {
    return {
      tone: 'warning',
      title: 'Format à éviter pour ce segment',
      body: `Même un compte de ${fmtNum(concurrent!.followers_ig)} followers n'a fait que ${(kpis.viralScore * 100).toFixed(0)}% de sa médiane. Ce sujet/format risque de flopper aussi pour Wubo.`,
    };
  }

  return null;
}
