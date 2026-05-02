import { ReactNode } from 'react';
import * as TabsPrimitive from '@radix-ui/react-tabs';
import { cn } from '@/shared/lib/utils';

interface TabsProps {
  value: string;
  onValueChange: (v: string) => void;
  children: ReactNode;
  className?: string;
}

export function Tabs({ value, onValueChange, children, className }: TabsProps) {
  return (
    <TabsPrimitive.Root value={value} onValueChange={onValueChange} className={className}>
      {children}
    </TabsPrimitive.Root>
  );
}

export function TabsList({ children, className }: { children: ReactNode; className?: string }) {
  return (
    <TabsPrimitive.List
      className={cn(
        'inline-flex items-center gap-1 p-1 bg-surface-alt rounded-md border border-border',
        className,
      )}
    >
      {children}
    </TabsPrimitive.List>
  );
}

interface TabsTriggerProps {
  value: string;
  children: ReactNode;
  count?: number;
  className?: string;
}

export function TabsTrigger({ value, children, count, className }: TabsTriggerProps) {
  return (
    <TabsPrimitive.Trigger
      value={value}
      className={cn(
        'inline-flex items-center gap-1.5 px-3 h-8 text-xs font-medium rounded-sm transition-all',
        'text-text-dim hover:text-text',
        'data-[state=active]:bg-surface data-[state=active]:text-text data-[state=active]:shadow-sm',
        'focus:outline-none focus-visible:ring-2 focus-visible:ring-current focus-visible:ring-offset-1',
        className,
      )}
    >
      {children}
      {typeof count === 'number' && (
        <span className="text-[10px] tabular-nums text-text-faint">{count}</span>
      )}
    </TabsPrimitive.Trigger>
  );
}

interface TabsContentProps {
  value: string;
  children: ReactNode;
  className?: string;
}

export function TabsContent({ value, children, className }: TabsContentProps) {
  return (
    <TabsPrimitive.Content
      value={value}
      className={cn('focus:outline-none', className)}
    >
      {children}
    </TabsPrimitive.Content>
  );
}
