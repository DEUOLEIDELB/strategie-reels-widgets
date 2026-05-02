import { ReactNode } from 'react';
import * as Dialog from '@radix-ui/react-dialog';
import { X } from 'lucide-react';
import { cn } from '@/shared/lib/utils';

interface DrawerProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  title?: string;
  width?: number;
  children: ReactNode;
  className?: string;
}

export function Drawer({ open, onOpenChange, title, width = 380, children, className }: DrawerProps) {
  return (
    <Dialog.Root open={open} onOpenChange={onOpenChange}>
      <Dialog.Portal>
        <Dialog.Overlay className="fixed inset-0 bg-text/40 z-40 data-[state=open]:animate-in data-[state=open]:fade-in data-[state=closed]:animate-out data-[state=closed]:fade-out" />
        <Dialog.Content
          style={{ width }}
          className={cn(
            'fixed right-0 top-0 bottom-0 z-50',
            'bg-surface border-l border-border-strong shadow-lg',
            'flex flex-col',
            'data-[state=open]:animate-in data-[state=open]:slide-in-from-right',
            'data-[state=closed]:animate-out data-[state=closed]:slide-out-to-right',
            'focus:outline-none',
            className,
          )}
        >
          {title && (
            <div className="flex items-center justify-between px-4 py-3 border-b border-border bg-surface-two shrink-0">
              <Dialog.Title className="text-sm font-semibold">{title}</Dialog.Title>
              <Dialog.Close asChild>
                <button
                  aria-label="Fermer"
                  className="p-1 rounded-sm hover:bg-surface-alt text-text-faint hover:text-text"
                >
                  <X size={16} />
                </button>
              </Dialog.Close>
            </div>
          )}
          <div className="flex-1 overflow-y-auto scrollbar-thin">{children}</div>
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  );
}
