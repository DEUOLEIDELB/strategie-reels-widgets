import { useEffect, useState } from 'react';
import { Modal, ModalBody, ModalFooter, Button, Input, Textarea, FormField } from '@/shared/components';
import { useUpdateAtelier } from '@/shared/hooks/grist';
import type { Atelier } from '@/shared/lib/types';
import toast from 'react-hot-toast';

interface Props {
  open: boolean;
  atelier: Atelier | null;
  onOpenChange: (v: boolean) => void;
}

export function RenameAtelierModal({ open, atelier, onOpenChange }: Props) {
  const [nom, setNom] = useState('');
  const [description, setDescription] = useState('');
  const update = useUpdateAtelier();

  useEffect(() => {
    if (atelier) {
      setNom(atelier.nom ?? '');
      setDescription(atelier.description ?? '');
    }
  }, [atelier]);

  if (!atelier) return null;

  const submit = async () => {
    const trimmed = nom.trim();
    if (!trimmed) {
      toast.error('Le nom ne peut pas être vide.');
      return;
    }
    try {
      await update.mutateAsync({
        id: atelier.id,
        fields: { nom: trimmed, description: description.trim() },
      });
      onOpenChange(false);
      toast.success('Atelier renommé.');
    } catch (e) {
      toast.error(e instanceof Error ? e.message : 'Erreur mise à jour');
    }
  };

  return (
    <Modal open={open} onOpenChange={onOpenChange} title="Renommer l'atelier">
      <ModalBody>
        <div className="space-y-3">
          <FormField label="Nom" required>
            <Input value={nom} onChange={(e) => setNom(e.target.value)} maxLength={120} autoFocus />
          </FormField>
          <FormField label="Description">
            <Textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              rows={3}
            />
          </FormField>
        </div>
      </ModalBody>
      <ModalFooter>
        <Button variant="ghost" onClick={() => onOpenChange(false)} disabled={update.isPending}>
          Annuler
        </Button>
        <Button variant="primary" onClick={submit} loading={update.isPending}>
          Enregistrer
        </Button>
      </ModalFooter>
    </Modal>
  );
}
