import { useState, useEffect } from 'react';
import toast from 'react-hot-toast';
import { Modal, ModalBody, ModalFooter, Button, Input, Textarea, FormField, Select } from '@/shared/components';
import {
  useCreateAvatar,
  useCreateAngle,
  useCreatePainPoint,
  useCreateReel,
} from '@/shared/hooks/grist';
import { REEL_STATUTS_GRIST, type AtelierNodeType } from '@/shared/lib/types';
import { useAtelierView } from '../../store';

interface Props {
  open: boolean;
  type: AtelierNodeType;
  onOpenChange: (v: boolean) => void;
  // Si fourni : on ajoute la nouvelle brique au canvas, connectée à ce parent
  parentNodeId?: string;
  // Callback après création réussie (id Grist + label) : ouvre drawer ou autre
  onCreated?: (briqueId: number, label: string) => void;
}

const TITLE: Record<AtelierNodeType, string> = {
  avatar: 'Nouvel avatar',
  angle: 'Nouvel angle',
  pain: 'Nouveau pain point',
  reel: 'Nouveau reel',
};

const DESC: Record<AtelierNodeType, string> = {
  avatar: 'Qui on vise. Le minimum pour démarrer ; complète le détail dans le drawer.',
  angle: "La voix narrative. Comment on prend la parole sur le sujet.",
  pain: 'Une douleur précise vécue par un avatar.',
  reel: 'Une idée de vidéo. Tu peux pré-remplir le hook et le CTA tout de suite.',
};

export function CreateBriqueModal({ open, type, onOpenChange, parentNodeId, onCreated }: Props) {
  const createAvatar = useCreateAvatar();
  const createAngle = useCreateAngle();
  const createPain = useCreatePainPoint();
  const createReel = useCreateReel();
  const addBrique = useAtelierView((s) => s.addBrique);

  // Champs partagés
  const [name, setName] = useState('');
  const [extra, setExtra] = useState('');
  const [extra2, setExtra2] = useState('');
  // Reel-spécifiques
  const [duree, setDuree] = useState('');
  const [statut, setStatut] = useState<typeof REEL_STATUTS_GRIST[number]>('concept');

  useEffect(() => {
    if (open) {
      setName('');
      setExtra('');
      setExtra2('');
      setDuree('');
      setStatut('concept');
    }
  }, [open]);

  const isPending =
    createAvatar.isPending ||
    createAngle.isPending ||
    createPain.isPending ||
    createReel.isPending;

  const submit = async () => {
    const trimmed = name.trim();
    if (!trimmed) {
      toast.error('Le nom est obligatoire.');
      return;
    }

    try {
      let id = 0;
      let label = trimmed;
      let subtitle: string | undefined;

      if (type === 'avatar') {
        const ids = await createAvatar.mutateAsync({
          prenom: trimmed,
          age_range: extra.trim(),
          profession: extra2.trim(),
          lieu: '',
          situation_familiale: '',
          revenus_foyer: '',
          reseau_principal: '',
          photo_url: '',
          description_synthese: '',
          declencheurs_achat: '',
          objections: '',
        });
        id = ids[0];
        subtitle = [extra.trim(), extra2.trim()].filter(Boolean).join(' · ') || undefined;
      } else if (type === 'angle') {
        const ids = await createAngle.mutateAsync({
          nom: trimmed,
          ton: extra.trim(),
          description: '',
          force: '',
          faiblesse: '',
          meilleur_pour: '',
          cible_primaire: extra2.trim(),
        });
        id = ids[0];
        subtitle = extra.trim() || undefined;
      } else if (type === 'pain') {
        const ids = await createPain.mutateAsync({
          titre: trimmed,
          description: '',
          chiffre_source: '',
          emotion_dominante: extra.trim(),
          frequence_vecue: extra2.trim(),
          niveau_intensite: 0,
        });
        id = ids[0];
        subtitle = extra.trim() || undefined;
      } else if (type === 'reel') {
        const dureeNum = Number(duree);
        const ids = await createReel.mutateAsync({
          titre: trimmed,
          hook_verbal: extra.trim(),
          cta_texte: extra2.trim(),
          statut,
          duree_sec: Number.isFinite(dureeNum) ? dureeNum : 0,
        });
        id = ids[0];
        subtitle = statut;
      }

      if (id > 0) {
        // Ajout au canvas (rattaché au parent si fourni)
        addBrique(type, id, label, subtitle, { parentNodeId });
        toast.success(`${TITLE[type]} créé.`);
        onCreated?.(id, label);
        onOpenChange(false);
      }
    } catch (e) {
      toast.error(e instanceof Error ? e.message : 'Erreur création');
    }
  };

  return (
    <Modal open={open} onOpenChange={onOpenChange} title={TITLE[type]} description={DESC[type]}>
      <ModalBody>
        <div className="space-y-3">
          {type === 'avatar' && (
            <>
              <FormField label="Prénom" required>
                <Input
                  autoFocus
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Marie, David, Sophie..."
                />
              </FormField>
              <div className="grid grid-cols-2 gap-2">
                <FormField label="Tranche d'âge">
                  <Input value={extra} onChange={(e) => setExtra(e.target.value)} placeholder="36-40" />
                </FormField>
                <FormField label="Profession">
                  <Input value={extra2} onChange={(e) => setExtra2(e.target.value)} placeholder="Cadre, indep..." />
                </FormField>
              </div>
            </>
          )}

          {type === 'angle' && (
            <>
              <FormField label="Nom" required>
                <Input
                  autoFocus
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Grand frère, Témoin écran, Mère-conseil..."
                />
              </FormField>
              <FormField label="Ton" hint="Énergique, vulnérable, contrarian, expert...">
                <Input value={extra} onChange={(e) => setExtra(e.target.value)} placeholder="Direct et complice" />
              </FormField>
              <FormField label="Cible primaire">
                <Input value={extra2} onChange={(e) => setExtra2(e.target.value)} placeholder="parent / enfant / les deux" />
              </FormField>
            </>
          )}

          {type === 'pain' && (
            <>
              <FormField label="Titre" required hint="La douleur en une phrase concrète, scénique.">
                <Input
                  autoFocus
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="La guerre des écrans le soir"
                />
              </FormField>
              <div className="grid grid-cols-2 gap-2">
                <FormField label="Émotion dominante">
                  <Input value={extra} onChange={(e) => setExtra(e.target.value)} placeholder="culpabilité, colère..." />
                </FormField>
                <FormField label="Fréquence vécue">
                  <Input value={extra2} onChange={(e) => setExtra2(e.target.value)} placeholder="quotidien, hebdo..." />
                </FormField>
              </div>
            </>
          )}

          {type === 'reel' && (
            <>
              <FormField label="Titre de travail" required>
                <Input
                  autoFocus
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Sa première LED s'allume"
                />
              </FormField>
              <FormField label="Hook verbal" hint="Les 3 premières secondes. Tu peux compléter plus tard.">
                <Textarea value={extra} onChange={(e) => setExtra(e.target.value)} rows={2} />
              </FormField>
              <FormField label="CTA texte">
                <Input value={extra2} onChange={(e) => setExtra2(e.target.value)} placeholder="Commente WUBO pour..." />
              </FormField>
              <div className="grid grid-cols-2 gap-2">
                <FormField label="Statut">
                  <Select size="sm" value={statut} onChange={(e) => setStatut(e.target.value as typeof statut)}>
                    {REEL_STATUTS_GRIST.map((s) => (
                      <option key={s} value={s}>{s}</option>
                    ))}
                  </Select>
                </FormField>
                <FormField label="Durée (sec)">
                  <Input
                    type="number"
                    min={0}
                    value={duree}
                    onChange={(e) => setDuree(e.target.value)}
                    placeholder="30"
                  />
                </FormField>
              </div>
            </>
          )}
        </div>
      </ModalBody>
      <ModalFooter>
        <Button variant="ghost" onClick={() => onOpenChange(false)} disabled={isPending}>
          Annuler
        </Button>
        <Button variant="primary" onClick={submit} loading={isPending}>
          Créer{parentNodeId ? ' et connecter' : ''}
        </Button>
      </ModalFooter>
    </Modal>
  );
}
