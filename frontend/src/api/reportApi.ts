import apiClient from './axiosConfig';

// --- Types ---
export interface DashboardStatistics {
  summary: {
    totalLots: number;
    totalExpectedYield: number;
    totalActualYield: number;
  };
  byStatus: Record<string, number>;
  timeSeries: Array<{
    period: string;
    lotCount: number;
    expectedYield: number;
    actualYield: number;
  }>;
}

export interface DashboardQueryParams {
  startDate?: string;      // yyyy-MM-dd
  endDate?: string;        // yyyy-MM-dd
  organizationId?: string; // UUID
  groupBy?: 'DAY' | 'WEEK' | 'MONTH' | 'YEAR';
}

// --- API ---

/**
 * Lấy dữ liệu bảng điều khiển sản lượng và số lô
 * GET /api/v1/production-lots/dashboard
 */
export const getDashboardStatistics = async (params: DashboardQueryParams = {}): Promise<DashboardStatistics> => {
  const response = await apiClient.get<{ success: boolean; data: DashboardStatistics }>(
    '/production-lots/dashboard',
    { params }
  );
  return response.data.data;
};

/**
 * TC-04 (NCL-07-CN-001): ghi lịch sử mỗi lần một bảng điều khiển/báo cáo được mở.
 * Endpoint: /reports/access-logs (giả định - cần xác nhận với backend)
 */
export const logDashboardAccess = async (dashboardKey: string): Promise<void> => {
  try {
    await apiClient.post('/reports/access-logs', { dashboardKey });
  } catch {
    // best-effort — im lặng bỏ qua lỗi ghi log
  }
};