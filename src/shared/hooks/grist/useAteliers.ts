import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { addRecords, deleteRecord, fetchRows, updateRecord } from '@/shared/lib/grist-api';
import type { Atelier } from '@/shared/lib/types';

const QK = ['ateliers'] as const;

function nowSec(): number {
  return Math.floor(Date.now() / 1000);
}

export function useAteliers() {
  return useQuery({ queryKey: QK, queryFn: () => fetchRows<Atelier>('Ateliers') });
}

export function useCreateAtelier() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (data: { nom: string; description?: string; canvas_state?: string; parent_atelier?: number }) => {
      const ts = nowSec();
      const ids = await addRecords('Ateliers', [
        {
          nom: data.nom,
          description: data.description ?? '',
          canvas_state: data.canvas_state ?? '{"nodes":[],"edges":[]}',
          parent_atelier: data.parent_atelier ?? null,
          created_at: ts,
          updated_at: ts,
        },
      ]);
      return ids[0];
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: QK }),
  });
}

export function useUpdateAtelier() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, fields }: { id: number; fields: Partial<Atelier> }) =>
      updateRecord('Ateliers', id, { ...fields, updated_at: nowSec() }),
    onMutate: async ({ id, fields }) => {
      await qc.cancelQueries({ queryKey: QK });
      const prev = qc.getQueryData<Atelier[]>(QK);
      if (prev) {
        qc.setQueryData<Atelier[]>(
          QK,
          prev.map((a) => (a.id === id ? { ...a, ...fields, updated_at: nowSec() } : a)),
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

export function useDeleteAtelier() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: number) => deleteRecord('Ateliers', id),
    onSuccess: () => qc.invalidateQueries({ queryKey: QK }),
  });
}

export function useDuplicateAtelier() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (source: Atelier) => {
      const ts = nowSec();
      const ids = await addRecords('Ateliers', [
        {
          nom: `${source.nom} (copie)`,
          description: source.description ?? '',
          canvas_state: source.canvas_state ?? '{"nodes":[],"edges":[]}',
          parent_atelier: source.id,
          created_at: ts,
          updated_at: ts,
        },
      ]);
      return ids[0];
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: QK }),
  });
}
