import { Plus, Play, Heart, MessageCircle, Eye, Instagram } from 'lucide-react';
import { Card, IconButton } from '@/shared/components';
import type { PostConcurrent, Concurrent } from '@/shared/lib/types';
import { POST_FORMAT_LABELS } from '@/shared/lib/types';
import { cn } from '@/shared/lib/utils';

interface Props {
  post: PostConcurrent;
  concurrent?: Concurrent;
  onClick?: () => void;
  onCapturer?: () => void;
}

function fmtNum(n: number | undefined): string {
  if (!n) return '0';
  if (n >= 1_000_000) return `${(n / 1_000_000).toFixed(1)}M`;
  if (n >= 1000) return `${(n / 1000).toFixed(1)}k`;
  return String(n);
}

function relDate(d: number | string | null | undefined): string {
  if (!d) return '—';
  const dd = new Date(d);
  if (isNaN(dd.getTime())) return '—';
  const days = Math.floor((Date.now() - dd.getTime()) / 864e5);
  if (days < 0) return 'à venir';
  if (days === 0) return "aujourd'hui";
  if (days === 1) return 'hier';
  if (days < 7) return `J-${days}`;
  if (days < 30) return `${Math.floor(days / 7)}sem`;
  return `${Math.floor(days / 30)}mois`;
}

export function ConcurrentPostCard({ post, concurrent, onClick, onCapturer }: Props) {
  const viral = post.score_viralite >= 2;
  const isCaptured = !!post.captured_signal;

  return (
    <Card
      hoverable
      onClick={onClick}
      className="group overflow-hidden p-0 flex flex-col"
    >
      {/* Thumbnail container 9:16 */}
      <div className="relative aspect-[9/16] bg-surface-alt overflow-hidden">
        {post.thumbnail_url ? (
          <img
            src={post.thumbnail_url}
            alt=""
            loading="lazy"
            className="w-full h-full object-cover"
            onError={(e) => {
              (e.target as HTMLImageElement).style.display = 'none';
            }}
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center text-text-muted">
            <Play size={28} strokeWidth={1.5} />
          </div>
        )}

        {/* Top gradient overlay for top-row info */}
        <div className="absolute inset-x-0 top-0 h-16 bg-gradient-to-b from-black/60 to-transparent pointer-events-none" />
        {/* Bottom gradient overlay for metrics */}
        <div className="absolute inset-x-0 bottom-0 h-20 bg-gradient-to-t from-black/70 to-transparent pointer-events-none" />

        {/* Top-left: date relative */}
        <div className="absolute top-2 left-2 text-[10px] font-semibold text-white px-1.5 py-0.5 rounded-sm bg-black/40 backdrop-blur-sm">
          {relDate(post.date_post)}
        </div>

        {/* Top-right: capturer button */}
        {onCapturer && (
          <div className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity">
            <IconButton
              icon={Plus}
              label="Capturer signal"
              size="sm"
              tone="primary"
              onClick={(e) => {
                e.stopPropagation();
                onCapturer();
              }}
            />
          </div>
        )}

        {/* Viral badge */}
        {viral && (
          <div className="absolute top-2 right-2 group-hover:opacity-0 transition-opacity">
            <span className="inline-flex items-center gap-0.5 px-1.5 py-0.5 rounded-sm bg-danger text-on-danger text-[10px] font-bold">
              🔥 viral
            </span>
          </div>
        )}

        {/* Captured indicator */}
        {isCaptured && (
          <div className="absolute bottom-14 right-2">
            <span className="inline-flex items-center px-1.5 py-0.5 rounded-sm bg-success text-on-success text-[10px] font-bold">
              ✓ capturé
            </span>
          </div>
        )}

        {/* Big vues number bottom-left */}
        <div className="absolute bottom-2 left-2 right-2 flex items-end justify-between">
          <div className="text-white">
            <div className="text-2xl font-bold leading-none drop-shadow-md">
              {fmtNum(post.vues)}
            </div>
            <div className="text-[10px] uppercase tracking-wider opacity-80 mt-0.5">vues</div>
          </div>
          <div className="flex flex-col items-end gap-1 text-white text-[11px] font-medium">
            <span className="inline-flex items-center gap-0.5 drop-shadow">
              <Heart size={11} strokeWidth={2} fill="currentColor" />
              {fmtNum(post.likes)}
            </span>
            <span className="inline-flex items-center gap-0.5 drop-shadow">
              <MessageCircle size={11} strokeWidth={2} />
              {fmtNum(post.comments)}
            </span>
          </div>
        </div>

        {/* Plateforme icon top-right pinned */}
        {post.plateforme === 'instagram' && (
          <div
            className={cn(
              'absolute top-2 right-12 transition-opacity',
              onCapturer ? 'group-hover:opacity-0' : '',
            )}
          >
            <Instagram size={14} className="text-white drop-shadow" />
          </div>
        )}
      </div>

      {/* Footer with concurrent + format */}
      <div className="px-2.5 py-2 flex items-center justify-between gap-2 bg-surface">
        <div className="min-w-0 flex items-center gap-1.5">
          <div className="w-6 h-6 rounded-full bg-current-soft text-current shrink-0 flex items-center justify-center text-[10px] font-bold uppercase">
            {(concurrent?.nom || '?').slice(0, 2)}
          </div>
          <div className="min-w-0">
            <div className="text-[12px] font-semibold leading-tight truncate">
              {concurrent?.nom || '—'}
            </div>
            <div className="text-[10px] text-text-faint leading-tight truncate">
              {concurrent?.username_ig || ''}
            </div>
          </div>
        </div>
        {post.format_detecte && (
          <span className="shrink-0 text-[10px] font-medium px-1.5 py-0.5 rounded-sm bg-surface-alt text-text-dim border border-border whitespace-nowrap">
            {POST_FORMAT_LABELS[post.format_detecte]}
          </span>
        )}
      </div>

      {/* Score viralité indicator bar */}
      {post.score_viralite > 0 && (
        <div className="h-1 bg-surface-alt overflow-hidden">
          <div
            className={cn(
              'h-full transition-all',
              post.score_viralite >= 3
                ? 'bg-danger'
                : post.score_viralite >= 2
                  ? 'bg-accent'
                  : post.score_viralite >= 1
                    ? 'bg-success'
                    : 'bg-text-muted',
            )}
            style={{ width: `${Math.min(100, post.score_viralite * 25)}%` }}
          />
        </div>
      )}
      {/* Hidden eye icon used by lucide tree-shaking, no UI usage */}
      <Eye size={0} className="hidden" />
    </Card>
  );
}
