import apiClient from './axiosConfig';
import type {
  ProductionLot,
  UpdateProductionLotRequest,
  UpdateProductionLotResponse,
} from '@/types/farm';
import type {
  CreateProductionLotRequest,
  CreateProductionLotResponse,
  FarmAreaOption,
  ProductCategoryOption,
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

export const getProductionLots = async (): Promise<ProductionLot[]> => {
  const response = await apiClient.get<
    ApiDataResponse<ProductionLot[]>
  >('/production-lots');

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