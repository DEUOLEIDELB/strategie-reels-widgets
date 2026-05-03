import { useState } from 'react';
import {
  ExternalLink,
  Heart,
  MessageCircle,
  Eye,
  Calendar,
  Trash2,
  Sparkles,
  Pencil,
  Check,
  X,
  Wand2,
  Loader2,
} from 'lucide-react';
import { Drawer, Button, IconButton, Input, Select } from '@/shared/components';
import {
  useDeletePostConcurrent,
  useUpdatePostConcurrent,
  useCreateReel,
} from '@/shared/hooks/grist';
import { useAppStore } from '@/shared/store';
import type {
  PostConcurrent,
  Concurrent,
  PostFormat,
} from '@/shared/lib/types';
import { POST_FORMAT_LABELS, POST_FORMATS } from '@/shared/lib/types';
import toast from 'react-hot-toast';
import { cn } from '@/shared/lib/utils';
import { PostEmbed } from './PostEmbed';
import { fetchPostStats, statsAvailableFor } from './lib/statsFetcher';

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
  const update = useUpdatePostConcurrent();
  const createReel = useCreateReel();
  const setView = useAppStore((s) => s.setView);

  const [editingMetrics, setEditingMetrics] = useState(false);
  const [draftVues, setDraftVues] = useState<number | ''>('');
  const [draftLikes, setDraftLikes] = useState<number | ''>('');
  const [draftComments, setDraftComments] = useState<number | ''>('');
  const [draftFormat, setDraftFormat] = useState<PostFormat | ''>('');
  const [autoFetching, setAutoFetching] = useState(false);

  if (!post) return null;

  function startEdit() {
    setDraftVues(post!.vues || '');
    setDraftLikes(post!.likes || '');
    setDraftComments(post!.comments || '');
    setDraftFormat(post!.format_detecte || '');
    setEditingMetrics(true);
  }

  function saveEdit() {
    update.mutate(
      {
        id: post!.id,
        fields: {
          vues: typeof draftVues === 'number' ? draftVues : 0,
          likes: typeof draftLikes === 'number' ? draftLikes : 0,
          comments: typeof draftComments === 'number' ? draftComments : 0,
          format_detecte: (draftFormat || '') as PostFormat,
        },
      },
      {
        onSuccess: () => {
          toast.success('Métriques mises à jour');
          setEditingMetrics(false);
        },
        onError: (e) => toast.error(`Échec : ${(e as Error).message}`),
      },
    );
  }

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

  async function handleAutoFetchStats() {
    setAutoFetching(true);
    try {
      const stats = await fetchPostStats(post!.url_post);
      if (!stats || (stats.vues === 0 && stats.likes === 0 && stats.comments === 0)) {
        toast.error('Stats indisponibles depuis cette URL');
        return;
      }
      update.mutate(
        {
          id: post!.id,
          fields: {
            vues: stats.vues,
            likes: stats.likes,
            comments: stats.comments,
          },
        },
        {
          onSuccess: () => toast.success(`Stats récupérées (${stats.source})`),
          onError: (e) => toast.error(`Échec : ${(e as Error).message}`),
        },
      );
    } finally {
      setAutoFetching(false);
    }
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

  const hasMetrics = (post.vues || 0) > 0 || (post.likes || 0) > 0 || (post.comments || 0) > 0;
  const ratio = post.vues > 0 ? ((post.likes / post.vues) * 100).toFixed(1) : null;
  const score = post.score_viralite || 0;

  return (
    <Drawer open={open} onOpenChange={onOpenChange} title={concurrent?.nom || 'Post concurrent'} width={520}>
      <div className="flex flex-col">
        {/* Embed player */}
        <div className="relative bg-black max-h-[55vh] overflow-hidden">
          <PostEmbed post={post} />
          {/* Score viralité badge overlay */}
          {score >= 1 && (
            <div className="absolute top-3 left-3 px-2 py-1 rounded-md bg-black/70 backdrop-blur-sm text-white text-xs font-bold pointer-events-none">
              Score viralité : ×{score.toFixed(1)}
            </div>
          )}
          {post.url_post && (
            <a
              href={post.url_post}
              target="_blank"
              rel="noopener"
              className="absolute top-3 right-3 inline-flex items-center gap-1 px-2 py-1 rounded-md bg-black/70 backdrop-blur-sm text-white text-xs font-medium hover:bg-black/90 z-10"
            >
              Ouvrir <ExternalLink size={12} />
            </a>
          )}
        </div>

        {/* Stats grid (éditable) */}
        <div className="border-b border-border">
          {editingMetrics ? (
            <div className="p-3 flex flex-col gap-2 bg-current-soft/40">
              <div className="grid grid-cols-3 gap-2">
                <Input
                  type="number"
                  size="sm"
                  value={draftVues}
                  onChange={(e) => setDraftVues(e.target.value === '' ? '' : Number(e.target.value))}
                  placeholder="Vues"
                />
                <Input
                  type="number"
                  size="sm"
                  value={draftLikes}
                  onChange={(e) => setDraftLikes(e.target.value === '' ? '' : Number(e.target.value))}
                  placeholder="Likes"
                />
                <Input
                  type="number"
                  size="sm"
                  value={draftComments}
                  onChange={(e) => setDraftComments(e.target.value === '' ? '' : Number(e.target.value))}
                  placeholder="Comments"
                />
              </div>
              <Select
                size="sm"
                value={draftFormat}
                onChange={(e) => setDraftFormat(e.target.value as PostFormat | '')}
              >
                <option value="">— Non classé —</option>
                {POST_FORMATS.map((f) => (
                  <option key={f} value={f}>
                    {POST_FORMAT_LABELS[f]}
                  </option>
                ))}
              </Select>
              <div className="flex justify-end gap-1">
                <IconButton
                  icon={X}
                  label="Annuler"
                  size="sm"
                  onClick={() => setEditingMetrics(false)}
                />
                <IconButton
                  icon={Check}
                  label="Enregistrer"
                  size="sm"
                  tone="primary"
                  onClick={saveEdit}
                />
              </div>
            </div>
          ) : hasMetrics ? (
            <div className="grid grid-cols-3 relative group">
              <Stat icon={<Eye size={14} />} label="Vues" value={fmtNum(post.vues)} />
              <Stat icon={<Heart size={14} />} label="Likes" value={fmtNum(post.likes)} />
              <Stat icon={<MessageCircle size={14} />} label="Comments" value={fmtNum(post.comments)} />
              <div className="absolute top-1 right-1 flex gap-0.5 opacity-0 group-hover:opacity-100 transition-opacity">
                {statsAvailableFor(post.url_post).available && (
                  <button
                    onClick={handleAutoFetchStats}
                    disabled={autoFetching}
                    className="p-1 rounded-sm text-current hover:bg-current-soft"
                    title="Auto-récupérer les stats à jour"
                  >
                    {autoFetching ? (
                      <Loader2 size={12} className="animate-spin" />
                    ) : (
                      <Wand2 size={12} />
                    )}
                  </button>
                )}
                <button
                  onClick={startEdit}
                  className="p-1 rounded-sm text-text-faint hover:text-text hover:bg-surface-alt"
                  title="Éditer les métriques"
                >
                  <Pencil size={12} />
                </button>
              </div>
            </div>
          ) : (
            <div className="flex flex-col gap-1 p-2">
              {statsAvailableFor(post.url_post).available ? (
                <button
                  onClick={handleAutoFetchStats}
                  disabled={autoFetching}
                  className="w-full px-3 py-2.5 rounded-md text-xs font-semibold text-on-current bg-current hover:brightness-95 disabled:opacity-50 flex items-center justify-center gap-2"
                >
                  {autoFetching ? (
                    <>
                      <Loader2 size={12} className="animate-spin" /> Récupération en cours…
                    </>
                  ) : (
                    <>
                      <Wand2 size={12} /> Auto-récupérer vues / likes / comments
                    </>
                  )}
                </button>
              ) : (
                <div className="px-2 py-1 text-[11px] text-text-faint text-center">
                  {statsAvailableFor(post.url_post).reason}
                </div>
              )}
              <button
                onClick={startEdit}
                className="w-full px-3 py-1.5 text-xs text-text-dim hover:text-text hover:bg-surface-alt rounded-md flex items-center justify-center gap-2 transition-colors"
              >
                <Pencil size={12} />
                Saisir manuellement
              </button>
            </div>
          )}
        </div>

        <div className="p-4 flex flex-col gap-4">
          {/* Meta : seulement les champs renseignés */}
          {(post.date_post || post.plateforme || post.format_detecte || ratio !== null) && (
            <div className="grid grid-cols-2 gap-3 text-xs">
              {post.date_post && (
                <Field icon={<Calendar size={12} />} label="Date" value={fmtDate(post.date_post)} />
              )}
              {post.plateforme && (
                <Field label="Plateforme" value={post.plateforme.toUpperCase()} />
              )}
              {post.format_detecte && (
                <Field label="Format" value={POST_FORMAT_LABELS[post.format_detecte]} />
              )}
              {ratio !== null && <Field label="Engagement rate" value={`${ratio}%`} />}
            </div>
          )}

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
