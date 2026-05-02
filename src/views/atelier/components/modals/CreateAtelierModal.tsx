import { useState } from 'react';
import { Modal, ModalBody, ModalFooter, Button, Input, Textarea, FormField } from '@/shared/components';
import { useCreateAtelier } from '@/shared/hooks/grist';
import { useAppStore } from '@/shared/store';
import toast from 'react-hot-toast';

interface Props {
  open: boolean;
  onOpenChange: (v: boolean) => void;
}

export function CreateAtelierModal({ open, onOpenChange }: Props) {
  const [nom, setNom] = useState('');
  const [description, setDescription] = useState('');
  const create = useCreateAtelier();
  const setCurrentAtelier = useAppStore((s) => s.setCurrentAtelier);

  const reset = () => {
    setNom('');
    setDescription('');
  };

  const submit = async () => {
    const trimmed = nom.trim();
    if (!trimmed) {
      toast.error('Donne un nom à ton atelier.');
      return;
    }
    try {
      const id = await create.mutateAsync({ nom: trimmed, description: description.trim() });
      setCurrentAtelier(id);
      reset();
      onOpenChange(false);
      toast.success('Atelier créé.');
    } catch (e) {
      toast.error(e instanceof Error ? e.message : 'Erreur création');
    }
  };

  return (
    <Modal
      open={open}
      onOpenChange={(o) => {
        if (!o) reset();
        onOpenChange(o);
      }}
      title="Nouvel atelier"
      description="Un atelier = un test de composition (avatar → angle → pain → reels)."
    >
      <ModalBody>
        <div className="space-y-3">
          <FormField label="Nom" required>
            <Input
              autoFocus
              value={nom}
              onChange={(e) => setNom(e.target.value)}
              placeholder="Test 1 — Sophie + écrans"
              maxLength={120}
            />
          </FormField>
          <FormField label="Description" hint="Optionnel : contexte, hypothèse, audience visée.">
            <Textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Pourquoi ce test, ce qu'on cherche à vérifier..."
              rows={3}
            />
          </FormField>
        </div>
      </ModalBody>
      <ModalFooter>
        <Button variant="ghost" onClick={() => onOpenChange(false)} disabled={create.isPending}>
          Annuler
        </Button>
        <Button variant="primary" onClick={submit} loading={create.isPending}>
          Créer
        </Button>
      </ModalFooter>
    </Modal>
  );
}
