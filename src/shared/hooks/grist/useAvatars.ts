import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { addRecords, deleteRecord, fetchRows, updateRecord } from '@/shared/lib/grist-api';
import type { Avatar } from '@/shared/lib/types';

const QK = ['avatars'] as const;

export function useAvatars() {
  return useQuery({ queryKey: QK, queryFn: () => fetchRows<Avatar>('Avatar') });
}

export function useCreateAvatar() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (data: Omit<Avatar, 'id'>) => addRecords('Avatar', [data]),
    onSuccess: () => qc.invalidateQueries({ queryKey: QK }),
  });
}

export function useUpdateAvatar() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, fields }: { id: number; fields: Partial<Avatar> }) =>
      updateRecord('Avatar', id, fields),
    onMutate: async ({ id, fields }) => {
      await qc.cancelQueries({ queryKey: QK });
      const prev = qc.getQueryData<Avatar[]>(QK);
      if (prev) {
        qc.setQueryData<Avatar[]>(
          QK,
          prev.map((a) => (a.id === id ? { ...a, ...fields } : a)),
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

export function useDeleteAvatar() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: number) => deleteRecord('Avatar', id),
    onSuccess: () => qc.invalidateQueries({ queryKey: QK }),
  });
}
