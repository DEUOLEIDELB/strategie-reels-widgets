import { ExternalLink, Heart, MessageCircle, Eye, Calendar, Trash2, Sparkles } from 'lucide-react';
import { Drawer, Button, IconButton } from '@/shared/components';
import {
  useDeletePostConcurrent,
  useCreateReel,
} from '@/shared/hooks/grist';
import { useAppStore } from '@/shared/store';
import type { PostConcurrent, Concurrent } from '@/shared/lib/types';
import { POST_FORMAT_LABELS } from '@/shared/lib/types';
import toast from 'react-hot-toast';
import { cn } from '@/shared/lib/utils';

interface Props {
  post: PostConcurrent | null;
  concurrent?: Concurrent;
  open: boolean;
  onOpenChange: (o: boolean) => void;
  onCapturer: (post: PostConcurrent) => void;
}

function fmtNum(n: number | undefined): string {
  if (!n) return '0';
  return n.toLocaleString('fr-FR');
}

function fmtDate(d: number | string | null | undefined): string {
  if (!d) return '—';
  const dd = new Date(d);
  if (isNaN(dd.getTime())) return '—';
  return dd.toLocaleDateString('fr-FR', { day: '2-digit', month: 'short', year: 'numeric' });
}

export function ConcurrentPostDrawer({ post, concurrent, open, onOpenChange, onCapturer }: Props) {
  const del = useDeletePostConcurrent();
  const createReel = useCreateReel();
  const setView = useAppStore((s) => s.setView);

  if (!post) return null;

  function handleDelete() {
    if (!confirm('Supprimer ce post du feed ?')) return;
    del.mutate(post!.id, {
      onSuccess: () => {
        toast.success('Post supprimé');
        onOpenChange(false);
      },
      onError: (e) => toast.error(`Échec : ${(e as Error).message}`),
    });
  }

  function handleCreateReelInspire() {
    const titre = `Inspiré de ${concurrent?.nom || 'concurrent'}`;
    createReel.mutate(
      {
        titre,
        objectif: `Reproduire le format ${post!.format_detecte || 'détecté'} de ${concurrent?.nom || ''} (${fmtNum(post!.vues)} vues)`,
        statut: 'concept',
      },
      {
        onSuccess: () => {
          toast.success('Reel concept créé. Direction Atelier.');
          setView('atelier');
        },
        onError: (e) => toast.error(`Échec : ${(e as Error).message}`),
      },
    );
  }

  const ratio = post.vues ? ((post.likes / post.vues) * 100).toFixed(1) : '0';
  const score = post.score_viralite || 0;

  return (
    <Drawer open={open} onOpenChange={onOpenChange} title={concurrent?.nom || 'Post concurrent'} width={480}>
      <div className="flex flex-col">
        {/* Visual hero */}
        <div className="relative aspect-[9/16] bg-text/5 max-h-[50vh] overflow-hidden">
          {post.thumbnail_url ? (
            <img src={post.thumbnail_url} alt="" className="w-full h-full object-cover" />
          ) : (
            <div className="w-full h-full flex items-center justify-center text-text-muted">
              Pas de thumbnail
            </div>
          )}
          {/* Score viralité badge */}
          {score >= 1 && (
            <div className="absolute top-3 left-3 px-2 py-1 rounded-md bg-black/60 backdrop-blur-sm text-white text-xs font-bold">
              Score viralité : ×{score.toFixed(1)}
            </div>
          )}
          {/* External link */}
          {post.url_post && (
            <a
              href={post.url_post}
              target="_blank"
              rel="noopener"
              className="absolute top-3 right-3 inline-flex items-center gap-1 px-2 py-1 rounded-md bg-black/60 backdrop-blur-sm text-white text-xs font-medium hover:bg-black/80"
            >
              Ouvrir <ExternalLink size={12} />
            </a>
          )}
        </div>

        {/* Stats grid */}
        <div className="grid grid-cols-3 border-b border-border">
          <Stat icon={<Eye size={14} />} label="Vues" value={fmtNum(post.vues)} />
          <Stat icon={<Heart size={14} />} label="Likes" value={fmtNum(post.likes)} />
          <Stat icon={<MessageCircle size={14} />} label="Comments" value={fmtNum(post.comments)} />
        </div>

        <div className="p-4 flex flex-col gap-4">
          {/* Meta */}
          <div className="grid grid-cols-2 gap-3 text-xs">
            <Field icon={<Calendar size={12} />} label="Date" value={fmtDate(post.date_post)} />
            <Field
              label="Plateforme"
              value={post.plateforme ? post.plateforme.toUpperCase() : '—'}
            />
            <Field
              label="Format"
              value={post.format_detecte ? POST_FORMAT_LABELS[post.format_detecte] : '—'}
            />
            <Field label="Engagement rate" value={`${ratio}%`} />
          </div>

          {/* Caption */}
          {post.caption && (
            <div>
              <div className="text-[11px] font-semibold uppercase tracking-wide text-text-faint mb-1">
                Caption
              </div>
              <div className="text-xs leading-relaxed p-2 rounded-sm border border-border bg-surface-alt whitespace-pre-wrap">
                {post.caption}
              </div>
            </div>
          )}

          {/* Captured indicator */}
          {post.captured_signal && (
            <div className="text-xs text-success font-medium px-2 py-1.5 rounded-sm bg-success-soft border border-success/30">
              ✓ Signal déjà capturé pour ce post
            </div>
          )}

          {/* Actions */}
          <div className="flex flex-col gap-2 pt-2 border-t border-border">
            <Button variant="primary" onClick={() => onCapturer(post)} disabled={!!post.captured_signal}>
              {post.captured_signal ? 'Signal déjà capturé' : 'Capturer comme signal'}
            </Button>
            <Button variant="secondary" onClick={handleCreateReelInspire}>
              <Sparkles size={12} className="mr-1.5" />
              Créer Reel Wubo inspiré
            </Button>
            <div className="flex justify-end">
              <IconButton
                icon={Trash2}
                label="Supprimer le post"
                size="sm"
                tone="danger"
                onClick={handleDelete}
              />
            </div>
          </div>
        </div>
      </div>
    </Drawer>
  );
}

function Stat({
  icon,
  label,
  value,
}: {
  icon?: React.ReactNode;
  label: string;
  value: string;
}) {
  return (
    <div className="px-3 py-2.5 text-center border-r border-border last:border-r-0">
      <div className="flex items-center justify-center gap-1 text-[10px] uppercase tracking-wide text-text-faint mb-0.5">
        {icon}
        {label}
      </div>
      <div className="text-base font-bold tabular-nums">{value}</div>
    </div>
  );
}

function Field({
  icon,
  label,
  value,
}: {
  icon?: React.ReactNode;
  label: string;
  value: string;
}) {
  return (
    <div>
      <div className={cn('flex items-center gap-1 text-[10px] uppercase tracking-wide text-text-faint')}>
        {icon}
        {label}
      </div>
      <div className="font-medium text-text">{value}</div>
    </div>
  );
}
