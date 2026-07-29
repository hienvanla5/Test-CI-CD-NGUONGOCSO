import axios from 'axios';
import { getToken } from '@/utils/storage';
import type {
  OrganizationProfile,
  UpdateOrganizationRequest,
  CreateOrganizationRequest,
  CreateOrganizationResponse,
} from '@/types/organization';

const apiClient = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL,
  headers: { 'Content-Type': 'application/json' },
});

// Interceptor để gắn token
apiClient.interceptors.request.use((config) => {
  const token = getToken();
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});
export const getOrganizationProfile = async (): Promise<OrganizationProfile> => {
  const response = await apiClient.get<{ data : OrganizationProfile }>('/organizations/profile');
  return response.data.data;
};

export const updateOrganizationProfile = async (data: UpdateOrganizationRequest): Promise<OrganizationProfile> => {
  const response = await apiClient.put<{ data: OrganizationProfile }>('/organizations/profile', data);
  return response.data.data;
};
export const createOrganization = async (data: CreateOrganizationRequest): Promise<CreateOrganizationResponse> => {
  const response = await apiClient.post<CreateOrganizationResponse>('/admin/organizations', data);
  return response.data;
};