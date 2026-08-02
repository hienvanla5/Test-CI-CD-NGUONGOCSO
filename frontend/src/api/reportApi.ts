import apiClient from './axiosConfig';
import type {
  IndustryReportResponse,
  IndustryReportExportResponse,
  IndustryReportParams,
} from '@/types/report';

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

// --- API cho Dashboard ---

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

// --- API cho Export Report (NCL-07-CN-003) ---

/**
 * Ghi chú: backend hiện trả DTO trực tiếp ở top-level (không bọc trong
 * { success, data } như tài liệu mô tả). Hàm này chấp nhận cả 2 dạng để
 * không vỡ khi backend sửa lại đúng theo tài liệu.
 */
function unwrapReportResponse<T>(payload: T | { success: boolean; data: T }): T {
  if (payload && typeof payload === 'object' && 'data' in (payload as any)) {
    return (payload as { data: T }).data;
  }
  return payload as T;
}

export const getIndustrySummary = async (
  params: IndustryReportParams
): Promise<IndustryReportResponse> => {
  const response = await apiClient.get<
    IndustryReportResponse | { success: boolean; data: IndustryReportResponse }
  >('/reports/industry-summary', { params });
  return unwrapReportResponse(response.data);
};
export const exportIndustrySummary = async (
  params: IndustryReportParams & { format?: 'PDF' | 'EXCEL' }
): Promise<IndustryReportExportResponse> => {
  const response = await apiClient.get<
    IndustryReportExportResponse | { success: boolean; data: IndustryReportExportResponse }
  >('/reports/industry-summary/export', { params });
  return unwrapReportResponse(response.data);
};