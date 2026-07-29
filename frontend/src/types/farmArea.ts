export interface CropType {
  id: string;
  name: string;
  // có thể có thêm fields
}

export interface FarmArea {
  id: string;
  name: string;
  organizationId: string;
  organizationName: string;
  cropTypeId: string;
  cropTypeName: string;
  latitude: number;
  longitude: number;
  area: number; // ha
  createdAt: string;
  updatedAt: string;
}

export interface CreateFarmAreaRequest {
  name: string;
  cropType: string; // UUID
  latitude: number;
  longitude: number;
  area: number;
}

export interface CreateFarmAreaResponse {
  success: boolean;
  status: number;
  data: FarmArea;
  timestamp: string;
}