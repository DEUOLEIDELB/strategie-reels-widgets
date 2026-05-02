import { useMemo } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { addRecords, deleteRecord, fetchRows, updateRecord } from '@/shared/lib/grist-api';
import type { Reel } from '@/shared/lib/types';

const QK = ['reels'] as const;

export interface ReelFilters {
  avatar?: number;
  angle?: number;
  probleme?: number;
}

export function useReels(filters?: ReelFilters) {
  const q = useQuery({ queryKey: QK, queryFn: () => fetchRows<Reel>('Reels') });
  const data = useMemo(() => {
    if (!q.data) return q.data;
    if (!filters) return q.data;
    return q.data.filter((r) => {
      if (filters.avatar !== undefined && r.avatar !== filters.avatar) return false;
      if (filters.angle !== undefined && r.angle !== filters.angle) return false;
      if (filters.probleme !== undefined && r.probleme !== filters.probleme) return false;
      return true;
    });
  }, [q.data, filters?.avatar, filters?.angle, filters?.probleme]);
  return { ...q, data };
}

type ReelInput = Partial<Omit<Reel, 'id'>>;

export function useCreateReel() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (data: ReelInput) => addRecords('Reels', [data as Record<string, unknown>]),
    onSuccess: () => qc.invalidateQueries({ queryKey: QK }),
  });
}

export function useUpdateReel() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, fields }: { id: number; fields: ReelInput }) =>
      updateRecord('Reels', id, fields as Record<string, unknown>),
    onMutate: async ({ id, fields }) => {
      await qc.cancelQueries({ queryKey: QK });
      const prev = qc.getQueryData<Reel[]>(QK);
      if (prev) {
        qc.setQueryData<Reel[]>(
          QK,
          prev.map((r) => (r.id === id ? { ...r, ...(fields as Partial<Reel>) } : r)),
        );
      }
      return { prev };
    },
    onError: (_err, _vars, ctx) => {
      if (ctx?.prev) qc.setQueryData(QK, ctx.prev);
    },
    onSettled: () => qc.invalidateQueries({ queryKey: QK }),
  });
}

export function useDeleteReel() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: number) => deleteRecord('Reels', id),
    onSuccess: () => qc.invalidateQueries({ queryKey: QK }),
  });
}
