import axios from 'axios';
import { getToken } from '@/utils/storage';
import type {
  OrganizationProfile,
  UpdateOrganizationRequest,
  CreateOrganizationRequest,
  CreateOrganizationResponse,
  Organization,
  OrganizationDetailResponse,
} from "@/types/organization";

import type {
  AddMemberRequest,
  CreateOrganizationMemberResponse,
} from "@/types/organization";

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

export const getOrganizations = async (): Promise<Organization[]> => {
  const response = await apiClient.get<{ data: Organization[] }>('/admin/organizations');
  return response.data.data;
};  

export const getOrganizationDetail = async (
  id: string
): Promise<OrganizationDetailResponse> => {
  const response = await apiClient.get<{
    data: OrganizationDetailResponse;
  }>(`/admin/organizations/${id}`);

  return response.data.data;
};

export const createOrganizationMember = async (
  organizationId: string,
  data: AddMemberRequest
): Promise<CreateOrganizationMemberResponse> => {
  const response = await apiClient.post<{
    data: CreateOrganizationMemberResponse;
  }>(
    `/admin/organizations/${organizationId}/members`,
    data
  );

  return response.data.data;
};