import { useState, useEffect, useCallback } from 'react';
import { toast } from 'sonner';
import { getShipmentsByProductionLot, createShipment } from '@/api/shipmentApi';
import type { Shipment, CreateShipmentPayload } from '@/types/shipment';

export const useShipments = (productionLotId: string) => {
  const [shipments, setShipments] = useState<Shipment[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isCreating, setIsCreating] = useState(false);

  const loadShipments = useCallback(async () => {
    if (!productionLotId) return;
    setIsLoading(true);
    try {
      const data = await getShipmentsByProductionLot(productionLotId);
      setShipments(data);
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Không thể tải danh sách lô hàng');
    } finally {
      setIsLoading(false);
    }
  }, [productionLotId]);

  useEffect(() => {
    loadShipments();
  }, [loadShipments]);

  const createShipmentMutation = async (payload: CreateShipmentPayload) => {
    setIsCreating(true);
    try {
      const newShipment = await createShipment(payload);
      setShipments((prev) => [newShipment, ...prev]);
      toast.success('Tạo lô hàng thành công!');
      return newShipment;
    } catch (error: any) {
      const message = error.response?.data?.message || 'Có lỗi xảy ra khi tạo lô hàng.';
      toast.error(message);
      throw error;
    } finally {
      setIsCreating(false);
    }
  };

  return {
    shipments,
    isLoading,
    isCreating,
    createShipment: createShipmentMutation,
    reload: loadShipments,
  };
};