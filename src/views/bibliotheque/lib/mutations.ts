import { useMutation, useQueryClient } from '@tanstack/react-query';
import { addRecords, updateRecord, deleteRecord } from '@/shared/lib/grist-api';
import type { BrollPlan, SessionTournage, Ressource } from '@/shared/lib/types';
import type { RessourceWithAction } from '../types';
import type { ReelReference } from './queries';

// Mutations locales à la Bibliothèque, sans toucher à shared/.
// Invalidate les queryKeys utilisés par les hooks shared (broll, sessions, ressources).

type BrollInput = Partial<Omit<BrollPlan, 'id'>>;
type SessionInput = Partial<Omit<SessionTournage, 'id'>>;
type RessourceInput = Partial<Omit<RessourceWithAction, 'id'>>;
type ReelRefInput = Partial<Omit<ReelReference, 'id'>>;

const QK_BROLL = ['broll'] as const;
const QK_SESSIONS = ['sessions'] as const;
const QK_RESSOURCES = ['ressources'] as const;
const QK_REFS = ['reels_references'] as const;

export function useCreateBroll() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (data: BrollInput) =>
      addRecords('Broll', [data as Record<string, unknown>]),
    onSuccess: () => qc.invalidateQueries({ queryKey: QK_BROLL }),
  });
}

export function useUpdateBroll() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, fields }: { id: number; fields: BrollInput }) =>
      updateRecord('Broll', id, fields as Record<string, unknown>),
    onMutate: async ({ id, fields }) => {
      await qc.cancelQueries({ queryKey: QK_BROLL });
      const prev = qc.getQueryData<BrollPlan[]>(QK_BROLL);
      if (prev) {
        qc.setQueryData<BrollPlan[]>(
          QK_BROLL,
          prev.map((b) => (b.id === id ? { ...b, ...(fields as Partial<BrollPlan>) } : b)),
        );
      }
      return { prev };
    },
    onError: (_e, _v, ctx) => ctx?.prev && qc.setQueryData(QK_BROLL, ctx.prev),
    onSettled: () => qc.invalidateQueries({ queryKey: QK_BROLL }),
  });
}

export function useDeleteBroll() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: number) => deleteRecord('Broll', id),
    onSuccess: () => qc.invalidateQueries({ queryKey: QK_BROLL }),
  });
}

// Insertion batch pour amorcer une table vide.
export function useBatchCreateBrolls() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (records: BrollInput[]) =>
      addRecords('Broll', records as Record<string, unknown>[]),
    onSuccess: () => qc.invalidateQueries({ queryKey: QK_BROLL }),
  });
}

export function useCreateSession() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (data: SessionInput) =>
      addRecords('Sessions_tournage', [data as Record<string, unknown>]),
    onSuccess: () => qc.invalidateQueries({ queryKey: QK_SESSIONS }),
  });
}

export function useUpdateSession() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, fields }: { id: number; fields: SessionInput }) =>
      updateRecord('Sessions_tournage', id, fields as Record<string, unknown>),
    onMutate: async ({ id, fields }) => {
      await qc.cancelQueries({ queryKey: QK_SESSIONS });
      const prev = qc.getQueryData<SessionTournage[]>(QK_SESSIONS);
      if (prev) {
        qc.setQueryData<SessionTournage[]>(
          QK_SESSIONS,
          prev.map((s) => (s.id === id ? { ...s, ...(fields as Partial<SessionTournage>) } : s)),
        );
      }
      return { prev };
    },
    onError: (_e, _v, ctx) => ctx?.prev && qc.setQueryData(QK_SESSIONS, ctx.prev),
    onSettled: () => qc.invalidateQueries({ queryKey: QK_SESSIONS }),
  });
}

export function useDeleteSession() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: number) => deleteRecord('Sessions_tournage', id),
    onSuccess: () => qc.invalidateQueries({ queryKey: QK_SESSIONS }),
  });
}

export function useCreateRessource() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (data: RessourceInput) =>
      addRecords('Ressources', [data as Record<string, unknown>]),
    onSuccess: () => qc.invalidateQueries({ queryKey: QK_RESSOURCES }),
  });
}

export function useUpdateRessource() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, fields }: { id: number; fields: RessourceInput }) =>
      updateRecord('Ressources', id, fields as Record<string, unknown>),
    onMutate: async ({ id, fields }) => {
      await qc.cancelQueries({ queryKey: QK_RESSOURCES });
      const prev = qc.getQueryData<Ressource[]>(QK_RESSOURCES);
      if (prev) {
        qc.setQueryData<Ressource[]>(
          QK_RESSOURCES,
          prev.map((r) => (r.id === id ? { ...r, ...(fields as Partial<Ressource>) } : r)),
        );
      }
      return { prev };
    },
    onError: (_e, _v, ctx) => ctx?.prev && qc.setQueryData(QK_RESSOURCES, ctx.prev),
    onSettled: () => qc.invalidateQueries({ queryKey: QK_RESSOURCES }),
  });
}

export function useDeleteRessource() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: number) => deleteRecord('Ressources', id),
    onSuccess: () => qc.invalidateQueries({ queryKey: QK_RESSOURCES }),
  });
}

export function useCreateReelReference() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (data: ReelRefInput) =>
      addRecords('Reels_references', [data as Record<string, unknown>]),
    onSuccess: () => qc.invalidateQueries({ queryKey: QK_REFS }),
  });
}

export function useUpdateReelReference() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, fields }: { id: number; fields: ReelRefInput }) =>
      updateRecord('Reels_references', id, fields as Record<string, unknown>),
    onMutate: async ({ id, fields }) => {
      await qc.cancelQueries({ queryKey: QK_REFS });
      const prev = qc.getQueryData<ReelReference[]>(QK_REFS);
      if (prev) {
        qc.setQueryData<ReelReference[]>(
          QK_REFS,
          prev.map((r) => (r.id === id ? { ...r, ...(fields as Partial<ReelReference>) } : r)),
        );
      }
      return { prev };
    },
    onError: (_e, _v, ctx) => ctx?.prev && qc.setQueryData(QK_REFS, ctx.prev),
    onSettled: () => qc.invalidateQueries({ queryKey: QK_REFS }),
  });
}

export function useDeleteReelReference() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: number) => deleteRecord('Reels_references', id),
    onSuccess: () => qc.invalidateQueries({ queryKey: QK_REFS }),
  });
}
