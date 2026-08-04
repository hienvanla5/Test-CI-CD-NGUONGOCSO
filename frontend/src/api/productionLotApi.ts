import apiClient from './axiosConfig';
import type {
  ApproveProductionLotRequest,
  ApproveProductionLotResult,
  CreateProductionLotRequest,
  CreateProductionLotResponse,
  FarmAreaOption,
  ProductCategoryOption,
  ProductionLot,
  UpdateProductionLotRequest,
  UpdateProductionLotResponse,
} from '@/types/productionLot';
import type { ProductionLotImportResultResponse, ProductionLotImportHistory } from '@/types/productionLotImport';

interface ApiDataResponse<T> {
  data: T;
}

export const getFarmAreaOptions = async (): Promise<FarmAreaOption[]> => {
  const response = await apiClient.get<ApiDataResponse<FarmAreaOption[]>>(
    '/farm-areas',
  );

  return response.data.data;
};

export const getProductCategoryOptions = async (): Promise<
  ProductCategoryOption[]
> => {
  const response = await apiClient.get<
    ApiDataResponse<ProductCategoryOption[]>
  >('/product-categories');

  return response.data.data;
};

export const createProductionLot = async (
  payload: CreateProductionLotRequest,
): Promise<CreateProductionLotResponse> => {
  const response = await apiClient.post<
    ApiDataResponse<CreateProductionLotResponse>
  >('/production-lots', payload);

  return response.data.data;
};

export const getProductionLots = async (
  status?: ProductionLot['status'],
): Promise<ProductionLot[]> => {
  const response = await apiClient.get<
    ApiDataResponse<ProductionLot[]>
  >('/production-lots', {
    params: status ? { status } : undefined,
  });

  return response.data.data;
};

export const getProductionLotById = async (
  id: string,
): Promise<ProductionLot> => {
  const response = await apiClient.get<ApiDataResponse<ProductionLot>>(
    `/production-lots/${id}`,
  );

  return response.data.data;
};

export const updateProductionLot = async (
  id: string,
  data: UpdateProductionLotRequest,
): Promise<UpdateProductionLotResponse> => {
  const response = await apiClient.put<
    ApiDataResponse<UpdateProductionLotResponse>
  >(`/production-lots/${id}`, data);

  return response.data.data;
};
export const submitProductionLot = async (id: string): Promise<ProductionLot> => {
  const response = await apiClient.post<ApiDataResponse<ProductionLot>>(
    `/production-lots/${id}/submit`,
  );

  return response.data.data;
};

export const approveProductionLot = async (
  id: string,
  payload: ApproveProductionLotRequest,
): Promise<ApproveProductionLotResult> => {
  const response = await apiClient.post<
    ApiDataResponse<ApproveProductionLotResult>
  >(`/production-lots/${id}/approve`, payload);

  return response.data.data;
};
export interface DashboardSummary {
  totalLots: number;
  totalExpectedYield: number;
  totalActualYield: number;
}

export type DashboardStatusCount = Record<string, number>;

export interface DashboardTimeSeriesItem {
  period: string; // "YYYY-MM"
  lotCount: number;
  expectedYield: number;
  actualYield: number;
}

export interface DashboardResponse {
  summary: DashboardSummary;
  byStatus: DashboardStatusCount;
  timeSeries: DashboardTimeSeriesItem[];
}

export const getProductionLotDashboard = async (params?: {
  startDate?: string;
  endDate?: string;
  organizationId?: string;
  groupBy?: 'DAY' | 'WEEK' | 'MONTH' | 'YEAR';
}): Promise<DashboardResponse> => {
  const response = await apiClient.get<{ data: DashboardResponse }>('/production-lots/dashboard', { params });
  return response.data.data;
};

// ===== Import Production Lots (NCL-10-CN-006) =====

/**
 * Nhập dữ liệu lô sản xuất từ tệp CSV
 * POST /api/v1/production-lots/import
 * Content-Type: multipart/form-data
 * @param file - Tệp CSV
 * @param organizationId - (Tùy chọn) Chỉ dành cho VT-01 nhập hộ tổ chức khác
 */
export const importProductionLots = async (
  file: File,
  organizationId?: string
): Promise<ProductionLotImportResultResponse> => {
  const formData = new FormData();
  formData.append('file', file);
  if (organizationId) {
    formData.append('organizationId', organizationId);
  }

  const response = await apiClient.post<{ data: ProductionLotImportResultResponse }>(
    '/production-lots/import',
    formData,
    {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    }
  );
  return response.data.data;
};

/**
 * Lấy lịch sử nhập dữ liệu
 * GET /api/v1/production-lots/import-history
 */
export const getImportHistory = async (): Promise<ProductionLotImportHistory[]> => {
  const response = await apiClient.get<{ data: ProductionLotImportHistory[] }>(
    '/production-lots/import-history'
  );
  return response.data.data;
};

/**
 * Tải mẫu tệp CSV nhập lô sản xuất
 * GET /api/v1/production-lots/import-template
 * Trả về tệp CSV với encoding UTF-8
 */
export const downloadImportTemplate = async (): Promise<void> => {
  const response = await apiClient.get('/production-lots/import-template', {
    responseType: 'blob',
  });

  // Tạo Blob với charset UTF-8 để giữ nguyên tiếng Việt
  const blob = new Blob([response.data], { type: 'text/csv; charset=UTF-8' });
  const url = window.URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = 'mau_nhap_lo_san_xuat.csv';
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  window.URL.revokeObjectURL(url);
};
