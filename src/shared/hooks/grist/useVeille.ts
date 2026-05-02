import { useMemo } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { addRecords, deleteRecord, fetchRows, updateRecord } from '@/shared/lib/grist-api';
import {
  currentSemaineIso,
  type SignalVeille,
  type SyntheseHebdo,
  type SignalCategorie,
  type SignalHorizon,
  type SignalStatut,
} from '@/shared/lib/types';

const QK_SIGNAUX = ['signauxVeille'] as const;
const QK_SYNTHESES = ['synthesesHebdo'] as const;

// ----------------------------------------------------------------------------
// Signaux_veille
// ----------------------------------------------------------------------------

export interface SignauxFilters {
  semaine?: string;
  horizon?: SignalHorizon;
  categorie?: SignalCategorie;
  statut?: SignalStatut;
}

export function useSignauxVeille(filters?: SignauxFilters) {
  const q = useQuery({
    queryKey: QK_SIGNAUX,
    queryFn: () => fetchRows<SignalVeille>('Signaux_veille'),
  });
  const data = useMemo(() => {
    if (!q.data) return q.data;
    if (!filters) return q.data;
    return q.data.filter((s) => {
      if (filters.semaine !== undefined && s.semaine_iso !== filters.semaine) return false;
      if (filters.horizon !== undefined && s.horizon !== filters.horizon) return false;
      if (filters.categorie !== undefined && s.categorie !== filters.categorie) return false;
      if (filters.statut !== undefined && s.statut !== filters.statut) return false;
      return true;
    });
  }, [q.data, filters?.semaine, filters?.horizon, filters?.categorie, filters?.statut]);
  return { ...q, data };
}

type SignalInput = Partial<Omit<SignalVeille, 'id'>>;

export function useCreateSignalVeille() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (data: SignalInput) =>
      addRecords('Signaux_veille', [data as Record<string, unknown>]),
    onSuccess: () => qc.invalidateQueries({ queryKey: QK_SIGNAUX }),
  });
}

export function useUpdateSignalVeille() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, fields }: { id: number; fields: SignalInput }) =>
      updateRecord('Signaux_veille', id, fields as Record<string, unknown>),
    onMutate: async ({ id, fields }) => {
      await qc.cancelQueries({ queryKey: QK_SIGNAUX });
      const prev = qc.getQueryData<SignalVeille[]>(QK_SIGNAUX);
      if (prev) {
        qc.setQueryData<SignalVeille[]>(
          QK_SIGNAUX,
          prev.map((s) => (s.id === id ? { ...s, ...(fields as Partial<SignalVeille>) } : s)),
        );
      }
      return { prev };
    },
    onError: (_err, _vars, ctx) => {
      if (ctx?.prev) qc.setQueryData(QK_SIGNAUX, ctx.prev);
    },
    onSettled: () => qc.invalidateQueries({ queryKey: QK_SIGNAUX }),
  });
}

export function useDeleteSignalVeille() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: number) => deleteRecord('Signaux_veille', id),
    onSuccess: () => qc.invalidateQueries({ queryKey: QK_SIGNAUX }),
  });
}

// ----------------------------------------------------------------------------
// Synthese_hebdo
// ----------------------------------------------------------------------------

export function useSynthesesHebdo() {
  return useQuery({
    queryKey: QK_SYNTHESES,
    queryFn: () => fetchRows<SyntheseHebdo>('Synthese_hebdo'),
  });
}

export function useSyntheseEnCours() {
  const q = useSynthesesHebdo();
  const data = useMemo(() => {
    if (!q.data) return undefined;
    const semaine = currentSemaineIso();
    return q.data.find((s) => s.semaine_iso === semaine && s.statut === 'en_cours');
  }, [q.data]);
  return { ...q, data };
}

type SyntheseInput = Partial<Omit<SyntheseHebdo, 'id'>>;

export function useCreateSynthese() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (data: SyntheseInput) =>
      addRecords('Synthese_hebdo', [data as Record<string, unknown>]),
    onSuccess: () => qc.invalidateQueries({ queryKey: QK_SYNTHESES }),
  });
}

export function useUpdateSynthese() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, fields }: { id: number; fields: SyntheseInput }) =>
      updateRecord('Synthese_hebdo', id, fields as Record<string, unknown>),
    onMutate: async ({ id, fields }) => {
      await qc.cancelQueries({ queryKey: QK_SYNTHESES });
      const prev = qc.getQueryData<SyntheseHebdo[]>(QK_SYNTHESES);
      if (prev) {
        qc.setQueryData<SyntheseHebdo[]>(
          QK_SYNTHESES,
          prev.map((s) => (s.id === id ? { ...s, ...(fields as Partial<SyntheseHebdo>) } : s)),
        );
      }
      return { prev };
    },
    onError: (_err, _vars, ctx) => {
      if (ctx?.prev) qc.setQueryData(QK_SYNTHESES, ctx.prev);
    },
    onSettled: () => qc.invalidateQueries({ queryKey: QK_SYNTHESES }),
  });
}

export function useDeleteSynthese() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: number) => deleteRecord('Synthese_hebdo', id),
    onSuccess: () => qc.invalidateQueries({ queryKey: QK_SYNTHESES }),
  });
}
