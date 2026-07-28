export interface LoginRequest {
  username: string;
  password: string;
  organization?: string;
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
  organizationCode: string;
}

export interface AuthState {
  user: UserInfo | null;
  token: string | null;
  isAuthenticated: boolean;
  isLoading: boolean;
}