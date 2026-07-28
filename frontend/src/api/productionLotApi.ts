import type { ProductionLot, UpdateProductionLotRequest, UpdateProductionLotResponse } from "@/types/farm";
import apiClient from "./axiosConfig";

export const getProductionLotById = async (id: string): Promise<ProductionLot> => {
  const response = await apiClient.get<{ data: ProductionLot }>(`/production-lots/${id}`);
  return response.data.data;
};

export const updateProductionLot = async (
  id: string,
  data: UpdateProductionLotRequest
): Promise<UpdateProductionLotResponse> => {
  const response = await apiClient.put<{ data: UpdateProductionLotResponse }>(`/production-lots/${id}`, data);
  return response.data.data;
};