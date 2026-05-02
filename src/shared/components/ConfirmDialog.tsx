import { useState } from 'react';
import { Modal, ModalBody, ModalFooter } from './Modal';
import { Button } from './Button';

interface ConfirmDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  title: string;
  description?: string;
  tone?: 'normal' | 'danger';
  confirmLabel?: string;
  cancelLabel?: string;
  onConfirm: () => void | Promise<void>;
}

export function ConfirmDialog({
  open,
  onOpenChange,
  title,
  description,
  tone = 'normal',
  confirmLabel = 'Confirmer',
  cancelLabel = 'Annuler',
  onConfirm,
}: ConfirmDialogProps) {
  const [loading, setLoading] = useState(false);

  async function handleConfirm() {
    try {
      setLoading(true);
      await onConfirm();
      onOpenChange(false);
    } finally {
      setLoading(false);
    }
  }

  return (
    <Modal open={open} onOpenChange={onOpenChange} title={title} size="sm">
      {description && (
        <ModalBody>
          <div className="text-sm text-text-dim leading-relaxed">{description}</div>
        </ModalBody>
      )}
      <ModalFooter>
        <Button variant="ghost" onClick={() => onOpenChange(false)} disabled={loading}>
          {cancelLabel}
        </Button>
        <Button
          variant={tone === 'danger' ? 'danger' : 'primary'}
          onClick={handleConfirm}
          loading={loading}
        >
          {confirmLabel}
        </Button>
      </ModalFooter>
    </Modal>
  );
}
