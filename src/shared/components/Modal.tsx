import { ReactNode } from 'react';
import * as Dialog from '@radix-ui/react-dialog';
import { X } from 'lucide-react';
import { cn } from '@/shared/lib/utils';

type Size = 'sm' | 'md' | 'lg';

interface ModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  title?: string;
  description?: string;
  size?: Size;
  dismissible?: boolean;
  children: ReactNode;
  className?: string;
}

const sizeClasses: Record<Size, string> = {
  sm: 'max-w-[400px]',
  md: 'max-w-[560px]',
  lg: 'max-w-[800px]',
};

export function Modal({
  open,
  onOpenChange,
  title,
  description,
  size = 'md',
  dismissible = true,
  children,
  className,
}: ModalProps) {
  return (
    <Dialog.Root open={open} onOpenChange={onOpenChange}>
      <Dialog.Portal>
        <Dialog.Overlay className="fixed inset-0 bg-text/40 backdrop-blur-[1px] z-40 data-[state=open]:animate-in data-[state=open]:fade-in data-[state=closed]:animate-out data-[state=closed]:fade-out" />
        <Dialog.Content
          onPointerDownOutside={(e) => {
            if (!dismissible) e.preventDefault();
          }}
          onEscapeKeyDown={(e) => {
            if (!dismissible) e.preventDefault();
          }}
          className={cn(
            'fixed left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 z-50',
            'w-[calc(100vw-2rem)] max-h-[calc(100vh-2rem)] overflow-y-auto scrollbar-thin',
            'bg-surface border border-border-strong rounded-lg shadow-lg',
            'focus:outline-none',
            sizeClasses[size],
            className,
          )}
        >
          {(title || dismissible) && (
            <div className="flex items-center justify-between px-5 py-3 border-b border-border bg-surface-two">
              <div>
                {title && <Dialog.Title className="text-base font-semibold">{title}</Dialog.Title>}
                {description && (
                  <Dialog.Description className="text-xs text-text-faint mt-0.5">
                    {description}
                  </Dialog.Description>
                )}
              </div>
              {dismissible && (
                <Dialog.Close asChild>
                  <button
                    aria-label="Fermer"
                    className="p-1 rounded-sm hover:bg-surface-alt text-text-faint hover:text-text"
                  >
                    <X size={16} />
                  </button>
                </Dialog.Close>
              )}
            </div>
          )}
          {children}
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  );
}

export function ModalBody({ children, className }: { children: ReactNode; className?: string }) {
  return <div className={cn('p-5', className)}>{children}</div>;
}

export function ModalFooter({ children, className }: { children: ReactNode; className?: string }) {
  return (
    <div
      className={cn(
        'flex items-center justify-end gap-2 px-5 py-3 border-t border-border bg-surface-two',
        className,
      )}
    >
      {children}
    </div>
  );
}
