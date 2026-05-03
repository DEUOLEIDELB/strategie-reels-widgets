// Auto-extraction de métadonnées depuis une URL Reel/Short/TikTok.
// - YouTube : oEmbed officiel public (CORS OK, gratuit)
// - TikTok : oEmbed officiel public (CORS OK, gratuit)
// - Instagram : oEmbed Meta non-public, on tape microlink.io (free tier 50req/jour anon)
//
// Tout est best-effort : en cas d'échec on retourne un objet vide, l'UI dégrade
// vers la saisie manuelle.

import type { PostPlateforme } from '@/shared/lib/types';

export interface PostMeta {
  plateforme: PostPlateforme | '';
  thumbnail_url: string;
  date_post: string;
  author: string;
  title: string;
  embedUrl: string;
}

const EMPTY: PostMeta = {
  plateforme: '',
  thumbnail_url: '',
  date_post: '',
  author: '',
  title: '',
  embedUrl: '',
};

export function detectPlateforme(url: string): PostPlateforme | '' {
  if (/instagram\.com/i.test(url)) return 'instagram';
  if (/tiktok\.com/i.test(url)) return 'tiktok';
  if (/(youtube\.com|youtu\.be)/i.test(url)) return 'youtube';
  return '';
}

// Extrait le shortcode d'une URL Instagram (post ou reel).
// Format : https://www.instagram.com/{p|reel|tv}/SHORTCODE/...
export function extractInstagramShortcode(url: string): string | null {
  const m = url.match(/instagram\.com\/(?:p|reel|tv)\/([A-Za-z0-9_-]+)/);
  return m ? m[1] : null;
}

// Extrait l'ID YouTube depuis youtu.be/ID ou youtube.com/watch?v=ID ou /shorts/ID
export function extractYouTubeId(url: string): string | null {
  let m = url.match(/youtu\.be\/([A-Za-z0-9_-]{6,})/);
  if (m) return m[1];
  m = url.match(/youtube\.com\/(?:watch\?v=|shorts\/|embed\/)([A-Za-z0-9_-]{6,})/);
  if (m) return m[1];
  return null;
}

// Extrait l'ID TikTok depuis https://www.tiktok.com/@user/video/VIDEO_ID
export function extractTikTokId(url: string): string | null {
  const m = url.match(/tiktok\.com\/.*\/video\/(\d+)/);
  return m ? m[1] : null;
}

export function getEmbedUrl(url: string): string {
  const p = detectPlateforme(url);
  if (p === 'instagram') {
    const sc = extractInstagramShortcode(url);
    return sc ? `https://www.instagram.com/p/${sc}/embed/` : '';
  }
  if (p === 'youtube') {
    const id = extractYouTubeId(url);
    return id ? `https://www.youtube.com/embed/${id}` : '';
  }
  if (p === 'tiktok') {
    const id = extractTikTokId(url);
    return id ? `https://www.tiktok.com/embed/v2/${id}` : '';
  }
  return '';
}

async function fetchYouTubeMeta(url: string): Promise<Partial<PostMeta>> {
  try {
    const res = await fetch(
      `https://www.youtube.com/oembed?format=json&url=${encodeURIComponent(url)}`,
    );
    if (!res.ok) return {};
    const j = (await res.json()) as {
      thumbnail_url?: string;
      author_name?: string;
      title?: string;
    };
    return {
      thumbnail_url: j.thumbnail_url || '',
      author: j.author_name || '',
      title: j.title || '',
    };
  } catch {
    return {};
  }
}

async function fetchTikTokMeta(url: string): Promise<Partial<PostMeta>> {
  try {
    const res = await fetch(
      `https://www.tiktok.com/oembed?url=${encodeURIComponent(url)}`,
    );
    if (!res.ok) return {};
    const j = (await res.json()) as {
      thumbnail_url?: string;
      author_name?: string;
      title?: string;
    };
    return {
      thumbnail_url: j.thumbnail_url || '',
      author: j.author_name || '',
      title: j.title || '',
    };
  } catch {
    return {};
  }
}

// Microlink.io : free tier 50 req/jour anon, CORS OK. Fallback pour Instagram.
// Doc : https://microlink.io/docs/api/getting-started/overview
async function fetchMicrolinkMeta(url: string): Promise<Partial<PostMeta>> {
  try {
    const res = await fetch(
      `https://api.microlink.io/?url=${encodeURIComponent(url)}`,
    );
    if (!res.ok) return {};
    const j = (await res.json()) as {
      status?: string;
      data?: {
        image?: { url?: string };
        title?: string;
        author?: string;
        date?: string;
        publisher?: string;
      };
    };
    if (j.status !== 'success' || !j.data) return {};
    return {
      thumbnail_url: j.data.image?.url || '',
      title: j.data.title || '',
      author: j.data.author || j.data.publisher || '',
      date_post: j.data.date ? j.data.date.slice(0, 10) : '',
    };
  } catch {
    return {};
  }
}

// Point d'entrée : tente d'enrichir une URL en métadonnées.
export async function fetchPostMeta(url: string): Promise<PostMeta> {
  const trimmed = url.trim();
  if (!trimmed) return EMPTY;
  const plateforme = detectPlateforme(trimmed);
  const embedUrl = getEmbedUrl(trimmed);

  let extracted: Partial<PostMeta> = {};
  if (plateforme === 'youtube') {
    extracted = await fetchYouTubeMeta(trimmed);
    // Si YouTube oEmbed n'a pas la date, on tente microlink en complément
    if (!extracted.date_post) {
      const m = await fetchMicrolinkMeta(trimmed);
      if (m.date_post) extracted.date_post = m.date_post;
    }
  } else if (plateforme === 'tiktok') {
    extracted = await fetchTikTokMeta(trimmed);
    if (!extracted.date_post) {
      const m = await fetchMicrolinkMeta(trimmed);
      if (m.date_post) extracted.date_post = m.date_post;
    }
  } else if (plateforme === 'instagram') {
    // IG : pas d'oEmbed public gratuit, on tape microlink directement
    extracted = await fetchMicrolinkMeta(trimmed);
  }

  return {
    plateforme,
    thumbnail_url: extracted.thumbnail_url || '',
    date_post: extracted.date_post || '',
    author: extracted.author || '',
    title: extracted.title || '',
    embedUrl,
  };
}
