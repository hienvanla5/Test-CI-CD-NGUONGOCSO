import apiClient from './axiosConfig';
import type { CreateShipmentPayload, Shipment, ShipmentResponse } from '@/types/shipment';

/**
 * Lấy danh sách lô hàng của một lô sản xuất
 * GET /api/v1/production-lots/{productionLotId}/shipments
 */
export const getShipmentsByProductionLot = async (productionLotId: string): Promise<Shipment[]> => {
  const response = await apiClient.get<{ data: Shipment[] }>(
    `/shipments/production-lots/${productionLotId}`
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

/**
 * Kích hoạt toàn bộ tem đã được cấp cho một lô hàng.
 * POST /api/v1/shipments/{shipmentId}/activate
 */
export const activateShipmentStamps = async (
  shipmentId: string,
): Promise<Shipment> => {
  const response = await apiClient.post<ShipmentResponse>(
    `/shipments/${shipmentId}/activate`,
  );

  return response.data.data;
};