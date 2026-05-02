import { create } from 'zustand';
import type { Hook, Script, Ressource } from '@/shared/lib/types';

export type View = 'atelier' | 'bibliotheque' | 'veille';
export type BriqueType = 'avatar' | 'angle' | 'pain' | 'reel';

export type Injection =
  | { type: 'hook'; data: Hook }
  | { type: 'script'; data: Script }
  | { type: 'ressource'; data: Ressource };

const ATELIER_STORAGE_KEY = 'wubo_current_atelier_id';

function readPersistedAtelierId(): number | null {
  try {
    const raw = localStorage.getItem(ATELIER_STORAGE_KEY);
    if (!raw) return null;
    const n = Number(raw);
    return Number.isFinite(n) && n > 0 ? n : null;
  } catch {
    return null;
  }
}

function writePersistedAtelierId(id: number | null): void {
  try {
    if (id === null) localStorage.removeItem(ATELIER_STORAGE_KEY);
    else localStorage.setItem(ATELIER_STORAGE_KEY, String(id));
  } catch {
    // ignore (quota / privacy mode)
  }
}

interface AppStore {
  view: View;
  setView: (v: View) => void;

  currentAtelierId: number | null;
  setCurrentAtelier: (id: number | null) => void;

  currentAvatarId: number | null;
  currentAngleId: number | null;
  currentPainId: number | null;
  currentBrique: { type: BriqueType; id: number } | null;
  setCurrentAvatar: (id: number | null) => void;
  setCurrentAngle: (id: number | null) => void;
  setCurrentPain: (id: number | null) => void;
  setCurrentBrique: (b: { type: BriqueType; id: number } | null) => void;
  resetSelection: () => void;

  pendingInjection: Injection | null;
  triggerInjection: (i: Injection) => void;
  consumeInjection: () => Injection | null;
}

export const useAppStore = create<AppStore>((set, get) => ({
  view: 'atelier',
  setView: (v) => set({ view: v }),

  currentAtelierId: readPersistedAtelierId(),
  setCurrentAtelier: (id) => {
    writePersistedAtelierId(id);
    set({ currentAtelierId: id });
  },

  currentAvatarId: null,
  currentAngleId: null,
  currentPainId: null,
  currentBrique: null,
  setCurrentAvatar: (id) => set({ currentAvatarId: id }),
  setCurrentAngle: (id) => set({ currentAngleId: id }),
  setCurrentPain: (id) => set({ currentPainId: id }),
  setCurrentBrique: (b) => set({ currentBrique: b }),
  resetSelection: () =>
    set({
      currentAvatarId: null,
      currentAngleId: null,
      currentPainId: null,
      currentBrique: null,
    }),

  pendingInjection: null,
  triggerInjection: (i) => set({ pendingInjection: i }),
  consumeInjection: () => {
    const i = get().pendingInjection;
    set({ pendingInjection: null });
    return i;
  },
}));
