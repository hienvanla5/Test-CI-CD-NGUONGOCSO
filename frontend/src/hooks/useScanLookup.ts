import { useState, useCallback } from 'react';
import { scanLookup } from '@/api/scan';
import type { ScanLookupResponse, ScanError, ScanErrorCode } from '@/types/scan';
import { addPendingScan, getPendingScans, removePendingScan } from '@/utils/offlineScanQueue';

interface UseScanLookupReturn {
  data: ScanLookupResponse | null;
  isLoading: boolean;
  error: ScanError | null;
  lookup: (code: string) => Promise<ScanLookupResponse | null>;
  reset: () => void;
  pendingScans: import('@/types/scan').PendingScan[];
  syncPending: () => Promise<void>;
}

export function useScanLookup(): UseScanLookupReturn {
  const [data, setData] = useState<ScanLookupResponse | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<ScanError | null>(null);
  const [pendingScans, setPendingScans] = useState<import('@/types/scan').PendingScan[]>(getPendingScans);

  const lookup = useCallback(async (code: string): Promise<ScanLookupResponse | null> => {
    setIsLoading(true);
    setError(null);
    setData(null);

    try {
      const result = await scanLookup(code);
      setData(result);
      return result;
    } catch (err: any) {
      const status = err.response?.status;
      const message = err.response?.data?.message || 'Đã xảy ra lỗi không xác định.';
      let codeError: ScanErrorCode = 'UNKNOWN';

      if (!err.response) {
        addPendingScan(code);
        setPendingScans(getPendingScans());
        codeError = 'NETWORK';
      } else if (status === 400) {
        codeError = 'INVALID_CODE';
      } else if (status === 403) {
        if (message.toLowerCase().includes('tổ chức') || message.toLowerCase().includes('organization')) {
          codeError = 'FORBIDDEN_ORG';
        } else {
          codeError = 'FORBIDDEN_ROLE';
        }
      } else if (status === 409) {
        codeError = 'RECALLED';
      }

      const scanError: ScanError = { code: codeError, message, status };
      setError(scanError);
      return null;
    } finally {
      setIsLoading(false);
    }
  }, []);

  const reset = useCallback(() => {
    setData(null);
    setError(null);
    setIsLoading(false);
  }, []);

  const syncPending = useCallback(async () => {
    const queue = getPendingScans();
    for (const item of queue) {
      try {
        await scanLookup(item.code);
        removePendingScan(item.id);
      } catch {
        // Giữ lại nếu vẫn lỗi
      }
    }
    setPendingScans(getPendingScans());
  }, []);

  return { data, isLoading, error, lookup, reset, pendingScans, syncPending };
}