import apiClient from './axiosConfig';
import type { CreateShipmentPayload, Shipment, ShipmentResponse } from '@/types/shipment';

/**
 * Lấy danh sách lô hàng của một lô sản xuất
 * GET /api/v1/production-lots/{productionLotId}/shipments
 */
export const getShipmentsByProductionLot = async (productionLotId: string): Promise<Shipment[]> => {
  const response = await apiClient.get<{ data: Shipment[] }>(
    `/production-lots/${productionLotId}/shipments`
  );
  return response.data.data;
};

/**
 * Tạo lô hàng mới và sinh mã truy xuất
 * POST /api/v1/shipments
 */
export const createShipment = async (payload: CreateShipmentPayload): Promise<Shipment> => {
  const response = await apiClient.post<ShipmentResponse>('/shipments', payload);
  return response.data.data;
};