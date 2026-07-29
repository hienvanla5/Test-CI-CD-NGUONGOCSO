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
export interface CreateOrganizationRequest {
  organizationName: string;
  organizationCode: string;
  organizationType: OrganizationType; // 'COOPERATIVE' | 'ENTERPRISE' | 'GOVERNMENT' | 'SYSTEM'
  address?: string;
  phone?: string;
  email?: string;

  userName: string;
  password: string;
  fullName: string;
  managerPhone?: string;
  managerEmail: string;
}

export interface CreateOrganizationResponse {
  success: boolean;
  status: number;
  data: {
    organizationID: string;
    organizationName: string;
    organizationCode: string;
    organizationType: OrganizationType;
    status: 'ACTIVE' | 'INACTIVE';
    createdAt: string;
  };
  timestamp: string;
}
export interface OrganizationSummary {
  organizationID: string;
  organizationName: string;
  organizationCode: string;
  organizationType: OrganizationType;
  status: 'ACTIVE' | 'INACTIVE';
  createdAt: string;
}