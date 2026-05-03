import { createContext, useContext, type ReactNode } from 'react';
import type { BriquesDataSnapshot } from '../../lib/computeSlots';

const EMPTY: BriquesDataSnapshot = { avatars: [], angles: [], pains: [], reels: [] };

const BriquesDataContext = createContext<BriquesDataSnapshot>(EMPTY);

export function BriquesDataProvider({
  children,
  value,
}: {
  children: ReactNode;
  value: BriquesDataSnapshot;
}) {
  return <BriquesDataContext.Provider value={value}>{children}</BriquesDataContext.Provider>;
}

export function useBriquesData(): BriquesDataSnapshot {
  return useContext(BriquesDataContext);
}
