import type { OrganizationProfile, UpdateOrganizationRequest } from "@/types/organization";
import apiClient from "./axiosConfig";

export const getOrganizationProfile = async (): Promise<OrganizationProfile> => {
  const response = await apiClient.get<{ data : OrganizationProfile }>('/organizations/profile');
  return response.data.data;
};

export const updateOrganizationProfile = async (data: UpdateOrganizationRequest): Promise<OrganizationProfile> => {
  const response = await apiClient.put<{ data: OrganizationProfile }>('/organizations/profile', data);
  return response.data.data;
};