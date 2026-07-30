import apiClient from './axiosConfig';
import type { HarvestEventPayload, HarvestEventResponse } from '@/types/traceEvent';


export const recordHarvestEvent = async (payload: HarvestEventPayload): Promise<HarvestEventResponse> => {
  const response = await apiClient.post<HarvestEventResponse>('/trace-events/harvest', payload);
  return response.data;
};