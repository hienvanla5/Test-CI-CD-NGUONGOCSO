export interface TraceCode {
  id: string;
  codeValue: string;
  qrImage: string; // đường dẫn tương đối
  status: 'INACTIVE' | 'ACTIVE' | 'RECALLED';
}

export interface Shipment {
  id: string;
  productionLotId: string;
  productionLotName: string;
  name: string;
  totalQuantity: number;
  packagingInfo?: string;
  status: 'DRAFT' | 'CODE_PRINTED' | 'ACTIVE' | 'RECALLED';
  traceCodes: TraceCode[];
  createdByName: string;
  createdAt: string;
}

export interface CreateShipmentPayload {
  productionLotId: string;
  name: string;
  totalQuantity: number;
  packagingInfo?: string;
}

export interface ShipmentResponse {
  success: boolean;
  status: number;
  data: Shipment;
  timestamp: string;
}