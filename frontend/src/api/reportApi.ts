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

// --- Types cho Export Report ---
export interface ExportReportResponse {
  fileUrl: string;
  format: string;
  exportedAt: string;
  auditLogId: string;
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
 * Xuất báo cáo tổng hợp ngành dạng PDF
 * GET /api/v1/reports/industry-summary/export
 * 
 * @param params.region - Địa bàn cần xuất báo cáo (bắt buộc)
 * @param params.fromDate - Ngày bắt đầu (yyyy-MM-dd)
 * @param params.toDate - Ngày kết thúc (yyyy-MM-dd)
 * @param params.format - Định dạng xuất (PDF | EXCEL), mặc định PDF
 * @returns ExportReportResponse chứa fileUrl và thông tin xuất
 */
export const exportIndustryReport = async (params: {
  region: string;
  fromDate: string;
  toDate: string;
  format?: 'PDF' | 'EXCEL';
}): Promise<ExportReportResponse> => {
  const response = await apiClient.get<{ success: boolean; data: ExportReportResponse }>(
    '/reports/industry-summary/export',
    { params }
  );
  return response.data.data;
};
export const getIndustrySummary = async (
  params: IndustryReportParams
): Promise<IndustryReportResponse> => {
  const response = await apiClient.get<{ success: boolean; data: IndustryReportResponse }>(
    '/reports/industry-summary',
    { params }
  );
  return response.data.data;
};
export const exportIndustrySummary = async (
  params: IndustryReportParams & { format?: 'PDF' | 'EXCEL' }
): Promise<IndustryReportExportResponse> => {
  const response = await apiClient.get<{ success: boolean; data: IndustryReportExportResponse }>(
    '/reports/industry-summary/export',
    { params }
  );
  return response.data.data;
};