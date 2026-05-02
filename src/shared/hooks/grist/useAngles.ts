import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { addRecords, deleteRecord, fetchRows, updateRecord } from '@/shared/lib/grist-api';
import { encodeRefList } from '@/shared/lib/utils';
import type { Angle } from '@/shared/lib/types';

const QK = ['angles'] as const;

export function useAngles() {
  return useQuery({ queryKey: QK, queryFn: () => fetchRows<Angle>('Angles') });
}

type AngleInput = Omit<Angle, 'id' | 'avatars'> & { avatars?: number[] };

function encodeAngleFields<T extends { avatars?: number[] | string[] }>(input: T): Record<string, unknown> {
  const { avatars, ...rest } = input as { avatars?: number[] };
  const fields: Record<string, unknown> = { ...rest };
  if (avatars !== undefined) fields.avatars = encodeRefList(avatars as number[]);
  return fields;
}

export function useCreateAngle() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (data: AngleInput) => addRecords('Angles', [encodeAngleFields(data)]),
    onSuccess: () => qc.invalidateQueries({ queryKey: QK }),
  });
}

export function useUpdateAngle() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, fields }: { id: number; fields: Partial<AngleInput> }) =>
      updateRecord('Angles', id, encodeAngleFields(fields)),
    onMutate: async ({ id, fields }) => {
      await qc.cancelQueries({ queryKey: QK });
      const prev = qc.getQueryData<Angle[]>(QK);
      if (prev) {
        qc.setQueryData<Angle[]>(
          QK,
          prev.map((a) => (a.id === id ? { ...a, ...(fields as Partial<Angle>) } : a)),
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

export function useDeleteAngle() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: number) => deleteRecord('Angles', id),
    onSuccess: () => qc.invalidateQueries({ queryKey: QK }),
  });
}
