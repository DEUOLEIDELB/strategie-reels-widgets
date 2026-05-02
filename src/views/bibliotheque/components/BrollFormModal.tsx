import { useEffect, useState } from 'react';
import toast from 'react-hot-toast';
import { Modal, ModalBody, ModalFooter, Button, Input, Textarea, Select, FormField, Spinner } from '@/shared/components';
import { useCreateBroll, useUpdateBroll } from '../lib/mutations';
import type { BrollWithVideo } from '../types';

interface Props {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  initial?: BrollWithVideo | null;
}

interface FormState {
  code: string;
  description_plan: string;
  setup_technique: string;
  duree_min_secondes: string;
  priorite: string;
  statut: string;
  url_video: string;
  url_thumbnail: string;
  reels_qui_utilisent: string;
}

const EMPTY: FormState = {
  code: '',
  description_plan: '',
  setup_technique: '',
  duree_min_secondes: '',
  priorite: '',
  statut: 'à_tourner',
  url_video: '',
  url_thumbnail: '',
  reels_qui_utilisent: '',
};

function fromBroll(b: BrollWithVideo | null | undefined): FormState {
  if (!b) return EMPTY;
  return {
    code: b.code ?? '',
    description_plan: b.description_plan ?? '',
    setup_technique: b.setup_technique ?? '',
    duree_min_secondes: b.duree_min_secondes ? String(b.duree_min_secondes) : '',
    priorite: b.priorite ?? '',
    statut: b.statut ?? 'à_tourner',
    url_video: b.url_video ?? '',
    url_thumbnail: b.url_thumbnail ?? '',
    reels_qui_utilisent: b.reels_qui_utilisent ?? '',
  };
}

export function BrollFormModal({ open, onOpenChange, initial }: Props) {
  const isEdit = Boolean(initial);
  const [form, setForm] = useState<FormState>(EMPTY);
  const [error, setError] = useState<string | null>(null);

  const create = useCreateBroll();
  const update = useUpdateBroll();
  const pending = create.isPending || update.isPending;

  useEffect(() => {
    if (open) {
      setForm(fromBroll(initial));
      setError(null);
    }
  }, [open, initial]);

  function setField<K extends keyof FormState>(key: K, value: FormState[K]) {
    setForm((f) => ({ ...f, [key]: value }));
  }

  async function handleSubmit() {
    if (!form.description_plan.trim()) {
      setError('La description du plan est obligatoire.');
      return;
    }
    setError(null);
    const fields = {
      code: form.code.trim(),
      description_plan: form.description_plan.trim(),
      setup_technique: form.setup_technique.trim(),
      duree_min_secondes: form.duree_min_secondes ? Number(form.duree_min_secondes) : 0,
      priorite: form.priorite,
      statut: form.statut,
      url_video: form.url_video.trim(),
      url_thumbnail: form.url_thumbnail.trim(),
      reels_qui_utilisent: form.reels_qui_utilisent.trim(),
    };
    try {
      if (isEdit && initial) {
        await update.mutateAsync({ id: initial.id, fields });
        toast.success('B-roll mis à jour');
      } else {
        await create.mutateAsync(fields);
        toast.success('B-roll créé');
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
      title={isEdit ? `Modifier le B-roll ${initial?.code || ''}` : 'Nouveau B-roll'}
      size="md"
    >
      <ModalBody>
        <div className="grid grid-cols-2 gap-3">
          <FormField label="Code">
            <Input
              size="sm"
              placeholder="B17"
              value={form.code}
              onChange={(e) => setField('code', e.target.value)}
            />
          </FormField>
          <FormField label="Statut">
            <Select size="sm" value={form.statut} onChange={(e) => setField('statut', e.target.value)}>
              <option value="à_tourner">à tourner</option>
              <option value="tourné">tourné</option>
              <option value="monté">monté</option>
            </Select>
          </FormField>
        </div>

        <FormField label="Description du plan" required>
          <Textarea
            rows={3}
            placeholder="LED qui s'allume en slow-mo, plongée 30cm, fond noir"
            value={form.description_plan}
            onChange={(e) => setField('description_plan', e.target.value)}
          />
        </FormField>

        <FormField label="Setup technique">
          <Input
            size="sm"
            placeholder="Téléphone + trépied bras horizontal"
            value={form.setup_technique}
            onChange={(e) => setField('setup_technique', e.target.value)}
          />
        </FormField>

        <div className="grid grid-cols-2 gap-3">
          <FormField label="Durée min (sec)">
            <Input
              size="sm"
              type="number"
              min={0}
              value={form.duree_min_secondes}
              onChange={(e) => setField('duree_min_secondes', e.target.value)}
            />
          </FormField>
          <FormField label="Priorité">
            <Select size="sm" value={form.priorite} onChange={(e) => setField('priorite', e.target.value)}>
              <option value="">non définie</option>
              <option value="haute">haute</option>
              <option value="moyenne">moyenne</option>
              <option value="basse">basse</option>
            </Select>
          </FormField>
        </div>

        <FormField label="URL vidéo">
          <Input
            size="sm"
            placeholder="https://drive.google.com/file/d/... ou .mp4 direct"
            value={form.url_video}
            onChange={(e) => setField('url_video', e.target.value)}
          />
        </FormField>

        <FormField label="URL thumbnail (optionnel)">
          <Input
            size="sm"
            placeholder="https://... image preview"
            value={form.url_thumbnail}
            onChange={(e) => setField('url_thumbnail', e.target.value)}
          />
        </FormField>

        <FormField label="Reels qui utilisent ce broll">
          <Input
            size="sm"
            placeholder="R12, R47, R88"
            value={form.reels_qui_utilisent}
            onChange={(e) => setField('reels_qui_utilisent', e.target.value)}
          />
        </FormField>

        {error && <div className="text-xs text-danger">{error}</div>}
      </ModalBody>

      <ModalFooter>
        <Button variant="ghost" onClick={() => onOpenChange(false)}>
          Annuler
        </Button>
        <Button variant="primary" onClick={handleSubmit} disabled={pending}>
          {pending ? <Spinner size="sm" /> : isEdit ? 'Enregistrer' : 'Créer'}
        </Button>
      </ModalFooter>
    </Modal>
  );
}
