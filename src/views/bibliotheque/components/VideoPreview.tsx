import { useState } from 'react';
import { Play, ExternalLink, Image as ImageIcon } from 'lucide-react';
import { cn } from '@/shared/lib/utils';
import { detectVideo } from '../lib/videoEmbed';

interface Props {
  url?: string;
  thumbnail?: string;
  alt: string;
  forceVertical?: boolean;
}

// Frame vidéo : embed inline si embeddable (mp4 / YouTube / Vimeo / Drive / Instagram / TikTok).
// Aspect 9:16 pour Reels et Shorts, 16:9 pour le reste. Sans URL : placeholder neutre.
export function VideoPreview({ url, thumbnail, alt, forceVertical }: Props) {
  const [playing, setPlaying] = useState(false);
  const video = detectVideo(url);

  const aspect = forceVertical || video?.aspect === 'vertical' ? 'aspect-[9/16]' : 'aspect-video';

  if (!video) {
    if (thumbnail) {
      return (
        <a
          href={thumbnail}
          target="_blank"
          rel="noopener noreferrer"
          className={cn('block rounded-sm overflow-hidden bg-surface-alt border border-border', aspect)}
        >
          <img src={thumbnail} alt={alt} className="w-full h-full object-cover" />
        </a>
      );
    }
    return (
      <div className={cn('rounded-sm bg-surface-alt border border-border flex items-center justify-center text-text-faint', aspect)}>
        <ImageIcon size={20} strokeWidth={1.5} />
      </div>
    );
  }

  // mp4 direct
  if (video.kind === 'mp4') {
    return (
      <div className={cn('rounded-sm overflow-hidden bg-text border border-border', aspect)}>
        <video src={video.directUrl} controls preload="metadata" className="w-full h-full" />
      </div>
    );
  }

  // Instagram et TikTok : embed direct, autoplay impossible côté client. Iframe immédiate.
  if ((video.kind === 'instagram' || video.kind === 'tiktok') && video.embedUrl) {
    return (
      <div className={cn('rounded-sm overflow-hidden bg-surface-alt border border-border', aspect)}>
        <iframe
          src={video.embedUrl}
          title={alt}
          allow="encrypted-media; picture-in-picture"
          allowFullScreen
          loading="lazy"
          scrolling="no"
          className="w-full h-full border-0"
        />
      </div>
    );
  }

  // YouTube et Vimeo et Drive : preview avec play button, embed à la demande
  if (video.embeddable && video.embedUrl) {
    if (playing) {
      return (
        <div className={cn('rounded-sm overflow-hidden bg-text border border-border', aspect)}>
          <iframe
            src={`${video.embedUrl}${video.embedUrl.includes('?') ? '&' : '?'}autoplay=1`}
            title={alt}
            allow="accelerometer; autoplay; encrypted-media; gyroscope; picture-in-picture"
            allowFullScreen
            className="w-full h-full"
          />
        </div>
      );
    }
    return (
      <button
        type="button"
        onClick={() => setPlaying(true)}
        className={cn(
          'group relative rounded-sm overflow-hidden bg-surface-alt border border-border hover:border-border-strong transition-colors w-full',
          aspect,
        )}
        aria-label={`Lire ${alt}`}
      >
        {thumbnail ? (
          <img src={thumbnail} alt={alt} className="w-full h-full object-cover" />
        ) : (
          <div className="w-full h-full flex items-center justify-center">
            <span className="text-[10px] uppercase tracking-wide text-text-faint">{video.kind}</span>
          </div>
        )}
        <span className="absolute inset-0 flex items-center justify-center bg-text/0 group-hover:bg-text/20 transition-colors">
          <span className="inline-flex items-center justify-center w-10 h-10 rounded-full bg-accent text-on-accent shadow-md">
            <Play size={16} strokeWidth={2} fill="currentColor" />
          </span>
        </span>
      </button>
    );
  }

  // Pas embeddable (TikTok short URLs vm.tiktok.com, autres URLs non reconnues)
  return (
    <a
      href={video.directUrl}
      target="_blank"
      rel="noopener noreferrer"
      className={cn(
        'rounded-sm overflow-hidden bg-surface-alt border border-border flex flex-col items-center justify-center gap-1 hover:border-border-strong transition-colors text-text-dim',
        aspect,
      )}
    >
      <ExternalLink size={20} strokeWidth={1.5} />
      <span className="text-[11px]">Ouvrir la vidéo</span>
    </a>
  );
}
