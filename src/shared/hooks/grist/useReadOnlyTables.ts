import { useQuery } from '@tanstack/react-query';
import { fetchRows } from '@/shared/lib/grist-api';
import type {
  Hook,
  Script,
  Ressource,
  TaxoEntry,
  Serie,
  VideoVirale,
  Concurrent,
  Tendance,
  SessionTournage,
  BrollPlan,
  MetriqueReel,
  Influenceur,
  Sujet,
} from '@/shared/lib/types';

export function useHooks() {
  return useQuery({ queryKey: ['hooks'], queryFn: () => fetchRows<Hook>('Hooks') });
}

export function useScripts() {
  return useQuery({ queryKey: ['scripts'], queryFn: () => fetchRows<Script>('Scripts') });
}

export function useRessources() {
  return useQuery({ queryKey: ['ressources'], queryFn: () => fetchRows<Ressource>('Ressources') });
}

export function useTaxonomie() {
  return useQuery({ queryKey: ['taxonomie'], queryFn: () => fetchRows<TaxoEntry>('Taxonomie') });
}

export function useSeries() {
  return useQuery({ queryKey: ['series'], queryFn: () => fetchRows<Serie>('Series') });
}

export function useVideosVirales() {
  return useQuery({
    queryKey: ['videosVirales'],
    queryFn: () => fetchRows<VideoVirale>('Videos_virales'),
  });
}

export function useConcurrents() {
  return useQuery({
    queryKey: ['concurrents'],
    queryFn: () => fetchRows<Concurrent>('Concurrents'),
  });
}

export function useTendances() {
  return useQuery({ queryKey: ['tendances'], queryFn: () => fetchRows<Tendance>('Tendances') });
}

export function useSessions() {
  return useQuery({
    queryKey: ['sessions'],
    queryFn: () => fetchRows<SessionTournage>('Sessions_tournage'),
  });
}

export function useBroll() {
  return useQuery({ queryKey: ['broll'], queryFn: () => fetchRows<BrollPlan>('Broll') });
}

export function useMetriquesReels() {
  return useQuery({
    queryKey: ['metriquesReels'],
    queryFn: () => fetchRows<MetriqueReel>('Metriques_reels'),
  });
}

export function useInfluenceurs() {
  return useQuery({
    queryKey: ['influenceurs'],
    queryFn: () => fetchRows<Influenceur>('Influenceurs'),
  });
}

export function useSujets() {
  return useQuery({ queryKey: ['sujets'], queryFn: () => fetchRows<Sujet>('Sujets') });
}
