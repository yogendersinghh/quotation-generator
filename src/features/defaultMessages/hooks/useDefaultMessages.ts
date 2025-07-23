import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { defaultMessagesApi } from '../api';
import { DefaultMessage } from '../types';

export function useDefaultMessages() {
  return useQuery<DefaultMessage[]>({
    queryKey: ['defaultMessages'],
    queryFn: defaultMessagesApi.getAll,
  });
}

export function useUpdateDefaultMessage() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, ...updateData }: { id: string } & Pick<DefaultMessage, 'formalMessage' | 'notes' | 'billingDetails' | 'termsAndConditions' | 'signatureImage'>) =>
      defaultMessagesApi.update(id, updateData),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['defaultMessages'] });
    },
  });
} 