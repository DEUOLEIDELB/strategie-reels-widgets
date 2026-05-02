import { useEffect, useState } from 'react';
import toast from 'react-hot-toast';
import { Modal, ModalBody, ModalFooter, Button, Input, Textarea, Select, FormField, Spinner } from '@/shared/components';
import { gristDateToJSDate, dateToISO } from '@/shared/lib/utils';
import { useCreateSession, useUpdateSession } from '../lib/mutations';
import type { SessionTournage } from '@/shared/lib/types';

interface Props {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  initial?: SessionTournage | null;
  // Préremplissage venant d'un setup statique (quick-launch).
  prefill?: {
    type: string;
    equipement: string;
  } | null;
}

interface FormState {
  type: string;
  date_planifiee: string;
  duree_estimee_min: string;
  lieu: string;
  personnes_requises: string;
  equipement: string;
  reels_alimentes: string;
  statut: string;
}

const EMPTY: FormState = {
  type: '',
  date_planifiee: '',
  duree_estimee_min: '',
  lieu: '',
  personnes_requises: '',
  equipement: '',
  reels_alimentes: '',
  statut: 'à_planifier',
};

function fromSession(s: SessionTournage | null | undefined): FormState {
  if (!s) return EMPTY;
  const d = gristDateToJSDate(s.date_planifiee);
  return {
    type: s.type ?? '',
    date_planifiee: d ? dateToISO(d) : '',
    duree_estimee_min: s.duree_estimee_min ? String(s.duree_estimee_min) : '',
    lieu: s.lieu ?? '',
    personnes_requises: s.personnes_requises ?? '',
    equipement: s.equipement ?? '',
    reels_alimentes: s.reels_alimentes ?? '',
    statut: s.statut ?? 'à_planifier',
  };
}

export function SessionFormModal({ open, onOpenChange, initial, prefill }: Props) {
  const isEdit = Boolean(initial);
  const [form, setForm] = useState<FormState>(EMPTY);
  const [error, setError] = useState<string | null>(null);

  const create = useCreateSession();
  const update = useUpdateSession();
  const pending = create.isPending || update.isPending;

  useEffect(() => {
    if (!open) return;
    if (initial) {
      setForm(fromSession(initial));
    } else if (prefill) {
      setForm({
        ...EMPTY,
        type: prefill.type,
        equipement: prefill.equipement,
      });
    } else {
      setForm(EMPTY);
    }
    setError(null);
  }, [open, initial, prefill]);

  function setField<K extends keyof FormState>(key: K, value: FormState[K]) {
    setForm((f) => ({ ...f, [key]: value }));
  }

  async function handleSubmit() {
    if (!form.type.trim()) {
      setError('Le type de session est obligatoire.');
      return;
    }
    setError(null);
    // Date Grist : timestamp seconds (number) ou string ISO. On envoie ISO si valide.
    const dateValue = form.date_planifiee || '';
    const fields = {
      type: form.type.trim(),
      date_planifiee: dateValue,
      duree_estimee_min: form.duree_estimee_min ? Number(form.duree_estimee_min) : 0,
      lieu: form.lieu.trim(),
      personnes_requises: form.personnes_requises.trim(),
      equipement: form.equipement.trim(),
      reels_alimentes: form.reels_alimentes.trim(),
      statut: form.statut,
    };
    try {
      if (isEdit && initial) {
        await update.mutateAsync({ id: initial.id, fields });
        toast.success('Session mise à jour');
      } else {
        await create.mutateAsync(fields);
        toast.success('Session créée');
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
      title={isEdit ? 'Modifier la session' : 'Nouvelle session de tournage'}
      size="md"
    >
      <ModalBody>
        <div className="grid grid-cols-2 gap-3">
          <FormField label="Type" required>
            <Input
              size="sm"
              placeholder="Face cam Taki / Atelier enfants..."
              value={form.type}
              onChange={(e) => setField('type', e.target.value)}
            />
          </FormField>
          <FormField label="Statut">
            <Select size="sm" value={form.statut} onChange={(e) => setField('statut', e.target.value)}>
              <option value="à_planifier">à planifier</option>
              <option value="planifiée">planifiée</option>
              <option value="tournée">tournée</option>
            </Select>
          </FormField>
        </div>

        <div className="grid grid-cols-2 gap-3">
          <FormField label="Date prévue">
            <Input
              size="sm"
              type="date"
              value={form.date_planifiee}
              onChange={(e) => setField('date_planifiee', e.target.value)}
            />
          </FormField>
          <FormField label="Durée estimée (min)">
            <Input
              size="sm"
              type="number"
              min={0}
              value={form.duree_estimee_min}
              onChange={(e) => setField('duree_estimee_min', e.target.value)}
            />
          </FormField>
        </div>

        <FormField label="Lieu">
          <Input
            size="sm"
            placeholder="Bureau, atelier école X, extérieur..."
            value={form.lieu}
            onChange={(e) => setField('lieu', e.target.value)}
          />
        </FormField>

        <FormField label="Personnes requises">
          <Input
            size="sm"
            placeholder="Taki, Numa, 2 enfants 9-12 ans"
            value={form.personnes_requises}
            onChange={(e) => setField('personnes_requises', e.target.value)}
          />
        </FormField>

        <FormField label="Équipement">
          <Textarea
            rows={2}
            placeholder="Téléphone, trépied, micro Boya, ring light..."
            value={form.equipement}
            onChange={(e) => setField('equipement', e.target.value)}
          />
        </FormField>

        <FormField label="Reels alimentés">
          <Input
            size="sm"
            placeholder="R12, R47, R88"
            value={form.reels_alimentes}
            onChange={(e) => setField('reels_alimentes', e.target.value)}
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
