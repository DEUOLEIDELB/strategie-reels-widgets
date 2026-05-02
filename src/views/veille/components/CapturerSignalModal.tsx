import { useEffect, useMemo, useState } from 'react';
import toast from 'react-hot-toast';
import {
  Modal,
  ModalBody,
  ModalFooter,
  Button,
  FormField,
  Input,
  Textarea,
  Select,
} from '@/shared/components';
import { useCreateSignalVeille } from '@/shared/hooks/grist';
import {
  SIGNAL_CATEGORIES,
  SIGNAL_CATEGORIE_LABELS,
  SIGNAL_HORIZONS,
  SIGNAL_HORIZON_LABELS,
  currentSemaineIso,
  type SignalCategorie,
  type SignalHorizon,
} from '@/shared/lib/types';
import { HorizonBadge } from './HorizonBadge';

export interface CaptureContext {
  titre?: string;
  source_url?: string;
  categorie?: SignalCategorie;
  concurrent_lie?: number;
  influenceur_lie?: number;
}

interface Props {
  open: boolean;
  onOpenChange: (o: boolean) => void;
  initial?: CaptureContext;
}

export function CapturerSignalModal({ open, onOpenChange, initial }: Props) {
  const create = useCreateSignalVeille();
  const [categorie, setCategorie] = useState<SignalCategorie | ''>('');
  const [titre, setTitre] = useState('');
  const [sourceUrl, setSourceUrl] = useState('');
  const [signal, setSignal] = useState('');
  const [insight, setInsight] = useState('');
  const [action, setAction] = useState('');
  const [horizon, setHorizon] = useState<SignalHorizon>('next');

  // Reset form when opening
  useEffect(() => {
    if (open) {
      setCategorie(initial?.categorie || '');
      setTitre(initial?.titre || '');
      setSourceUrl(initial?.source_url || '');
      setSignal('');
      setInsight('');
      setAction('');
      setHorizon('next');
    }
  }, [open, initial]);

  const errors = useMemo(() => {
    const e: Record<string, string> = {};
    if (!categorie) e.categorie = 'Catégorie requise';
    if (!titre.trim()) e.titre = 'Titre requis';
    if (!signal.trim()) e.signal = 'Signal requis';
    if (horizon === 'now' && !insight.trim()) e.insight = "Insight requis pour Now : pourquoi cette semaine ?";
    return e;
  }, [categorie, titre, signal, insight, horizon]);

  const canSubmit = Object.keys(errors).length === 0;

  function handleSubmit() {
    if (!canSubmit) return;
    create.mutate(
      {
        date_capture: new Date().toISOString().slice(0, 10),
        semaine_iso: currentSemaineIso(),
        source_type: 'manuel',
        source_url: sourceUrl || '',
        categorie: categorie as SignalCategorie,
        titre,
        signal,
        insight,
        action_proposee: action,
        horizon,
        statut: 'capturé',
        notes: '',
        ...(initial?.concurrent_lie ? { concurrent_lie: initial.concurrent_lie } : {}),
        ...(initial?.influenceur_lie ? { influenceur_lie: initial.influenceur_lie } : {}),
      },
      {
        onSuccess: () => {
          toast.success('Signal capturé');
          onOpenChange(false);
        },
        onError: (err) => {
          toast.error(`Échec : ${(err as Error).message}`);
        },
      },
    );
  }

  return (
    <Modal open={open} onOpenChange={onOpenChange} title="Capturer un signal" size="md">
      <ModalBody>
        <div className="flex flex-col gap-3">
          <div className="grid grid-cols-2 gap-3">
            <FormField label="Catégorie" required error={errors.categorie}>
              <Select
                value={categorie}
                onChange={(e) => setCategorie(e.target.value as SignalCategorie | '')}
              >
                <option value="">— Choisir —</option>
                {SIGNAL_CATEGORIES.map((c) => (
                  <option key={c} value={c}>
                    {SIGNAL_CATEGORIE_LABELS[c]}
                  </option>
                ))}
              </Select>
            </FormField>
            <FormField label="Horizon" required>
              <div className="flex gap-1.5 mt-1">
                {SIGNAL_HORIZONS.map((h) => (
                  <button
                    key={h}
                    type="button"
                    onClick={() => setHorizon(h)}
                    className={`flex-1 h-9 px-2 text-xs rounded-md border transition-all ${
                      horizon === h
                        ? 'bg-current text-on-current border-current'
                        : 'bg-surface text-text-dim border-border-strong hover:border-current'
                    }`}
                  >
                    {SIGNAL_HORIZON_LABELS[h]}
                  </button>
                ))}
              </div>
            </FormField>
          </div>

          <FormField label="Titre" required error={errors.titre}>
            <Input
              value={titre}
              onChange={(e) => setTitre(e.target.value)}
              placeholder="Une ligne, ce que tu as vu"
              error={errors.titre}
            />
          </FormField>

          <FormField label="Source URL" hint="Optionnel">
            <Input
              value={sourceUrl}
              onChange={(e) => setSourceUrl(e.target.value)}
              placeholder="https://..."
            />
          </FormField>

          <FormField
            label="Signal"
            hint="Ce qui a changé / ce que tu as vu (factuel)"
            required
            error={errors.signal}
          >
            <Textarea
              rows={2}
              value={signal}
              onChange={(e) => setSignal(e.target.value)}
              placeholder="Ex : KiwiCo a posté un Reel format X, 220K vues en 24h"
              error={errors.signal}
            />
          </FormField>

          <FormField
            label="Insight"
            hint={
              horizon === 'now'
                ? 'Requis pour Now : pourquoi exploiter cette semaine ?'
                : "Pourquoi c'est important pour Wubo (optionnel pour Next/Later)"
            }
            required={horizon === 'now'}
            error={errors.insight}
          >
            <Textarea
              rows={2}
              value={insight}
              onChange={(e) => setInsight(e.target.value)}
              placeholder="Ex : confirme que le format mains+plongée marche pour les <14 ans"
              error={errors.insight}
            />
          </FormField>

          <FormField label="Action proposée" hint="Optionnel : ce que tu en fais concrètement">
            <Input
              value={action}
              onChange={(e) => setAction(e.target.value)}
              placeholder="Ex : Tester ce format jeudi avec Argibi"
            />
          </FormField>

          <div className="flex items-center gap-2 pt-1 text-xs text-text-faint">
            <span>Aperçu :</span>
            <HorizonBadge horizon={horizon} />
            <span>·</span>
            <span>{currentSemaineIso()}</span>
          </div>
        </div>
      </ModalBody>
      <ModalFooter>
        <Button variant="ghost" onClick={() => onOpenChange(false)}>
          Annuler
        </Button>
        <Button variant="primary" onClick={handleSubmit} disabled={!canSubmit} loading={create.isPending}>
          Capturer
        </Button>
      </ModalFooter>
    </Modal>
  );
}
