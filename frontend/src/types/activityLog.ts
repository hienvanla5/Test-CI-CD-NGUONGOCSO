export interface ActivityLog {
  id: string;
  userId: string;
  username: string;
  fullName: string;
  action: string;
  description: string;
  entityType: string;
  entityId: string;
  ipAddress: string;
  createdAt: string;
}

export interface ActivityLogParams {
  page?: number;
  size?: number;
  action?: string;
  actorName?: string;
  startDate?: string;
  endDate?: string;
}

export interface PageResponse<T> {
  items: T[];
  page: number;
  size: number;
  totalElements: number;
  totalPages: number;
  first: boolean;
  last: boolean;
}