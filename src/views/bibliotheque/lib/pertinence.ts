import type { Hook, Script, PainPoint } from '@/shared/lib/types';
import { parseChoiceList, normalizeSignal } from './parsing';

// Heuristique V1.1 : score un Hook ou Script par rapport à un Pain courant.
// Pas d'embedding sémantique ; on matche signal_algo et keywords présents dans le titre du pain.
// Tout est local et clientside.

function painKeywords(pain: PainPoint | undefined): string[] {
  if (!pain?.titre) return [];
  return pain.titre
    .toLowerCase()
    .replace(/[^a-z0-9àâäéèêëîïôöùûüç ]+/g, ' ')
    .split(/\s+/)
    .filter((w) => w.length >= 4);
}

function hasKeywordMatch(haystack: string | null | undefined, kws: string[]): boolean {
  if (!haystack || kws.length === 0) return false;
  const h = haystack.toLowerCase();
  return kws.some((k) => h.includes(k));
}

export function scoreHookForPain(hook: Hook, pain: PainPoint | undefined): number {
  if (!pain) return 0;
  const kws = painKeywords(pain);
  let score = 0;
  if (hasKeywordMatch(hook.texte, kws)) score += 2;
  if (hasKeywordMatch(hook.thumbnail, kws)) score += 1;
  if (hasKeywordMatch(hook.methode_ou_trigger, kws)) score += 1;
  return score;
}

export function scoreScriptForPain(script: Script, pain: PainPoint | undefined): number {
  if (!pain) return 0;
  const kws = painKeywords(pain);
  let score = 0;
  // Match direct sur pain_point_cible (string slug-like)
  if (script.pain_point_cible && pain.titre) {
    const slug = String(pain.id);
    if (script.pain_point_cible.includes(slug)) score += 5;
    if (hasKeywordMatch(script.pain_point_cible, kws)) score += 3;
  }
  if (hasKeywordMatch(script.sujet, kws)) score += 2;
  if (hasKeywordMatch(script.texte_oral_complet, kws)) score += 1;
  return score;
}

// Tri descendant par score, ne garde que ceux >= 1.
export function topPertinent<T>(items: T[], scorer: (x: T) => number, max = 5): T[] {
  return items
    .map((it) => ({ it, s: scorer(it) }))
    .filter(({ s }) => s >= 1)
    .sort((a, b) => b.s - a.s)
    .slice(0, max)
    .map(({ it }) => it);
}

export function intersectsSignal(itemSignal: unknown, painSignal: unknown): boolean {
  const a = parseChoiceList(itemSignal).map(normalizeSignal);
  const b = parseChoiceList(painSignal).map(normalizeSignal);
  if (a.length === 0 || b.length === 0) return false;
  return a.some((s) => b.includes(s));
}
