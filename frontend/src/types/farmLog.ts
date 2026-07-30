import type { Attachment } from "./attachment";

export type FarmActivityType =
  | 'PLANTING'
  | 'WATERING'
  | 'FERTILIZING'
  | 'PESTICIDE'
  | 'WEEDING'
  | 'HARVESTING'
  | 'OTHER';

export interface FarmLog {
  id: string;
  productionLotId: string;
  productionLotName: string;
  activityType: FarmActivityType;
  material: string | null;
  quantity: number | null;
  unit: string | null;
  executedDate: string;
  notes: string | null;
  createdByName: string;
  createdAt: string;
  attachmentCount?: number;
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

export interface FarmLogQueryParams {
  productionLotId: string;
  page?: number;
  size?: number;
}

// Dữ liệu gửi lên khi tạo mới một nhật ký canh tác
export interface CreateFarmLogRequest {
  productionLotId: string;
  activityType: FarmActivityType;
  material: string | null;
  quantity: number | null;
  unit: string | null;
  executedDate: string; // YYYY-MM-DD
  notes: string | null;
}

// Dữ liệu trả về từ backend sau khi tạo nhật ký thành công
export type FarmLogResponse = FarmLog;