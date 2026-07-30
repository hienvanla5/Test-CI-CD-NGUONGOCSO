
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
  farmAreaId: string | null;
  farmAreaName: string | null;
  productCategoryId: string;
  productCategoryName: string | null;
  name: string;
  expectedQuantity: number;
  expectedQuantityUnit: string;
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
  expectedQuantityUnit: string;
  plantingDate: string;
}

export interface UpdateProductionLotResponse {
  id: string;
  farmAreaId: string | null;
  productCategoryId: string;
  name: string;
  expectedQuantity: number;
  expectedQuantityUnit: string;
  plantingDate: string;
  status: string;
  updatedAt: string;
}

export interface CreateProductionLotRequest {
  name: string;
  farmAreaId: string | null;
  productCategoryId: string;
  expectedQuantity: number;
  expectedQuantityUnit: string;
  plantingDate: string | null;
}

export interface CreateProductionLotResponse {
  id: string;
  farmAreaId: string | null;
  productCategoryId: string;
  organizationName: string;
  farmAreaName: string | null;
  productCategoryName: string;
  name: string;
  expectedQuantity: number;
  expectedQuantityUnit: string;
  actualQuantity: number | null;
  plantingDate: string | null;
  harvestDate: string | null;
  status: 'DRAFT';
  approvalNotes: string | null;
  createdByName: string;
  approvedByName: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface FarmAreaOption {
  id: string;
  name: string;
  area?: number;
}

export interface ProductCategoryOption {
  id: string;
  name: string;
}