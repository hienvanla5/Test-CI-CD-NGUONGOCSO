import type { ApiResult, LoginRequest, LoginResponse } from "@/types/auth";
import apiClient from "./axiosConfig";

export const login = async (data: LoginRequest): Promise<ApiResult<LoginResponse>> => {
  const response = await apiClient.post<ApiResult<LoginResponse>>('/auth/login', data);
  return response.data;
}

export const getCurrent = async () => {
  const response = await apiClient.get('/auth/me');
  return response.data;
};