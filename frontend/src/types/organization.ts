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

export interface Organization {
  id: string;
  name: string;
  code: string;
  type: 'COOPERATIVE' | 'BUSINESS' | 'GOVERNMENT' | 'SYSTEM';
  status: 'ACTIVE' | 'INACTIVE';
  createdAt: string;
  updatedAt?: string;
}

export interface OrganizationUser {
  id: string;
  organizationId: string;
  userId: string;
  username: string;
  fullName: string;
  email: string;
  phone: string;
  roleId: number;
  roleCode: string;
  roleName: string;
  customPermissions: string | null;
  status: "ACTIVE" | "INACTIVE";
  joinedAt: string;
}

export interface OrganizationDetailResponse {
  profile: OrganizationProfile;
  members: OrganizationUser[];
}