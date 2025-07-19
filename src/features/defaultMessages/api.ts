import { apiClient } from '../../lib/axios';
import { DefaultMessage } from './types';

const DEFAULT_MESSAGES_ENDPOINT = '/api/default-messages';

export const defaultMessagesApi = {
  getAll: async (): Promise<DefaultMessage[]> => {
    const { data } = await apiClient.get<DefaultMessage[]>(DEFAULT_MESSAGES_ENDPOINT);
    return data;
  },

  update: async (
    id: string,
    updateData: Pick<DefaultMessage, 'formalMessage' | 'notes' | 'billingDetails' | 'termsAndConditions'>
  ): Promise<DefaultMessage> => {
    const { data } = await apiClient.put<DefaultMessage>(`${DEFAULT_MESSAGES_ENDPOINT}/${id}`, updateData);
    return data;
  },
}; 