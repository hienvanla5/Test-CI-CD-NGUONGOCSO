import type { OrganizationType } from "./auth";

export interface OrganizationProfile {
  organizationId: string;
  name: string;
  code: string;
  type: OrganizationType;
  status: 'ACTIVE' | 'INACTIVE';
  address: string | null;
  phone: string | null;
  email: string |  null;
  createdAt: string;
  updatedAt: string;
}

export interface UpdateOrganizationRequest {
  name: string;
  address?: string;
  phone?: string;
  email?: string;
}

export interface OrganizationProfileResponse {
  success: boolean;
  data: OrganizationProfile;
}