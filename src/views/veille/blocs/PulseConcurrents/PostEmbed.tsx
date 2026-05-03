import { Play } from 'lucide-react';
import type { PostConcurrent } from '@/shared/lib/types';
import { getEmbedUrl } from './lib/postMeta';

interface Props {
  post: PostConcurrent;
  className?: string;
}

// Player intégré pour un post concurrent.
// IG : iframe officiel /embed/. TT : iframe v2. YT : iframe standard.
// Fallback sur la thumbnail + lien externe si embedUrl absent ou en erreur.
export function PostEmbed({ post, className }: Props) {
  const embed = getEmbedUrl(post.url_post);
  const aspect =
    post.plateforme === 'youtube' && !post.url_post.includes('/shorts/')
      ? 'aspect-video'
      : 'aspect-[9/16]';

  if (!embed) {
    return <Fallback post={post} className={`${className || ''} ${aspect}`} />;
  }

  return (
    <div className={`relative ${aspect} bg-black overflow-hidden ${className || ''}`}>
      <iframe
        src={embed}
        title={post.url_post}
        loading="lazy"
        className="absolute inset-0 w-full h-full"
        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
        allowFullScreen
        scrolling="no"
        frameBorder={0}
      />
    </div>
  );
}

function Fallback({ post, className }: { post: PostConcurrent; className?: string }) {
  return (
    <a
      href={post.url_post}
      target="_blank"
      rel="noopener"
      className={`relative block bg-surface-alt overflow-hidden group ${className || ''}`}
    >
      {post.thumbnail_url ? (
        <img
          src={post.thumbnail_url}
          alt=""
          className="w-full h-full object-cover"
        />
      ) : (
        <div className="absolute inset-0 flex items-center justify-center text-text-muted">
          <Play size={36} strokeWidth={1.5} />
        </div>
      )}
      <div className="absolute inset-0 flex items-center justify-center bg-black/0 group-hover:bg-black/40 transition-colors">
        <div className="opacity-0 group-hover:opacity-100 px-3 py-1.5 rounded-md bg-white/90 text-text text-xs font-semibold">
          Ouvrir sur {post.plateforme || 'la plateforme'} ↗
        </div>
      </div>
    </a>
  );
}
