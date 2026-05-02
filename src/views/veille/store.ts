import { create } from 'zustand';

export type BlocVeille =
  | 'pulse-concurrents'
  | 'pulse-wubo'
  | 'vagues-sons'
  | 'hall-of-fame'
  | 'reseau'
  | 'synthese-hebdo';

interface VeilleStore {
  bloc: BlocVeille;
  setBloc: (b: BlocVeille) => void;
}

export const useVeilleStore = create<VeilleStore>((set) => ({
  bloc: 'pulse-concurrents',
  setBloc: (b) => set({ bloc: b }),
}));
