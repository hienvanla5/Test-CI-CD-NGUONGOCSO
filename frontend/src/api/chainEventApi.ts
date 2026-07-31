import apiClient from './axiosConfig';
import type { ChainEventResponse } from '@/types/packaging';

export const getShipmentTimeline = async (shipmentId: string): Promise<ChainEventResponse[]> => {
  const response = await apiClient.get<{ data: ChainEventResponse[] }>(
    `/shipments/${shipmentId}/chain-events`
  );
  return response.data.data;
};