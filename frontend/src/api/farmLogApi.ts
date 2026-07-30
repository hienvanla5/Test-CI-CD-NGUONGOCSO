import apiClient from './axiosConfig';
import type {
  CreateFarmLogRequest,
  FarmLogResponse,
} from '@/types/farmLog';

interface ApiDataResponse<T> {
  data: T;
}

export const createFarmLog = async (
  payload: CreateFarmLogRequest,
): Promise<FarmLogResponse> => {
  const response = await apiClient.post<ApiDataResponse<FarmLogResponse>>(
    '/farm-logs',
    payload,
  );

  return response.data.data;
};
