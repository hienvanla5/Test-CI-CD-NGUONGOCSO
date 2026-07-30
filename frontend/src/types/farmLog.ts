export type FarmActivityType =
  | 'PLANTING'
  | 'WATERING'
  | 'FERTILIZING'
  | 'PESTICIDE'
  | 'WEEDING'
  | 'HARVESTING'
  | 'OTHER';

export interface CreateFarmLogRequest {
  productionLotId: string;
  activityType: FarmActivityType;
  material: string | null;
  quantity: number | null;
  unit: string | null;
  executedDate: string;
  notes: string | null;
}

export interface FarmLogResponse {
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
}
