import { useState } from 'react';
import {
  ExternalLink,
  Trash2,
  Sparkles,
  Pencil,
  Check,
  X,
  Wand2,
  Loader2,
  Play,
  ChevronDown,
  Calendar,
} from 'lucide-react';
import { Drawer, Button, IconButton, Input, Select, Modal } from '@/shared/components';
import {
  useDeletePostConcurrent,
  useUpdatePostConcurrent,
  useCreateReel,
  usePostsConcurrents,
} from '@/shared/hooks/grist';
import { useAppStore } from '@/shared/store';
import type { PostConcurrent, Concurrent, PostFormat } from '@/shared/lib/types';
import { POST_FORMAT_LABELS, POST_FORMATS } from '@/shared/lib/types';
import toast from 'react-hot-toast';
import { cn } from '@/shared/lib/utils';
import { PostEmbed } from './PostEmbed';
import { fetchPostStats, statsAvailableFor } from './lib/statsFetcher';
import { PostAnalytics } from './PostAnalytics';
import { withComputedScores } from './lib/viralScore';

interface Props {
  post: PostConcurrent | null;
  concurrent?: Concurrent;
  open: boolean;
  onOpenChange: (o: boolean) => void;
  onCapturer: (post: PostConcurrent) => void;
}

function fmtDate(d: number | string | null | undefined): string {
  if (!d) return '—';
  const dd = new Date(d);
  if (isNaN(dd.getTime())) return '—';
  return dd.toLocaleDateString('fr-FR', { day: '2-digit', month: 'short', year: 'numeric' });
}

function relDate(d: number | string | null | undefined): string {
  if (!d) return '—';
  const dd = new Date(d);
  if (isNaN(dd.getTime())) return '—';
  const days = Math.floor((Date.now() - dd.getTime()) / 864e5);
  if (days === 0) return "aujourd'hui";
  if (days === 1) return 'hier';
  if (days < 30) return `il y a ${days}j`;
  return `il y a ${Math.floor(days / 30)} mois`;
}

export function ConcurrentPostDrawer({
  post,
  concurrent,
  open,
  onOpenChange,
  onCapturer,
}: Props) {
  const del = useDeletePostConcurrent();
  const update = useUpdatePostConcurrent();
  const createReel = useCreateReel();
  const setView = useAppStore((s) => s.setView);
  const allPostsQ = usePostsConcurrents();

  const [editingMetrics, setEditingMetrics] = useState(false);
  const [draftVues, setDraftVues] = useState<number | ''>('');
  const [draftLikes, setDraftLikes] = useState<number | ''>('');
  const [draftComments, setDraftComments] = useState<number | ''>('');
  const [draftFormat, setDraftFormat] = useState<PostFormat | ''>('');
  const [autoFetching, setAutoFetching] = useState(false);
  const [showVideo, setShowVideo] = useState(false);
  const [showMeta, setShowMeta] = useState(false);

  if (!post) return null;

  // Recalcule les scores en mémoire pour la cohérence avec la card
  const allPostsScored = withComputedScores(allPostsQ.data || []);
  const liveScore =
    allPostsScored.find((p) => p.id === post.id)?.score_viralite ?? post.score_viralite;
  const livePost: PostConcurrent = { ...post, score_viralite: liveScore };

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
          fields: { vues: stats.vues, likes: stats.likes, comments: stats.comments },
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
        objectif: `Reproduire le format ${post!.format_detecte || 'détecté'} de ${concurrent?.nom || ''}`,
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

  const hasMetrics = (post.vues || 0) > 0 || (post.likes || 0) > 0;
  const statsCanAuto = statsAvailableFor(post.url_post).available;

  return (
    <>
      <Drawer
        open={open}
        onOpenChange={onOpenChange}
        title={concurrent?.nom || 'Post concurrent'}
        width={520}
      >
        <div className="flex flex-col">
          {/* Header compact : thumbnail mini + identité + bouton play */}
          <div className="flex gap-3 p-3 border-b border-border bg-surface-two">
            <button
              onClick={() => setShowVideo(true)}
              className="relative w-20 aspect-[9/16] shrink-0 rounded-md overflow-hidden bg-black group"
              aria-label="Lire la vidéo"
            >
              {post.thumbnail_url ? (
                <img
                  src={post.thumbnail_url}
                  alt=""
                  className="w-full h-full object-cover"
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center text-white/60">
                  <Play size={20} />
                </div>
              )}
              <div className="absolute inset-0 flex items-center justify-center bg-black/30 group-hover:bg-black/50 transition-colors">
                <div className="w-8 h-8 rounded-full bg-white/95 text-text flex items-center justify-center group-hover:scale-110 transition-transform">
                  <Play size={14} fill="currentColor" />
                </div>
              </div>
            </button>
            <div className="flex-1 min-w-0 flex flex-col justify-between">
              <div>
                <div className="text-sm font-semibold leading-tight">
                  {concurrent?.nom || 'Post concurrent'}
                </div>
                {concurrent?.username_ig && (
                  <div className="text-[11px] text-text-faint leading-tight mt-0.5">
                    {concurrent.username_ig}
                  </div>
                )}
                <div className="flex items-center gap-1 text-[11px] text-text-faint mt-1.5">
                  <Calendar size={10} />
                  {relDate(post.date_post)}
                  {post.plateforme && (
                    <>
                      <span>·</span>
                      <span className="uppercase">{post.plateforme}</span>
                    </>
                  )}
                  {post.format_detecte && (
                    <>
                      <span>·</span>
                      <span>{POST_FORMAT_LABELS[post.format_detecte]}</span>
                    </>
                  )}
                </div>
              </div>
              {post.url_post && (
                <a
                  href={post.url_post}
                  target="_blank"
                  rel="noopener"
                  className="self-start inline-flex items-center gap-1 text-[11px] text-current hover:underline"
                >
                  Ouvrir sur {post.plateforme || 'la plateforme'} <ExternalLink size={10} />
                </a>
              )}
            </div>
          </div>

          {/* Bandeau métriques + actions */}
          {hasMetrics && !editingMetrics ? (
            <div className="grid grid-cols-3 border-b border-border bg-surface relative group">
              <Stat label="Vues" value={post.vues.toLocaleString('fr-FR')} />
              <Stat label="Likes" value={post.likes.toLocaleString('fr-FR')} />
              <Stat label="Comments" value={post.comments.toLocaleString('fr-FR')} />
              <div className="absolute top-1 right-1 flex gap-0.5 opacity-0 group-hover:opacity-100 transition-opacity">
                {statsCanAuto && (
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
          ) : editingMetrics ? (
            <div className="p-3 flex flex-col gap-2 border-b border-border bg-current-soft/40">
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
                  onChange={(e) =>
                    setDraftComments(e.target.value === '' ? '' : Number(e.target.value))
                  }
                  placeholder="Comments"
                />
              </div>
              <Select
                size="sm"
                value={draftFormat}
                onChange={(e) => setDraftFormat(e.target.value as PostFormat | '')}
              >
                <option value="">— Format non classé —</option>
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
          ) : (
            <div className="flex flex-col gap-1 p-3 border-b border-border">
              {statsCanAuto ? (
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

          {/* Coeur : analytics dashboard */}
          <div className="p-4 border-b border-border">
            <PostAnalytics post={livePost} allPosts={allPostsScored} concurrent={concurrent} />
          </div>

          {/* Caption en accordéon */}
          {post.caption && (
            <details className="border-b border-border">
              <summary className="px-4 py-2 text-[11px] font-semibold uppercase tracking-wide text-text-faint cursor-pointer hover:bg-surface-alt list-none flex items-center gap-1">
                <ChevronDown size={12} className="transition-transform [details[open]>summary>&]:rotate-180" />
                Caption
              </summary>
              <div className="px-4 pb-3 text-xs text-text-dim leading-relaxed whitespace-pre-wrap">
                {post.caption}
              </div>
            </details>
          )}

          {/* Métadonnées techniques en accordéon */}
          <details
            className="border-b border-border"
            open={showMeta}
            onToggle={(e) => setShowMeta((e.target as HTMLDetailsElement).open)}
          >
            <summary className="px-4 py-2 text-[11px] font-semibold uppercase tracking-wide text-text-faint cursor-pointer hover:bg-surface-alt list-none flex items-center gap-1">
              <ChevronDown
                size={12}
                className={cn('transition-transform', showMeta && 'rotate-180')}
              />
              Métadonnées
            </summary>
            <div className="px-4 pb-3 grid grid-cols-2 gap-2 text-xs">
              <Field label="Date complète" value={fmtDate(post.date_post)} />
              <Field
                label="Plateforme"
                value={post.plateforme ? post.plateforme.toUpperCase() : '—'}
              />
              <Field
                label="Format"
                value={post.format_detecte ? POST_FORMAT_LABELS[post.format_detecte] : '—'}
              />
              <Field label="ID interne" value={`#${post.id}`} />
            </div>
          </details>

          {/* Captured indicator */}
          {post.captured_signal && (
            <div className="m-4 text-xs text-success font-medium px-2 py-1.5 rounded-sm bg-success-soft border border-success/30">
              ✓ Signal déjà capturé pour ce post
            </div>
          )}

          {/* Actions footer */}
          <div className="p-4 flex flex-col gap-2 border-t border-border bg-surface-two">
            <Button
              variant="primary"
              onClick={() => onCapturer(post)}
              disabled={!!post.captured_signal}
            >
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
      </Drawer>

      {/* Modale vidéo séparée pour ne pas casser le drawer */}
      <Modal
        open={showVideo}
        onOpenChange={setShowVideo}
        title={concurrent?.nom ? `Vidéo : ${concurrent.nom}` : 'Vidéo'}
        size="md"
      >
        <div className="p-4">
          <div className="max-w-[320px] mx-auto">
            <PostEmbed post={post} />
          </div>
          <div className="mt-3 text-center">
            <a
              href={post.url_post}
              target="_blank"
              rel="noopener"
              className="inline-flex items-center gap-1 text-xs text-current hover:underline"
            >
              Ouvrir sur {post.plateforme || 'la plateforme'} <ExternalLink size={10} />
            </a>
          </div>
        </div>
      </Modal>
    </>
  );
}

function Stat({ label, value }: { label: string; value: string }) {
  return (
    <div className="px-3 py-2.5 text-center border-r border-border last:border-r-0">
      <div className="text-[10px] uppercase tracking-wide text-text-faint mb-0.5">{label}</div>
      <div className="text-base font-bold tabular-nums">{value}</div>
    </div>
  );
}

function Field({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <div className="text-[10px] uppercase tracking-wide text-text-faint">{label}</div>
      <div className="font-medium text-text text-xs">{value}</div>
    </div>
  );
}
