import type { RecordMobileEventRequest } from '@/types/chainEvent';
import apiClient from './axiosConfig';
import type { ChainEventResponse } from '@/types/packaging';

export const getShipmentTimeline = async (shipmentId: string): Promise<ChainEventResponse[]> => {
  const response = await apiClient.get<{ data: ChainEventResponse[] }>(
    `/shipments/${shipmentId}/chain-events`
  );
  return response.data.data;
};

export const recordMobileEvent = async (
  data: RecordMobileEventRequest
): Promise<ChainEventResponse> => {
  const response = await apiClient.post<{ data: ChainEventResponse }>(
    '/chain-events/mobile',
    data
  );
  return response.data.data;
};