import apiClient from './axiosConfig';
import type {
  FarmLog,
  PageResponse,
  FarmLogQueryParams,
  CreateFarmLogRequest,
  FarmLogResponse,
} from '@/types/farmLog';

export const getFarmLogs = async (
  params: FarmLogQueryParams
): Promise<PageResponse<FarmLog>> => {
  const response = await apiClient.get<{
    success: boolean;
    data: PageResponse<FarmLog>;
  }>('/farm-logs', { params });
  return response.data.data;
};

export const createFarmLog = async (
  payload: CreateFarmLogRequest
): Promise<FarmLogResponse> => {
  const response = await apiClient.post<{
    success: boolean;
    data: FarmLogResponse;
  }>('/farm-logs', payload);
  return response.data.data;
};