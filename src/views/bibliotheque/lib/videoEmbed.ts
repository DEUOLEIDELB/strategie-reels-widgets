// Détection du type de vidéo à partir d'une URL et génération d'un embed.

export type VideoKind = 'mp4' | 'youtube' | 'vimeo' | 'drive' | 'other';

export interface VideoEmbed {
  kind: VideoKind;
  embedUrl?: string;
  directUrl: string;
  embeddable: boolean;
}

const YT_REGEX = /(?:youtube\.com\/(?:watch\?v=|shorts\/|embed\/)|youtu\.be\/)([\w-]{11})/i;
const VIMEO_REGEX = /vimeo\.com\/(\d+)/i;
const DRIVE_REGEX = /drive\.google\.com\/(?:file\/d\/([\w-]+)|open\?id=([\w-]+))/i;

export function detectVideo(url: string | undefined | null): VideoEmbed | null {
  if (!url) return null;
  const u = url.trim();
  if (!u) return null;

  if (/\.(mp4|webm|mov|m4v)(\?|$)/i.test(u)) {
    return { kind: 'mp4', directUrl: u, embeddable: true };
  }

  const yt = u.match(YT_REGEX);
  if (yt) {
    return {
      kind: 'youtube',
      directUrl: u,
      embedUrl: `https://www.youtube.com/embed/${yt[1]}`,
      embeddable: true,
    };
  }

  const vim = u.match(VIMEO_REGEX);
  if (vim) {
    return {
      kind: 'vimeo',
      directUrl: u,
      embedUrl: `https://player.vimeo.com/video/${vim[1]}`,
      embeddable: true,
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
    };
  }

  return { kind: 'other', directUrl: u, embeddable: false };
}
