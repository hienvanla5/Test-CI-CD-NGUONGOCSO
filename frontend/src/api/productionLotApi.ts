import apiClient from './axiosConfig';
import type {
  ApproveProductionLotRequest,
  ApproveProductionLotResult,
  CreateProductionLotRequest,
  CreateProductionLotResponse,
  FarmAreaOption,
  ProductCategoryOption,
  ProductionLot,
  UpdateProductionLotRequest,
  UpdateProductionLotResponse,
} from '@/types/productionLot';

interface ApiDataResponse<T> {
  data: T;
}

export const getFarmAreaOptions = async (): Promise<FarmAreaOption[]> => {
  const response = await apiClient.get<ApiDataResponse<FarmAreaOption[]>>(
    '/farm-areas',
  );

  return response.data.data;
};

export const getProductCategoryOptions = async (): Promise<
  ProductCategoryOption[]
> => {
  const response = await apiClient.get<
    ApiDataResponse<ProductCategoryOption[]>
  >('/product-categories');

  return response.data.data;
};

export const createProductionLot = async (
  payload: CreateProductionLotRequest,
): Promise<CreateProductionLotResponse> => {
  const response = await apiClient.post<
    ApiDataResponse<CreateProductionLotResponse>
  >('/production-lots', payload);

  return response.data.data;
};

export const getProductionLots = async (
  status?: ProductionLot['status'],
): Promise<ProductionLot[]> => {
  const response = await apiClient.get<
    ApiDataResponse<ProductionLot[]>
  >('/production-lots', {
    params: status ? { status } : undefined,
  });

  return response.data.data;
};

export const getProductionLotById = async (
  id: string,
): Promise<ProductionLot> => {
  const response = await apiClient.get<ApiDataResponse<ProductionLot>>(
    `/production-lots/${id}`,
  );

  return response.data.data;
};

export const updateProductionLot = async (
  id: string,
  data: UpdateProductionLotRequest,
): Promise<UpdateProductionLotResponse> => {
  const response = await apiClient.put<
    ApiDataResponse<UpdateProductionLotResponse>
  >(`/production-lots/${id}`, data);

  return response.data.data;
};
export const submitProductionLot = async (id: string): Promise<ProductionLot> => {
  const response = await apiClient.post<ApiDataResponse<ProductionLot>>(
    `/production-lots/${id}/submit`,
  );

  return response.data.data;
};

export const approveProductionLot = async (
  id: string,
  payload: ApproveProductionLotRequest,
): Promise<ApproveProductionLotResult> => {
  const response = await apiClient.post<
    ApiDataResponse<ApproveProductionLotResult>
  >(`/production-lots/${id}/approve`, payload);

  return response.data.data;
};