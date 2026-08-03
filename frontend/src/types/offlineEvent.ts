import { ChainEventType } from '@/enums/chainEventType';

export interface OfflineEvent {
  offlineEventId: string;
  productionLotId?: string;
  eventType: ChainEventType;
  recordedAt: string;
  latitude: number;
  longitude: number;
  images: string[];
  deviceSource?: string;
  eventData: Record<string, any>;
  status?: 'pending' | 'syncing' | 'failed' | 'success' | 'invalid';
  errorMessage?: string;
  retryCount?: number;
  lastSyncAttempt?: number;
}

export interface OfflineSyncRequest {
  syncId: string;
  events: OfflineEvent[];
}

export interface OfflineSyncResultDto {
  offlineEventId: string;
  status: 'SUCCESS' | 'DUPLICATE' | 'FAILED';
  eventId?: string;
  message?: string;
}

export interface OfflineSyncResponse {
  syncId: string;
  totalEvents: number;
  successCount: number;
  duplicateCount: number;
  failedCount: number;
  results: OfflineSyncResultDto[];
}