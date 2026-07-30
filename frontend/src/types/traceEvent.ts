export interface HarvestEventPayload {
  productionLotId: string;
  harvestDate: string; // YYYY-MM-DD
  quantity: number;
}

export interface HarvestEventResponse {
  success: boolean;
  status: number;
  data: {
    id: string;
    productionLotId: string;
    productionLotName: string;
    eventType: string;
    harvestDate: string;
    quantity: number;
    recordedByName: string;
    recordedAt: string;
  };
  timestamp: string;
}