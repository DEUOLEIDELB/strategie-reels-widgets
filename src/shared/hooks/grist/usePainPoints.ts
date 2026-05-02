import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { addRecords, deleteRecord, fetchRows, updateRecord } from '@/shared/lib/grist-api';
import { encodeRefList } from '@/shared/lib/utils';
import type { PainPoint } from '@/shared/lib/types';

const QK = ['painPoints'] as const;

export function usePainPoints() {
  return useQuery({ queryKey: QK, queryFn: () => fetchRows<PainPoint>('Pain_points') });
}

type PainInput = Omit<PainPoint, 'id' | 'avatars' | 'angles'> & {
  avatars?: number[];
  angles?: number[];
};

function encodePainFields<T extends { avatars?: number[] | string[]; angles?: number[] | string[] }>(
  input: T,
): Record<string, unknown> {
  const { avatars, angles, ...rest } = input as { avatars?: number[]; angles?: number[] };
  const fields: Record<string, unknown> = { ...rest };
  if (avatars !== undefined) fields.avatars = encodeRefList(avatars as number[]);
  if (angles !== undefined) fields.angles = encodeRefList(angles as number[]);
  return fields;
}

export function useCreatePainPoint() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (data: PainInput) => addRecords('Pain_points', [encodePainFields(data)]),
    onSuccess: () => qc.invalidateQueries({ queryKey: QK }),
  });
}

export function useUpdatePainPoint() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, fields }: { id: number; fields: Partial<PainInput> }) =>
      updateRecord('Pain_points', id, encodePainFields(fields)),
    onMutate: async ({ id, fields }) => {
      await qc.cancelQueries({ queryKey: QK });
      const prev = qc.getQueryData<PainPoint[]>(QK);
      if (prev) {
        qc.setQueryData<PainPoint[]>(
          QK,
          prev.map((p) => (p.id === id ? { ...p, ...(fields as Partial<PainPoint>) } : p)),
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

export function useDeletePainPoint() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: number) => deleteRecord('Pain_points', id),
    onSuccess: () => qc.invalidateQueries({ queryKey: QK }),
  });
}
