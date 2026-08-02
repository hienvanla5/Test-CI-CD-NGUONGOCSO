import { useEffect, useState } from 'react';
import { toast } from 'sonner';
import { v4 as uuidv4 } from 'uuid';
import {
  getOfflineEvents,
  removeOfflineEvent,
  clearOfflineQueue,
  getOfflineQueueCount,
  updateOfflineEventStatus,
} from '@/services/offlineQueue';
import { syncOfflineEvents } from '@/api/chainEventApi';
import type { OfflineSyncResultDto } from '@/types/offlineEvent';

export const useOfflineSync = () => {
  const [isOnline, setIsOnline] = useState(navigator.onLine);
  const [pendingCount, setPendingCount] = useState(getOfflineQueueCount());
  const [isSyncing, setIsSyncing] = useState(false);

  // Cập nhật trạng thái mạng
  useEffect(() => {
    const handleOnline = () => setIsOnline(true);
    const handleOffline = () => setIsOnline(false);
    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);
    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  // Cập nhật số lượng pending mỗi 3 giây (vì storage event không trigger cùng tab)
  useEffect(() => {
    const interval = setInterval(() => {
      setPendingCount(getOfflineQueueCount());
    }, 3000);
    return () => clearInterval(interval);
  }, []);

  // Hàm thực hiện đồng bộ
  const sync = async (): Promise<void> => {
    const events = getOfflineEvents();
    // Chỉ lấy những event có status !== 'success' (trường hợp có thể vẫn còn)
    const pendingEvents = events.filter(e => e.status !== 'success');
    if (pendingEvents.length === 0) {
      // Nếu không còn event nào, xóa toàn bộ queue (đảm bảo sạch)
      clearOfflineQueue();
      setPendingCount(0);
      return;
    }

    // Đánh dấu tất cả là đang sync
    pendingEvents.forEach(e => updateOfflineEventStatus(e.offlineEventId, { status: 'syncing' }));

    setIsSyncing(true);
    try {
      const syncId = uuidv4();
      const payload = {
        syncId,
        events: pendingEvents,
      };

      const response = await syncOfflineEvents(payload);

      // Xử lý kết quả từ server
      const results = response.results || [];
      const successIds: string[] = [];
      const failedIds: string[] = [];

      results.forEach((r: OfflineSyncResultDto) => {
        if (r.status === 'SUCCESS') {
          successIds.push(r.offlineEventId);
          // Cập nhật status thành success
          updateOfflineEventStatus(r.offlineEventId, { status: 'success' });
        } else if (r.status === 'DUPLICATE') {
          successIds.push(r.offlineEventId); // coi như thành công
          updateOfflineEventStatus(r.offlineEventId, { status: 'success' });
        } else if (r.status === 'FAILED') {
          failedIds.push(r.offlineEventId);
          updateOfflineEventStatus(r.offlineEventId, {
            status: 'failed',
            errorMessage: r.message || 'Lỗi không xác định',
            retryCount: (events.find(e => e.offlineEventId === r.offlineEventId)?.retryCount || 0) + 1,
          });
        }
      });

      // Xóa những event đã success (giải phóng bộ nhớ)
      successIds.forEach((id) => {
        // Có thể giữ lại để xem lịch sử nhưng để đơn giản ta xóa
        // removeOfflineEvent(id);
        // Hoặc có thể xóa luôn, vì đã đánh dấu success
        // removeOfflineEvent(id);
        // Tuy nhiên nếu muốn hiển thị lịch sử, giữ lại với status success
        // Hiện tại ta sẽ xóa để queue gọn
        removeOfflineEvent(id);
      });

      // Thông báo kết quả
      if (response.successCount > 0) {
        toast.success(`Đồng bộ thành công ${response.successCount} sự kiện.`);
      }
      if (response.duplicateCount > 0) {
        toast.info(`Bỏ qua ${response.duplicateCount} sự kiện đã tồn tại.`);
      }
      if (response.failedCount > 0) {
        toast.error(`Có ${response.failedCount} sự kiện đồng bộ thất bại.`);
        // Log chi tiết
        results.filter((r: OfflineSyncResultDto) => r.status === 'FAILED').forEach((f: OfflineSyncResultDto) => {
          console.warn(`Sync failed for event ${f.offlineEventId}: ${f.message}`);
        });
      }

      // Cập nhật lại số lượng pending (số event còn lại có status !== 'success')
      const remaining = getOfflineEvents().filter(e => e.status !== 'success');
      setPendingCount(remaining.length);
    } catch (error: any) {
      // Nếu có lỗi chung khi gọi API, đánh dấu tất cả event là failed
      pendingEvents.forEach(e => {
        updateOfflineEventStatus(e.offlineEventId, {
          status: 'failed',
          errorMessage: error.message || 'Lỗi kết nối server',
        });
      });
      const msg = error.response?.data?.message || 'Đồng bộ thất bại. Vui lòng thử lại sau.';
      toast.error(msg);
    } finally {
      setIsSyncing(false);
    }
  };

  // Tự động đồng bộ khi mạng online và có sự kiện chờ (chỉ những event có status !== 'success')
  useEffect(() => {
    if (isOnline) {
      const pending = getOfflineEvents().filter(e => e.status !== 'success');
      if (pending.length > 0 && !isSyncing) {
        console.log("🔄 Tự động đồng bộ...");
        sync();
      }
    }
  }, [isOnline, isSyncing]);

  // Mỗi khi pendingCount thay đổi (có thể do ngoài luồng), kiểm tra
  useEffect(() => {
    if (isOnline && pendingCount > 0 && !isSyncing) {
      sync();
    }
  }, [pendingCount]);

  return { isOnline, pendingCount, isSyncing, sync };
};