import { useEffect, useState } from 'react';
import toast from 'react-hot-toast';
import { Modal, ModalBody, ModalFooter, Button, Input, Textarea, Select, FormField, Spinner } from '@/shared/components';
import { useCreateRessource, useUpdateRessource } from '../lib/mutations';
import type { RessourceWithAction } from '../types';

interface Props {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  initial?: RessourceWithAction | null;
}

interface FormState {
  nom: string;
  categorie: string;
  url: string;
  prix: string;
  score_priorite: string;
  usage_recommande: string;
  cas_usage_wubo: string;
  type_action: string;
  droits: string;
}

const EMPTY: FormState = {
  nom: '',
  categorie: '',
  url: '',
  prix: 'gratuit',
  score_priorite: '3',
  usage_recommande: '',
  cas_usage_wubo: '',
  type_action: 'banque',
  droits: 'free',
};

function fromRessource(r: RessourceWithAction | null | undefined): FormState {
  if (!r) return EMPTY;
  return {
    nom: r.nom ?? '',
    categorie: r.categorie ?? '',
    url: r.url ?? '',
    prix: r.prix ?? '',
    score_priorite: r.score_priorite ? String(r.score_priorite) : '3',
    usage_recommande: r.usage_recommande ?? '',
    cas_usage_wubo: r.cas_usage_wubo ?? '',
    type_action: (r.type_action as string) || 'banque',
    droits: (r.droits as string) || 'free',
  };
}

export function RessourceFormModal({ open, onOpenChange, initial }: Props) {
  const isEdit = Boolean(initial);
  const [form, setForm] = useState<FormState>(EMPTY);
  const [error, setError] = useState<string | null>(null);

  const create = useCreateRessource();
  const update = useUpdateRessource();
  const pending = create.isPending || update.isPending;

  useEffect(() => {
    if (open) {
      setForm(fromRessource(initial));
      setError(null);
    }
  }, [open, initial]);

  function setField<K extends keyof FormState>(key: K, value: FormState[K]) {
    setForm((f) => ({ ...f, [key]: value }));
  }

  async function handleSubmit() {
    if (!form.nom.trim()) {
      setError('Le nom est obligatoire.');
      return;
    }
    if (!form.url.trim()) {
      setError('L\'URL est obligatoire.');
      return;
    }
    setError(null);
    const fields: Partial<Omit<RessourceWithAction, 'id'>> = {
      nom: form.nom.trim(),
      categorie: form.categorie.trim(),
      url: form.url.trim(),
      prix: form.prix.trim(),
      score_priorite: form.score_priorite ? Number(form.score_priorite) : 3,
      usage_recommande: form.usage_recommande.trim(),
      cas_usage_wubo: form.cas_usage_wubo.trim(),
      type_action: form.type_action as RessourceWithAction['type_action'],
      droits: form.droits as RessourceWithAction['droits'],
    };
    try {
      if (isEdit && initial) {
        await update.mutateAsync({ id: initial.id, fields });
        toast.success('Ressource mise à jour');
      } else {
        await create.mutateAsync(fields);
        toast.success('Ressource créée');
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
      title={isEdit ? `Modifier ${initial?.nom}` : 'Nouvelle ressource'}
      size="md"
    >
      <ModalBody>
        <FormField label="Nom" required>
          <Input
            size="sm"
            placeholder="Pexels Music"
            value={form.nom}
            onChange={(e) => setField('nom', e.target.value)}
          />
        </FormField>

        <FormField label="URL" required>
          <Input
            size="sm"
            placeholder="https://..."
            value={form.url}
            onChange={(e) => setField('url', e.target.value)}
          />
        </FormField>

        <div className="grid grid-cols-2 gap-3">
          <FormField label="Type d'action">
            <Select size="sm" value={form.type_action} onChange={(e) => setField('type_action', e.target.value)}>
              <option value="banque">banque (chercher)</option>
              <option value="asset_direct">asset direct (télécharger)</option>
              <option value="outil_logiciel">outil logiciel (lancer)</option>
            </Select>
          </FormField>
          <FormField label="Droits">
            <Select size="sm" value={form.droits} onChange={(e) => setField('droits', e.target.value)}>
              <option value="public_domain">public domain</option>
              <option value="cc">creative commons</option>
              <option value="free">free</option>
              <option value="freemium">freemium</option>
              <option value="payant">payant</option>
            </Select>
          </FormField>
        </div>

        <div className="grid grid-cols-3 gap-3">
          <FormField label="Catégorie">
            <Input
              size="sm"
              placeholder="musique_libre"
              value={form.categorie}
              onChange={(e) => setField('categorie', e.target.value)}
            />
          </FormField>
          <FormField label="Prix">
            <Input
              size="sm"
              placeholder="gratuit / 10€/mois"
              value={form.prix}
              onChange={(e) => setField('prix', e.target.value)}
            />
          </FormField>
          <FormField label="Score (1-5)">
            <Select size="sm" value={form.score_priorite} onChange={(e) => setField('score_priorite', e.target.value)}>
              {[1, 2, 3, 4, 5].map((s) => (
                <option key={s} value={s}>
                  {s}
                </option>
              ))}
            </Select>
          </FormField>
        </div>

        <FormField label="Usage recommandé">
          <Textarea
            rows={2}
            placeholder="100 000+ tracks libres, aucune attribution requise."
            value={form.usage_recommande}
            onChange={(e) => setField('usage_recommande', e.target.value)}
          />
        </FormField>

        <FormField label="Cas d'usage Wubo (optionnel)">
          <Textarea
            rows={2}
            placeholder="Quand utiliser cette ressource pour Wubo concrètement"
            value={form.cas_usage_wubo}
            onChange={(e) => setField('cas_usage_wubo', e.target.value)}
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
