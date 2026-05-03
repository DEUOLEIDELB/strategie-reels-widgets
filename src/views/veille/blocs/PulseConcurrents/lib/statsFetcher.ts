// Récupération des stats publiques (vues, likes, comments) depuis l'URL d'un Reel/Short.
//
// YouTube : Data API v3, gratuit (10k units/jour). Clé à restreindre par référrer.
//   La clé est saisie une fois par l'utilisateur, stockée localStorage.
// TikTok  : TikWM (https://www.tikwm.com/api/), gratuit, ~1 req/sec, CORS OK. Pas de clé.
// Instagram : pas de solution gratuite fiable pour les stats numériques. Seule la
//   thumbnail est dispo via microlink. Stats à saisir manuellement par l'utilisateur,
//   ou activer ScrapeCreators (commercial ~5€/an).
//
// Cache localStorage 7 jours par URL pour éviter de re-frapper.

import { extractYouTubeId, detectPlateforme } from './postMeta';

export interface PostStats {
  vues: number;
  likes: number;
  comments: number;
  source: 'youtube_api' | 'tikwm' | 'instagram_paid' | 'unavailable';
  fetched_at: number;
}

const STATS_CACHE_PREFIX = 'wubo_post_stats_';
const STATS_CACHE_TTL_MS = 7 * 864e5;
const YT_KEY_STORAGE = 'wubo_youtube_api_key';

// ----------------------------------------------------------------------------
// Cache
// ----------------------------------------------------------------------------

function cacheKey(url: string): string {
  return `${STATS_CACHE_PREFIX}${btoa(url).slice(0, 50)}`;
}

function readCache(url: string): PostStats | null {
  try {
    const raw = localStorage.getItem(cacheKey(url));
    if (!raw) return null;
    const s = JSON.parse(raw) as PostStats;
    if (Date.now() - s.fetched_at > STATS_CACHE_TTL_MS) return null;
    return s;
  } catch {
    return null;
  }
}

function writeCache(url: string, stats: PostStats): void {
  try {
    localStorage.setItem(cacheKey(url), JSON.stringify(stats));
  } catch {
    // ignore quota / private mode
  }
}

// ----------------------------------------------------------------------------
// YouTube API key (localStorage, comme la clé Grist)
// ----------------------------------------------------------------------------

export function getYouTubeApiKey(): string | null {
  return localStorage.getItem(YT_KEY_STORAGE);
}

export function setYouTubeApiKey(key: string): void {
  localStorage.setItem(YT_KEY_STORAGE, key.trim());
}

export function resetYouTubeApiKey(): void {
  localStorage.removeItem(YT_KEY_STORAGE);
}

export function hasYouTubeApiKey(): boolean {
  return !!getYouTubeApiKey();
}

// ----------------------------------------------------------------------------
// Fetchers par plateforme
// ----------------------------------------------------------------------------

interface YouTubeApiResponse {
  items?: {
    statistics?: { viewCount?: string; likeCount?: string; commentCount?: string };
  }[];
}

async function fetchYouTubeStats(url: string): Promise<PostStats | null> {
  const id = extractYouTubeId(url);
  const key = getYouTubeApiKey();
  if (!id || !key) return null;
  try {
    const res = await fetch(
      `https://www.googleapis.com/youtube/v3/videos?part=statistics&id=${id}&key=${key}`,
    );
    if (!res.ok) return null;
    const j = (await res.json()) as YouTubeApiResponse;
    const stats = j.items?.[0]?.statistics;
    if (!stats) return null;
    return {
      vues: Number(stats.viewCount || 0),
      likes: Number(stats.likeCount || 0),
      comments: Number(stats.commentCount || 0),
      source: 'youtube_api',
      fetched_at: Date.now(),
    };
  } catch {
    return null;
  }
}

interface TikWMResponse {
  code?: number;
  data?: {
    play_count?: number;
    digg_count?: number;
    comment_count?: number;
    share_count?: number;
  };
}

async function fetchTikWMStats(url: string): Promise<PostStats | null> {
  try {
    const res = await fetch(
      `https://www.tikwm.com/api/?url=${encodeURIComponent(url)}`,
    );
    if (!res.ok) return null;
    const j = (await res.json()) as TikWMResponse;
    if (j.code !== 0 || !j.data) return null;
    return {
      vues: Number(j.data.play_count || 0),
      likes: Number(j.data.digg_count || 0),
      comments: Number(j.data.comment_count || 0),
      source: 'tikwm',
      fetched_at: Date.now(),
    };
  } catch {
    return null;
  }
}

// ----------------------------------------------------------------------------
// Point d'entrée unifié
// ----------------------------------------------------------------------------

export async function fetchPostStats(url: string): Promise<PostStats | null> {
  const trimmed = url.trim();
  if (!trimmed) return null;

  const cached = readCache(trimmed);
  if (cached) return cached;

  const plateforme = detectPlateforme(trimmed);
  let stats: PostStats | null = null;

  if (plateforme === 'youtube') {
    stats = await fetchYouTubeStats(trimmed);
  } else if (plateforme === 'tiktok') {
    stats = await fetchTikWMStats(trimmed);
  }
  // Instagram : pas de stats gratuites, on retourne null (le user complète manuellement)

  if (stats) writeCache(trimmed, stats);
  return stats;
}

// Indique si on PEUT théoriquement récupérer des stats pour cette URL
// (sans même tenter le fetch).
export function statsAvailableFor(url: string): {
  available: boolean;
  reason?: string;
} {
  const p = detectPlateforme(url);
  if (p === 'youtube') {
    if (!hasYouTubeApiKey()) {
      return {
        available: false,
        reason: 'Clé YouTube Data API requise (gratuite, configurable en haut)',
      };
    }
    return { available: true };
  }
  if (p === 'tiktok') return { available: true };
  if (p === 'instagram') {
    return {
      available: false,
      reason: 'Instagram : stats à saisir manuellement (API publique payante seulement)',
    };
  }
  return { available: false, reason: 'Plateforme non reconnue' };
}
