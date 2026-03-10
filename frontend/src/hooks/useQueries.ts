import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useActor } from './useActor';
import type { Document, ExternalBlob } from '../backend';

export function useGetMyDocuments(refreshTrigger: number) {
  const { actor, isFetching } = useActor();

  return useQuery<Document[]>({
    queryKey: ['documents', refreshTrigger],
    queryFn: async () => {
      if (!actor) return [];
      return actor.getMyDocumentIds(false);
    },
    enabled: !!actor && !isFetching,
  });
}

export function useAddDocument() {
  const { actor } = useActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      content,
      id,
      name,
      size,
    }: {
      content: ExternalBlob;
      id: string;
      name: string;
      size: bigint;
    }) => {
      if (!actor) throw new Error('Actor not initialized');
      return actor.addDocument(content, id, name, size);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['documents'] });
    },
  });
}

export function useDeleteDocument() {
  const { actor } = useActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id: string) => {
      if (!actor) throw new Error('Actor not initialized');
      return actor.deleteDocument(id);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['documents'] });
    },
  });
}
