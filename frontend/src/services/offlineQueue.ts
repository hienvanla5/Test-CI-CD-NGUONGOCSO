import { v4 as uuidv4 } from 'uuid';
import type { OfflineEvent } from '@/types/offlineEvent';

const STORAGE_KEY = 'offline_events_queue';

export const getOfflineEvents = (): OfflineEvent[] => {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
};

export const addOfflineEvent = (eventData: Omit<OfflineEvent, 'offlineEventId'>): void => {
  console.log("➕ addOfflineEvent called with:", eventData);
  try {
    const queue = getOfflineEvents();
    const newEvent: OfflineEvent = {
      offlineEventId: uuidv4(),
      ...eventData,
      status: 'pending',
      retryCount: 0,
    };
    queue.push(newEvent);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(queue));
  } catch (error) {
    console.error("❌ Failed to save offline event:", error);
    throw error;
  }
};

export const removeOfflineEvent = (offlineEventId: string): void => {
  const queue = getOfflineEvents();
  const filtered = queue.filter((e) => e.offlineEventId !== offlineEventId);
  localStorage.setItem(STORAGE_KEY, JSON.stringify(filtered));
};

export const clearOfflineQueue = (): void => {
  localStorage.removeItem(STORAGE_KEY);
};

export const getOfflineQueueCount = (): number => {
  return getOfflineEvents().length;
};

/**
 * Cập nhật trạng thái và lỗi cho một event
 */
export const updateOfflineEventStatus = (
  offlineEventId: string,
  updates: Partial<Pick<OfflineEvent, 'status' | 'errorMessage' | 'retryCount'>>
): void => {
  const queue = getOfflineEvents();
  const event = queue.find((e) => e.offlineEventId === offlineEventId);
  if (!event) return;
  Object.assign(event, updates);
  localStorage.setItem(STORAGE_KEY, JSON.stringify(queue));
};