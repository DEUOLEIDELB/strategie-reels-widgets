// Détection du type de vidéo à partir d'une URL et génération d'un embed.
// V6 : ajout Instagram et TikTok via leurs iframes officielles publiques.

export type VideoKind = 'mp4' | 'youtube' | 'vimeo' | 'drive' | 'instagram' | 'tiktok' | 'other';
export type AspectRatio = 'horizontal' | 'vertical';

export interface VideoEmbed {
  kind: VideoKind;
  embedUrl?: string;
  directUrl: string;
  embeddable: boolean;
  aspect: AspectRatio;
}

const YT_REGEX = /(?:youtube\.com\/(?:watch\?v=|shorts\/|embed\/)|youtu\.be\/)([\w-]{11})/i;
const VIMEO_REGEX = /vimeo\.com\/(\d+)/i;
const DRIVE_REGEX = /drive\.google\.com\/(?:file\/d\/([\w-]+)|open\?id=([\w-]+))/i;
const IG_REGEX = /instagram\.com\/(?:reel|reels|p|tv)\/([\w-]+)/i;
const TT_REGEX = /tiktok\.com\/@[\w.\-]+\/video\/(\d+)/i;
const TT_SHORT_REGEX = /(?:vm|vt)\.tiktok\.com\/([\w]+)/i;

export function detectVideo(url: string | undefined | null): VideoEmbed | null {
  if (!url) return null;
  const u = url.trim();
  if (!u) return null;

  if (/\.(mp4|webm|mov|m4v)(\?|$)/i.test(u)) {
    return { kind: 'mp4', directUrl: u, embeddable: true, aspect: 'horizontal' };
  }

  // YouTube : Shorts vertical, watch horizontal. On marque vertical si URL contient /shorts/.
  const yt = u.match(YT_REGEX);
  if (yt) {
    const isShort = /youtube\.com\/shorts\//i.test(u);
    return {
      kind: 'youtube',
      directUrl: u,
      embedUrl: `https://www.youtube.com/embed/${yt[1]}`,
      embeddable: true,
      aspect: isShort ? 'vertical' : 'horizontal',
    };
  }

  const vim = u.match(VIMEO_REGEX);
  if (vim) {
    return {
      kind: 'vimeo',
      directUrl: u,
      embedUrl: `https://player.vimeo.com/video/${vim[1]}`,
      embeddable: true,
      aspect: 'horizontal',
    };
  }

  const drive = u.match(DRIVE_REGEX);
  if (drive) {
    const id = drive[1] || drive[2];
    return {
      kind: 'drive',
      directUrl: u,
      embedUrl: `https://drive.google.com/file/d/${id}/preview`,
      embeddable: true,
      aspect: 'horizontal',
    };
  }

  // Instagram embed officiel (Reels, posts vidéo, IGTV).
  const ig = u.match(IG_REGEX);
  if (ig) {
    return {
      kind: 'instagram',
      directUrl: u,
      embedUrl: `https://www.instagram.com/reel/${ig[1]}/embed/?cr=1&v=14`,
      embeddable: true,
      aspect: 'vertical',
    };
  }

  // TikTok embed officiel.
  const tt = u.match(TT_REGEX);
  if (tt) {
    return {
      kind: 'tiktok',
      directUrl: u,
      embedUrl: `https://www.tiktok.com/embed/v2/${tt[1]}`,
      embeddable: true,
      aspect: 'vertical',
    };
  }

  // TikTok short URLs (vm.tiktok.com / vt.tiktok.com) : pas d'embed direct sans résolution server-side.
  const ttShort = u.match(TT_SHORT_REGEX);
  if (ttShort) {
    return {
      kind: 'tiktok',
      directUrl: u,
      embeddable: false,
      aspect: 'vertical',
    };
  }

  return { kind: 'other', directUrl: u, embeddable: false, aspect: 'horizontal' };
}
