export interface CropType {
  id: string;
  name: string;
  // có thể có thêm fields
}

// Danh mục đơn vị diện tích - phải khớp với enum AreaUnit ở backend
export type AreaUnit = 'HA' | 'KM2';

export const AREA_UNIT_LABELS: Record<AreaUnit, string> = {
  HA: 'ha',
  KM2: 'km²',
};

export interface FarmArea {
  id: string;
  name: string;
  organizationId: string;
  organizationName: string;
  cropTypeId: string;
  cropTypeName: string;
  latitude: number;
  longitude: number;
  area: number; // luôn là ha, đã được backend quy đổi
  areaUnit: AreaUnit; // đơn vị người dùng đã nhập khi tạo
  createdAt: string;
  updatedAt: string;
}

export interface CreateFarmAreaRequest {
  name: string;
  cropType: string; // UUID
  latitude: number;
  longitude: number;
  area: number;
  areaUnit: AreaUnit;
}

export interface CreateFarmAreaResponse {
  success: boolean;
  status: number;
  data: FarmArea;
  timestamp: string;
}