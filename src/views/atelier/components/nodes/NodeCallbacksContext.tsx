import { createContext, useContext, type ReactNode } from 'react';

interface NodeCallbacks {
  onAddChild: (nodeId: string) => void;
  onRemove: (nodeId: string) => void;
  onOpenDrawer: (nodeId: string) => void;
}

const NodeCallbacksContext = createContext<NodeCallbacks | null>(null);

export function NodeCallbacksProvider({ children, value }: { children: ReactNode; value: NodeCallbacks }) {
  return <NodeCallbacksContext.Provider value={value}>{children}</NodeCallbacksContext.Provider>;
}

export function useNodeCallbacks(): NodeCallbacks {
  const ctx = useContext(NodeCallbacksContext);
  if (!ctx) {
    return {
      onAddChild: () => undefined,
      onRemove: () => undefined,
      onOpenDrawer: () => undefined,
    };
  }
  return ctx;
}
