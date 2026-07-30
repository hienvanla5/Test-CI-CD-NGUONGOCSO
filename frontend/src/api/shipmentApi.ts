import apiClient from './axiosConfig';
import type { CreateShipmentPayload, Shipment, ShipmentResponse } from '@/types/shipment';

export const getShipmentsByProductionLot = async (productionLotId: string): Promise<Shipment[]> => {
  const response = await apiClient.get<{ data: Shipment[] }>(
    `/production-lots/${productionLotId}/shipments`
  );
  return response.data.data;
};

export const createShipment = async (payload: CreateShipmentPayload): Promise<Shipment> => {
  const response = await apiClient.post<ShipmentResponse>('/shipments', payload);
  return response.data.data;
};