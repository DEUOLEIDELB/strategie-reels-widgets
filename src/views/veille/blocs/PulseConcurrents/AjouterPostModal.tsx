import { useEffect, useRef, useState } from 'react';
import toast from 'react-hot-toast';
import { Loader2, Sparkles, ImageOff, ChevronDown, Wand2, KeyRound, Eye, Heart, MessageCircle } from 'lucide-react';
import {
  Modal,
  ModalBody,
  ModalFooter,
  Button,
  FormField,
  Input,
  Select,
} from '@/shared/components';
import {
  useCreatePostConcurrent,
  useConcurrents,
} from '@/shared/hooks/grist';
import {
  POST_FORMATS,
  POST_FORMAT_LABELS,
  type PostFormat,
  type PostPlateforme,
} from '@/shared/lib/types';
import { fetchPostMeta, detectPlateforme } from './lib/postMeta';
import {
  fetchPostStats,
  hasYouTubeApiKey,
  setYouTubeApiKey,
  statsAvailableFor,
  type PostStats,
} from './lib/statsFetcher';
import { cn } from '@/shared/lib/utils';

interface Props {
  open: boolean;
  onOpenChange: (o: boolean) => void;
  defaultConcurrent?: number;
}

type FetchStatus = 'idle' | 'loading' | 'success' | 'partial' | 'error';

export function AjouterPostModal({ open, onOpenChange, defaultConcurrent }: Props) {
  const create = useCreatePostConcurrent();
  const concurrentsQ = useConcurrents();

  const [url, setUrl] = useState('');
  const [concurrent, setConcurrent] = useState<number | ''>('');
  const [plateforme, setPlateforme] = useState<PostPlateforme | ''>('');
  const [thumbnail, setThumbnail] = useState('');
  const [datePost, setDatePost] = useState('');
  const [vues, setVues] = useState<number | ''>('');
  const [likes, setLikes] = useState<number | ''>('');
  const [comments, setComments] = useState<number | ''>('');
  const [format, setFormat] = useState<PostFormat | ''>('');
  const [showAdvanced, setShowAdvanced] = useState(false);

  const [fetchStatus, setFetchStatus] = useState<FetchStatus>('idle');
  const [fetchedAuthor, setFetchedAuthor] = useState('');
  const [statsStatus, setStatsStatus] = useState<'idle' | 'loading' | 'got' | 'manual' | 'error'>('idle');
  const [statsHint, setStatsHint] = useState('');
  const [hasYtKey, setHasYtKey] = useState(() => hasYouTubeApiKey());
  const lastFetchedUrl = useRef<string>('');

  // Reset à l'ouverture
  useEffect(() => {
    if (open) {
      setUrl('');
      setConcurrent(defaultConcurrent ?? '');
      setPlateforme('');
      setThumbnail('');
      setDatePost('');
      setVues('');
      setLikes('');
      setComments('');
      setFormat('');
      setShowAdvanced(false);
      setFetchStatus('idle');
      setFetchedAuthor('');
      setStatsStatus('idle');
      setStatsHint('');
      setHasYtKey(hasYouTubeApiKey());
      lastFetchedUrl.current = '';
    }
  }, [open, defaultConcurrent]);

  // Auto-detect plateforme dès qu'on saisit (instant)
  useEffect(() => {
    const p = detectPlateforme(url);
    if (p) setPlateforme(p);
  }, [url]);

  // Auto-fetch métadonnées + stats (debounce 600ms après dernière frappe)
  useEffect(() => {
    const u = url.trim();
    if (!u || u === lastFetchedUrl.current) return;
    if (!detectPlateforme(u)) return;
    const handle = setTimeout(async () => {
      lastFetchedUrl.current = u;
      setFetchStatus('loading');
      setStatsStatus('loading');

      // Métadonnées (thumbnail, date, auteur)
      let metaOk = false;
      try {
        const meta = await fetchPostMeta(u);
        setFetchedAuthor(meta.author);
        if (meta.thumbnail_url) setThumbnail(meta.thumbnail_url);
        if (meta.date_post) setDatePost(meta.date_post);
        if (meta.plateforme) setPlateforme(meta.plateforme);
        metaOk = !!meta.thumbnail_url || !!meta.date_post || !!meta.author;
        setFetchStatus(metaOk ? 'success' : 'partial');
      } catch {
        setFetchStatus('error');
      }

      // Stats numériques (vues, likes, comments)
      const avail = statsAvailableFor(u);
      if (!avail.available) {
        setStatsStatus('manual');
        setStatsHint(avail.reason || '');
        return;
      }
      try {
        const stats: PostStats | null = await fetchPostStats(u);
        if (stats && (stats.vues > 0 || stats.likes > 0 || stats.comments > 0)) {
          setVues(stats.vues || '');
          setLikes(stats.likes || '');
          setComments(stats.comments || '');
          setStatsStatus('got');
          setStatsHint(`Source : ${stats.source}`);
        } else {
          setStatsStatus('manual');
          setStatsHint('Stats indisponibles, à saisir manuellement');
        }
      } catch {
        setStatsStatus('error');
        setStatsHint('Échec récupération stats');
      }
    }, 600);
    return () => clearTimeout(handle);
  }, [url, hasYtKey]);

  function handleSetYtKey() {
    const k = window.prompt(
      [
        'Clé YouTube Data API v3.',
        '',
        '1. https://console.cloud.google.com → créer projet',
        '2. APIs & Services → Library → activer "YouTube Data API v3"',
        '3. Credentials → Create credentials → API key',
        '4. (recommandé) Restrictions → HTTP referrers → ajouter ton domaine',
        '5. Copie la clé ici',
      ].join('\n'),
    );
    if (k && k.trim().length > 20) {
      setYouTubeApiKey(k.trim());
      setHasYtKey(true);
      toast.success('Clé YouTube enregistrée');
      // Force un re-fetch
      lastFetchedUrl.current = '';
      const tmp = url;
      setUrl('');
      setTimeout(() => setUrl(tmp), 50);
    }
  }

  const canSubmit = !!url.trim() && !!concurrent && !!plateforme;

  function handleSubmit() {
    if (!canSubmit) return;
    create.mutate(
      {
        url_post: url.trim(),
        concurrent: concurrent as number,
        plateforme: plateforme as PostPlateforme,
        thumbnail_url: thumbnail.trim(),
        date_post: datePost || null,
        vues: typeof vues === 'number' ? vues : 0,
        likes: typeof likes === 'number' ? likes : 0,
        comments: typeof comments === 'number' ? comments : 0,
        format_detecte: (format || '') as PostFormat,
        score_viralite: 0,
        caption: '',
        notes: '',
      },
      {
        onSuccess: () => {
          toast.success('Post ajouté au feed');
          onOpenChange(false);
        },
        onError: (e) => toast.error(`Échec : ${(e as Error).message}`),
      },
    );
  }

  function applyAuthorAsConcurrent() {
    if (!fetchedAuthor || !concurrentsQ.data) return;
    const norm = fetchedAuthor.toLowerCase().replace(/[@\s]/g, '');
    const match = concurrentsQ.data.find((c) => {
      const u = (c.username_ig || '').toLowerCase().replace(/[@\s]/g, '');
      const n = (c.nom || '').toLowerCase().replace(/\s/g, '');
      return u === norm || n === norm;
    });
    if (match) setConcurrent(match.id);
  }

  return (
    <Modal open={open} onOpenChange={onOpenChange} title="Ajouter un post concurrent" size="md">
      <ModalBody>
        <div className="flex flex-col gap-3">
          {/* URL : champ unique principal */}
          <FormField label="URL du post" required hint="Instagram / TikTok / YouTube. Le reste se remplit tout seul.">
            <div className="relative">
              <Input
                value={url}
                onChange={(e) => setUrl(e.target.value)}
                placeholder="https://www.instagram.com/p/..."
                autoFocus
              />
              {fetchStatus === 'loading' && (
                <div className="absolute right-2 top-1/2 -translate-y-1/2 flex items-center gap-1 text-xs text-current">
                  <Loader2 size={12} className="animate-spin" />
                  Recherche…
                </div>
              )}
            </div>
          </FormField>

          {/* Aperçu auto-fetch */}
          {plateforme && (
            <div className="flex gap-3 p-2 rounded-md bg-surface-two border border-border">
              <div className="w-20 aspect-[9/16] shrink-0 rounded-sm overflow-hidden bg-surface-alt flex items-center justify-center">
                {thumbnail ? (
                  <img src={thumbnail} alt="" className="w-full h-full object-cover" />
                ) : (
                  <ImageOff size={20} className="text-text-muted" />
                )}
              </div>
              <div className="flex-1 min-w-0 flex flex-col justify-between text-xs">
                <div>
                  <div className="flex items-center gap-1.5">
                    <span className="px-1.5 py-0.5 rounded-sm bg-surface-alt text-[10px] font-semibold uppercase tracking-wide">
                      {plateforme}
                    </span>
                    {fetchStatus === 'success' && (
                      <span className="inline-flex items-center gap-0.5 text-success font-medium">
                        <Sparkles size={10} /> Auto-rempli
                      </span>
                    )}
                    {fetchStatus === 'partial' && (
                      <span className="text-warning font-medium">Partiel, complète manuellement</span>
                    )}
                    {fetchStatus === 'error' && (
                      <span className="text-danger font-medium">Échec auto-fetch</span>
                    )}
                  </div>
                  {fetchedAuthor && (
                    <div className="mt-1 text-text-dim">
                      Créateur détecté : <span className="font-semibold text-text">{fetchedAuthor}</span>
                      {concurrent === '' && (
                        <button
                          type="button"
                          onClick={applyAuthorAsConcurrent}
                          className="ml-2 text-current underline hover:no-underline"
                        >
                          Lier à un concurrent
                        </button>
                      )}
                    </div>
                  )}
                  {datePost && (
                    <div className="mt-0.5 text-text-faint">Posté le {datePost}</div>
                  )}
                </div>

                {/* Stats récupérées (si succès) */}
                {statsStatus === 'got' &&
                  (typeof vues === 'number' && vues > 0) && (
                    <div className="mt-1 flex items-center gap-2 text-[11px] text-text-dim">
                      <span className="inline-flex items-center gap-0.5">
                        <Eye size={10} />{' '}
                        <span className="font-bold tabular-nums text-text">
                          {(vues || 0).toLocaleString('fr-FR')}
                        </span>
                      </span>
                      {typeof likes === 'number' && likes > 0 && (
                        <span className="inline-flex items-center gap-0.5">
                          <Heart size={10} />{' '}
                          <span className="font-bold tabular-nums text-text">
                            {(likes || 0).toLocaleString('fr-FR')}
                          </span>
                        </span>
                      )}
                      {typeof comments === 'number' && comments > 0 && (
                        <span className="inline-flex items-center gap-0.5">
                          <MessageCircle size={10} />{' '}
                          <span className="font-bold tabular-nums text-text">
                            {(comments || 0).toLocaleString('fr-FR')}
                          </span>
                        </span>
                      )}
                      <span className="text-success font-medium">✓ {statsHint}</span>
                    </div>
                  )}

                {/* Stats indisponibles : YouTube → propose d'ajouter la clé, IG → message */}
                {statsStatus === 'manual' && (
                  <div className="mt-1 text-[11px] flex items-center gap-2">
                    <span className="text-text-faint">{statsHint}</span>
                    {plateforme === 'youtube' && !hasYtKey && (
                      <button
                        type="button"
                        onClick={handleSetYtKey}
                        className="inline-flex items-center gap-0.5 text-current font-semibold hover:underline"
                      >
                        <KeyRound size={10} /> Activer
                      </button>
                    )}
                  </div>
                )}

                {statsStatus === 'loading' && (
                  <div className="mt-1 text-[11px] text-text-faint inline-flex items-center gap-1">
                    <Loader2 size={10} className="animate-spin" /> Récupération des stats…
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Concurrent : seul autre champ obligatoire */}
          <FormField label="Concurrent" required>
            <Select
              value={concurrent === '' ? '' : String(concurrent)}
              onChange={(e) => setConcurrent(e.target.value ? Number(e.target.value) : '')}
            >
              <option value="">— Choisir —</option>
              {(concurrentsQ.data || []).map((c) => (
                <option key={c.id} value={c.id}>
                  {c.nom} ({c.username_ig})
                </option>
              ))}
            </Select>
          </FormField>

          {/* Avancé : enrichissement manuel optionnel */}
          <button
            type="button"
            onClick={() => setShowAdvanced((v) => !v)}
            className="flex items-center gap-1 text-xs text-text-faint hover:text-text font-medium self-start"
          >
            <ChevronDown size={12} className={cn('transition-transform', showAdvanced && 'rotate-180')} />
            {showAdvanced ? 'Masquer enrichissement' : 'Enrichir maintenant (vues / likes / format…)'}
          </button>

          {showAdvanced && (
            <div className="flex flex-col gap-3 pt-2 border-t border-border">
              <div className="grid grid-cols-3 gap-2">
                <FormField label="Vues">
                  <Input
                    type="number"
                    value={vues}
                    onChange={(e) => setVues(e.target.value === '' ? '' : Number(e.target.value))}
                    placeholder="0"
                  />
                </FormField>
                <FormField label="Likes">
                  <Input
                    type="number"
                    value={likes}
                    onChange={(e) => setLikes(e.target.value === '' ? '' : Number(e.target.value))}
                    placeholder="0"
                  />
                </FormField>
                <FormField label="Comments">
                  <Input
                    type="number"
                    value={comments}
                    onChange={(e) => setComments(e.target.value === '' ? '' : Number(e.target.value))}
                    placeholder="0"
                  />
                </FormField>
              </div>
              <div className="grid grid-cols-2 gap-2">
                <FormField label="Date" hint={datePost ? 'Auto' : 'Optionnel'}>
                  <Input
                    type="date"
                    value={datePost}
                    onChange={(e) => setDatePost(e.target.value)}
                  />
                </FormField>
                <FormField label="Format">
                  <Select value={format} onChange={(e) => setFormat(e.target.value as PostFormat | '')}>
                    <option value="">— Non classé —</option>
                    {POST_FORMATS.map((f) => (
                      <option key={f} value={f}>
                        {POST_FORMAT_LABELS[f]}
                      </option>
                    ))}
                  </Select>
                </FormField>
              </div>
              <FormField label="Thumbnail URL" hint={thumbnail ? 'Auto-récupérée' : 'Coller manuellement'}>
                <Input
                  value={thumbnail}
                  onChange={(e) => setThumbnail(e.target.value)}
                  placeholder="https://..."
                />
              </FormField>
            </div>
          )}
        </div>
      </ModalBody>
      <ModalFooter>
        <div className="flex-1 text-xs text-text-faint flex items-center gap-1">
          <Wand2 size={11} />
          Tu peux compléter vues / likes plus tard depuis le drawer
        </div>
        <Button variant="ghost" onClick={() => onOpenChange(false)}>
          Annuler
        </Button>
        <Button
          variant="primary"
          onClick={handleSubmit}
          disabled={!canSubmit || create.isPending}
          loading={create.isPending}
        >
          Ajouter
        </Button>
      </ModalFooter>
    </Modal>
  );
}
