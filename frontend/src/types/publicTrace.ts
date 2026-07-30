export interface PublicChainEventItem {
  eventType: string;
  eventData: Record<string, any>;
  recordedAt: string; // ISO datetime
}

export interface PublicTraceResponse {
  codeValue: string;
  productName: string;
  shipmentCode: string;
  shipmentStatus: string;
  recalled: boolean;
  recallMessage: string | null;
  events: PublicChainEventItem[];
}

export interface ApiError {
  success: false;
  status: number;
  message: string;
  path?: string;
  timestamp?: string;
}