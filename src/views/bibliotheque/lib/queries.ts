import { useQuery } from '@tanstack/react-query';
import { fetchRows } from '@/shared/lib/grist-api';

// Types des nouvelles tables Grist (V5).
// Pas dans shared/lib/types.ts pour respecter la zone d'agent. Le PO promouvra si besoin.

export interface ReelReference {
  id: number;
  url: string;
  createur: string;
  plateforme: 'instagram' | 'tiktok' | 'youtube_shorts' | string;
  hook_observe: string;
  patterns: string[] | string;
  vues_estimees: string;
  duree_sec: number;
  take_away_wubo: string;
  transcript: string;
  url_thumbnail: string;
  date_ajout: string | number;
}

export interface TechniqueMontage {
  id: number;
  key: string;
  nom: string;
  type: 'cut' | 'transition' | 'effet' | 'pacing' | 'structure' | string;
  description: string;
  comment_reconnaitre: string;
  exemple_wubo: string;
}

export function useReelsReferences() {
  return useQuery({
    queryKey: ['reels_references'],
    queryFn: () => fetchRows<ReelReference>('Reels_references'),
  });
}

export function useTechniquesMontage() {
  return useQuery({
    queryKey: ['techniques_montage'],
    queryFn: () => fetchRows<TechniqueMontage>('Techniques_montage'),
  });
}
