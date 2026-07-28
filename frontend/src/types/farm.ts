export interface FarmArea {
  id: string;
  name: string;
  organizationId: string;
  organizationName: string;
  cropTypeId: string;
  cropTypeName: string;
  latitude: number | null;
  longitude: number | null;
  area: number;
  createdAt: string;
  updatedAt: string;
}

export interface ProductCategory {
  id: string;
  name: string;
  group?: string;
  description?: string;
  isActive: boolean;
}

export interface ProductionLot {
  id: string;
  organizationName: string;
  farmAreaName: string;
  name: string;
  expectedQuantity: number;
  actualQuantity: number | null;
  plantingDate: string;
  harvestDate: string | null;
  status: 'DRAFT' | 'PENDING' | 'APPROVED' | 'REJECTED' | 'HARVESTED' | 'PACKAGED' | 'CLOSED';
  approvalNotes: string | null;
  createdByName: string | null;
  approvedByName: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface UpdateProductionLotRequest {
  name: string;
  farmAreaId?: string | null;
  productCategoryId: string;
  expectedQuantity: number;
  plantingDate: string;
}

export interface UpdateProductionLotResponse {
  id: string;
  farmAreaId: string | null;
  productCategoryId: string;
  name: string;
  expectedQuantity: number;
  plantingDate: string;
  status: string;
  updatedAt: string;
}