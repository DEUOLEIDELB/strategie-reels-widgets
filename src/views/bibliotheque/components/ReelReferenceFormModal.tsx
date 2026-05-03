import { useEffect, useState } from 'react';
import toast from 'react-hot-toast';
import {
  Modal,
  ModalBody,
  ModalFooter,
  Button,
  Input,
  Textarea,
  Select,
  FormField,
  Spinner,
} from '@/shared/components';
import { cn } from '@/shared/lib/utils';
import { useCreateReelReference, useUpdateReelReference } from '../lib/mutations';
import {
  PATTERN_KEYS,
  PATTERN_LABELS,
  TYPE_TONES,
  decodePatterns,
  type PatternKey,
} from '../lib/patternsLabels';
import type { ReelReference } from '../lib/queries';

interface Props {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  initial?: ReelReference | null;
}

interface FormState {
  url: string;
  createur: string;
  plateforme: string;
  hook_observe: string;
  patterns: PatternKey[];
  vues_estimees: string;
  duree_sec: string;
  take_away_wubo: string;
  transcript: string;
  url_thumbnail: string;
}

const EMPTY: FormState = {
  url: '',
  createur: '',
  plateforme: 'instagram',
  hook_observe: '',
  patterns: [],
  vues_estimees: '',
  duree_sec: '',
  take_away_wubo: '',
  transcript: '',
  url_thumbnail: '',
};

function fromReel(r: ReelReference | null | undefined): FormState {
  if (!r) return EMPTY;
  return {
    url: r.url ?? '',
    createur: r.createur ?? '',
    plateforme: r.plateforme || 'instagram',
    hook_observe: r.hook_observe ?? '',
    patterns: decodePatterns(r.patterns),
    vues_estimees: r.vues_estimees ?? '',
    duree_sec: r.duree_sec ? String(r.duree_sec) : '',
    take_away_wubo: r.take_away_wubo ?? '',
    transcript: r.transcript ?? '',
    url_thumbnail: r.url_thumbnail ?? '',
  };
}

function detectPlateforme(url: string): string {
  const u = url.toLowerCase();
  if (u.includes('tiktok.com')) return 'tiktok';
  if (u.includes('youtube.com/shorts') || u.includes('youtu.be')) return 'youtube_shorts';
  if (u.includes('instagram.com')) return 'instagram';
  return 'instagram';
}

export function ReelReferenceFormModal({ open, onOpenChange, initial }: Props) {
  const isEdit = Boolean(initial);
  const [form, setForm] = useState<FormState>(EMPTY);
  const [error, setError] = useState<string | null>(null);

  const create = useCreateReelReference();
  const update = useUpdateReelReference();
  const pending = create.isPending || update.isPending;

  useEffect(() => {
    if (open) {
      setForm(fromReel(initial));
      setError(null);
    }
  }, [open, initial]);

  function setField<K extends keyof FormState>(key: K, value: FormState[K]) {
    setForm((f) => ({ ...f, [key]: value }));
  }

  function togglePattern(p: PatternKey) {
    setForm((f) => ({
      ...f,
      patterns: f.patterns.includes(p) ? f.patterns.filter((x) => x !== p) : [...f.patterns, p],
    }));
  }

  function handleUrlPaste(value: string) {
    setField('url', value);
    if (value && form.plateforme === 'instagram' && !isEdit) {
      setField('plateforme', detectPlateforme(value));
    }
  }

  async function handleSubmit() {
    if (!form.url.trim()) {
      setError('L\'URL du Reel est obligatoire.');
      return;
    }
    setError(null);
    const fields = {
      url: form.url.trim(),
      createur: form.createur.trim(),
      plateforme: form.plateforme,
      hook_observe: form.hook_observe.trim(),
      patterns: form.patterns,
      vues_estimees: form.vues_estimees.trim(),
      duree_sec: form.duree_sec ? Number(form.duree_sec) : 0,
      take_away_wubo: form.take_away_wubo.trim(),
      transcript: form.transcript.trim(),
      url_thumbnail: form.url_thumbnail.trim(),
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

  return (
    <Modal
      open={open}
      onOpenChange={onOpenChange}
      title={isEdit ? 'Modifier la référence' : 'Nouveau Reel référence'}
      size="lg"
    >
      <ModalBody>
        <FormField label="URL du Reel" required>
          <Input
            size="sm"
            placeholder="https://www.instagram.com/reel/... ou tiktok.com/..."
            value={form.url}
            onChange={(e) => handleUrlPaste(e.target.value)}
          />
        </FormField>

        <div className="grid grid-cols-3 gap-3">
          <FormField label="Plateforme">
            <Select
              size="sm"
              value={form.plateforme}
              onChange={(e) => setField('plateforme', e.target.value)}
            >
              <option value="instagram">Instagram</option>
              <option value="tiktok">TikTok</option>
              <option value="youtube_shorts">YouTube Shorts</option>
            </Select>
          </FormField>
          <FormField label="Créateur (sans @)">
            <Input
              size="sm"
              placeholder="kiwico"
              value={form.createur}
              onChange={(e) => setField('createur', e.target.value)}
            />
          </FormField>
          <FormField label="Vues estimées">
            <Input
              size="sm"
              placeholder="1.2M"
              value={form.vues_estimees}
              onChange={(e) => setField('vues_estimees', e.target.value)}
            />
          </FormField>
        </div>

        <FormField label="Hook observé (texte exact des 0-3s si possible)">
          <Textarea
            rows={2}
            placeholder='"Devinez ce que cette gamine de 9 ans a construit en 15 minutes..."'
            value={form.hook_observe}
            onChange={(e) => setField('hook_observe', e.target.value)}
          />
        </FormField>

        <FormField label="Patterns visuels détectés">
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
                      ? `bg-${TYPE_TONES[meta.type]} text-on-${TYPE_TONES[meta.type]} border-${TYPE_TONES[meta.type]}`
                      : 'bg-surface text-text-dim border-border-strong hover:bg-surface-alt',
                  )}
                  style={
                    active
                      ? undefined
                      : { /* fallback no-active */ }
                  }
                >
                  {meta.label}
                </button>
              );
            })}
          </div>
        </FormField>

        <FormField label="Take-away Wubo (qu'est-ce qu'on vole concrètement ?)">
          <Textarea
            rows={2}
            placeholder="Adapter le hook à 'Il a 9 ans il a programmé sa première LED' + plongée mains + slow-mo allumage."
            value={form.take_away_wubo}
            onChange={(e) => setField('take_away_wubo', e.target.value)}
          />
        </FormField>

        <div className="grid grid-cols-2 gap-3">
          <FormField label="Durée (sec)">
            <Input
              size="sm"
              type="number"
              min={0}
              value={form.duree_sec}
              onChange={(e) => setField('duree_sec', e.target.value)}
            />
          </FormField>
          <FormField label="URL thumbnail (optionnel)">
            <Input
              size="sm"
              placeholder="https://..."
              value={form.url_thumbnail}
              onChange={(e) => setField('url_thumbnail', e.target.value)}
            />
          </FormField>
        </div>

        <FormField label="Transcript (colle ici si tu utilises ScreenApp ou MCP transcribe)">
          <Textarea
            rows={4}
            placeholder="Texte parlé du Reel transcrit..."
            value={form.transcript}
            onChange={(e) => setField('transcript', e.target.value)}
          />
        </FormField>

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
