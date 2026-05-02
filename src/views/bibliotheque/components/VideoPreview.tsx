import { useState } from 'react';
import { Play, ExternalLink, Image as ImageIcon } from 'lucide-react';
import { detectVideo } from '../lib/videoEmbed';

interface Props {
  url?: string;
  thumbnail?: string;
  alt: string;
}

// Frame vidéo : embed inline si embeddable, sinon thumbnail + bouton "Ouvrir".
// Sans aucune URL : placeholder neutre.
export function VideoPreview({ url, thumbnail, alt }: Props) {
  const [playing, setPlaying] = useState(false);
  const video = detectVideo(url);

  if (!video) {
    if (thumbnail) {
      return (
        <a
          href={thumbnail}
          target="_blank"
          rel="noopener noreferrer"
          className="block aspect-video rounded-sm overflow-hidden bg-surface-alt border border-border"
        >
          <img src={thumbnail} alt={alt} className="w-full h-full object-cover" />
        </a>
      );
    }
    return (
      <div className="aspect-video rounded-sm bg-surface-alt border border-border flex items-center justify-center text-text-faint">
        <ImageIcon size={20} strokeWidth={1.5} />
      </div>
    );
  }

  if (video.kind === 'mp4') {
    return (
      <div className="aspect-video rounded-sm overflow-hidden bg-text border border-border">
        <video src={video.directUrl} controls preload="metadata" className="w-full h-full" />
      </div>
    );
  }

  if (video.embeddable && video.embedUrl) {
    if (playing) {
      return (
        <div className="aspect-video rounded-sm overflow-hidden bg-text border border-border">
          <iframe
            src={`${video.embedUrl}?autoplay=1`}
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
        className="group relative aspect-video rounded-sm overflow-hidden bg-surface-alt border border-border hover:border-border-strong transition-colors w-full"
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

  // Pas embeddable, juste un lien
  return (
    <a
      href={video.directUrl}
      target="_blank"
      rel="noopener noreferrer"
      className="aspect-video rounded-sm overflow-hidden bg-surface-alt border border-border flex flex-col items-center justify-center gap-1 hover:border-border-strong transition-colors text-text-dim"
    >
      <ExternalLink size={20} strokeWidth={1.5} />
      <span className="text-[11px]">Ouvrir la vidéo</span>
    </a>
  );
}
