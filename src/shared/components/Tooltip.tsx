import { ReactNode } from 'react';
import * as TooltipPrimitive from '@radix-ui/react-tooltip';
import { cn } from '@/shared/lib/utils';

interface TooltipProps {
  content: ReactNode;
  children: ReactNode;
  placement?: 'top' | 'right' | 'bottom' | 'left';
  delay?: number;
}

export function Tooltip({ content, children, placement = 'top', delay = 300 }: TooltipProps) {
  return (
    <TooltipPrimitive.Provider delayDuration={delay}>
      <TooltipPrimitive.Root>
        <TooltipPrimitive.Trigger asChild>{children}</TooltipPrimitive.Trigger>
        <TooltipPrimitive.Portal>
          <TooltipPrimitive.Content
            side={placement}
            sideOffset={4}
            className={cn(
              'z-50 px-2 py-1 rounded-sm text-[11px] font-medium',
              'bg-text text-surface shadow-lg',
              'data-[state=delayed-open]:animate-in data-[state=delayed-open]:fade-in',
            )}
          >
            {content}
          </TooltipPrimitive.Content>
        </TooltipPrimitive.Portal>
      </TooltipPrimitive.Root>
    </TooltipPrimitive.Provider>
  );
}
