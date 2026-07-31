export interface LoginRequest {
  username: string;
  password: string;
  organizationCode?: string;
}

export interface LoginResponse {
  accessToken: string;
  tokenType: string;
  expiresIn: number;
  user: UserInfo;
}

export interface UserInfo {
  userId: string;
  username: string;
  fullName: string;
  roleCode: string;
  organizationId: string;
  organizationName: string;
  organizationCode: string;
  orgainzationType: OrganizationType;
}

export type OrganizationType = 'SYSTEM' | 'COOPERATIVE' | 'ENTERPRISE' | 'GOVERNMENT';

export interface AuthState {
  user: UserInfo | null;
  token: string | null;
  isAuthenticated: boolean;
  isLoading: boolean;
}

export interface ApiResult<T> {
  success: boolean;
  status: number;
  message?: string;
  data: T;
  errors?: unknown;
  path?: string;
  timestamp: string;
}