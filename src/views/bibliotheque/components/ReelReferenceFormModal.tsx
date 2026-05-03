import { useEffect, useState } from 'react';
import toast from 'react-hot-toast';
import {
  Modal,
  ModalBody,
  ModalFooter,
  Button,
  Input,
  Textarea,
  FormField,
  Spinner,
} from '@/shared/components';
import { cn } from '@/shared/lib/utils';
import { useCreateReelReference, useUpdateReelReference } from '../lib/mutations';
import {
  PATTERN_KEYS,
  PATTERN_LABELS,
  decodePatterns,
  type PatternKey,
} from '../lib/patternsLabels';
import { VideoPreview } from './VideoPreview';
import type { ReelReference } from '../lib/queries';

interface Props {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  initial?: ReelReference | null;
}

interface FormState {
  url: string;
  hook_observe: string;
  patterns: PatternKey[];
  take_away_wubo: string;
  transcript: string;
  createur: string;
}

const EMPTY: FormState = {
  url: '',
  hook_observe: '',
  patterns: [],
  take_away_wubo: '',
  transcript: '',
  createur: '',
};

function fromReel(r: ReelReference | null | undefined): FormState {
  if (!r) return EMPTY;
  return {
    url: r.url ?? '',
    hook_observe: r.hook_observe ?? '',
    patterns: decodePatterns(r.patterns),
    take_away_wubo: r.take_away_wubo ?? '',
    transcript: r.transcript ?? '',
    createur: r.createur ?? '',
  };
}

function detectPlateforme(url: string): 'instagram' | 'tiktok' | 'youtube_shorts' {
  const u = url.toLowerCase();
  if (u.includes('tiktok.com')) return 'tiktok';
  if (u.includes('youtube.com/shorts') || u.includes('youtu.be')) return 'youtube_shorts';
  return 'instagram';
}

function extractCreatorFromUrl(url: string): string {
  const igMatch = url.match(/instagram\.com\/([\w.\-]+)\//i);
  const ttMatch = url.match(/tiktok\.com\/@([\w.\-]+)/i);
  if (ttMatch) return ttMatch[1];
  if (igMatch && igMatch[1] !== 'reel' && igMatch[1] !== 'reels' && igMatch[1] !== 'p' && igMatch[1] !== 'tv') {
    return igMatch[1];
  }
  return '';
}

export function ReelReferenceFormModal({ open, onOpenChange, initial }: Props) {
  const isEdit = Boolean(initial);
  const [form, setForm] = useState<FormState>(EMPTY);
  const [error, setError] = useState<string | null>(null);
  const [showAdvanced, setShowAdvanced] = useState(false);

  const create = useCreateReelReference();
  const update = useUpdateReelReference();
  const pending = create.isPending || update.isPending;

  useEffect(() => {
    if (open) {
      setForm(fromReel(initial));
      setError(null);
      setShowAdvanced(isEdit);
    }
  }, [open, initial, isEdit]);

  function setField<K extends keyof FormState>(key: K, value: FormState[K]) {
    setForm((f) => ({ ...f, [key]: value }));
  }

  function togglePattern(p: PatternKey) {
    setForm((f) => ({
      ...f,
      patterns: f.patterns.includes(p) ? f.patterns.filter((x) => x !== p) : [...f.patterns, p],
    }));
  }

  async function handleSubmit() {
    if (!form.url.trim()) {
      setError('L\'URL du Reel est obligatoire.');
      return;
    }
    setError(null);
    const url = form.url.trim();
    const fields = {
      url,
      plateforme: detectPlateforme(url),
      createur: form.createur.trim() || extractCreatorFromUrl(url),
      hook_observe: form.hook_observe.trim(),
      patterns: form.patterns,
      take_away_wubo: form.take_away_wubo.trim(),
      transcript: form.transcript.trim(),
      date_ajout: isEdit ? initial?.date_ajout : new Date().toISOString().slice(0, 10),
    };
    try {
      if (isEdit && initial) {
        await update.mutateAsync({ id: initial.id, fields });
        toast.success('Reel référence mis à jour');
      } else {
        await create.mutateAsync(fields);
        toast.success('Reel référence ajouté');
      }
      onOpenChange(false);
    } catch (e) {
      const msg = (e as Error).message || 'Erreur';
      setError(msg);
      toast.error(`Échec : ${msg}`);
    }
  }

  const showPreview = form.url.trim().length > 5;

  return (
    <Modal
      open={open}
      onOpenChange={onOpenChange}
      title={isEdit ? 'Modifier la référence' : 'Nouveau Reel référence'}
      size="md"
    >
      <ModalBody>
        <FormField label="URL du Reel (Instagram, TikTok, YouTube Shorts)" required>
          <Input
            size="md"
            placeholder="Colle juste l'URL et clique Ajouter. Le reste est optionnel."
            value={form.url}
            onChange={(e) => setField('url', e.target.value)}
            autoFocus
          />
        </FormField>

        {showPreview && (
          <div className="flex justify-center">
            <div className="w-full max-w-[200px]">
              <VideoPreview url={form.url} alt="preview" />
            </div>
          </div>
        )}

        {!showAdvanced ? (
          <button
            type="button"
            onClick={() => setShowAdvanced(true)}
            className="text-[11px] text-text-faint hover:text-text underline self-start"
          >
            + Tagger maintenant (optionnel : tu peux le faire après depuis la card)
          </button>
        ) : (
          <div className="flex flex-col gap-3 border-t border-border pt-3">
            <FormField label="Hook observé (optionnel)">
              <Textarea
                rows={2}
                placeholder="Devinez ce qu'elle a construit en 15 minutes..."
                value={form.hook_observe}
                onChange={(e) => setField('hook_observe', e.target.value)}
              />
            </FormField>

            <FormField label="Patterns visuels (clique pour ajouter)">
              <div className="flex flex-wrap gap-1">
                {PATTERN_KEYS.map((p) => {
                  const meta = PATTERN_LABELS[p];
                  const active = form.patterns.includes(p);
                  return (
                    <button
                      key={p}
                      type="button"
                      onClick={() => togglePattern(p)}
                      className={cn(
                        'inline-flex items-center px-2 h-6 rounded-md border text-[11px] transition-colors',
                        active
                          ? 'bg-current text-on-current border-current'
                          : 'bg-surface text-text-dim border-border-strong hover:bg-surface-alt',
                      )}
                    >
                      {meta.label}
                    </button>
                  );
                })}
              </div>
            </FormField>

            <FormField label="Take-away Wubo (qu'est-ce qu'on vole ?)">
              <Textarea
                rows={2}
                placeholder="Adapter le hook + plongée mains + slow-mo allumage."
                value={form.take_away_wubo}
                onChange={(e) => setField('take_away_wubo', e.target.value)}
              />
            </FormField>

            <FormField label="Transcript (depuis ScreenApp ou MCP)">
              <Textarea
                rows={3}
                placeholder="Texte parlé du Reel..."
                value={form.transcript}
                onChange={(e) => setField('transcript', e.target.value)}
              />
            </FormField>
          </div>
        )}

        {error && <div className="text-xs text-danger">{error}</div>}
      </ModalBody>

      <ModalFooter>
        <Button variant="ghost" onClick={() => onOpenChange(false)}>
          Annuler
        </Button>
        <Button variant="primary" onClick={handleSubmit} disabled={pending}>
          {pending ? <Spinner size="sm" /> : isEdit ? 'Enregistrer' : 'Ajouter'}
        </Button>
      </ModalFooter>
    </Modal>
  );
}
