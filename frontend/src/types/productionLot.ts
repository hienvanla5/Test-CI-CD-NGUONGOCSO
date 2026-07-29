export interface CreateProductionLotRequest {
  name: string;
  farmAreaId: string | null;
  productCategoryId: string;
  expectedQuantity: number;
  plantingDate: string | null;
}

export interface CreateProductionLotResponse {
  id: string;
  organizationName: string;
  farmAreaName: string | null;
  productCategoryName: string;
  name: string;
  expectedQuantity: number;
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
