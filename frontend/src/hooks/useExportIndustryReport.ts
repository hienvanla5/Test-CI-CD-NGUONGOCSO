// src/hooks/useExportIndustryReport.ts
import { useState } from 'react';
import { toast } from 'sonner';
import { getIndustrySummary, exportIndustrySummary } from '@/api/reportApi';
import type { IndustryReportResponse, IndustryReportParams } from '@/types/report';

const ASSET_BASE_URL = import.meta.env.VITE_ASSET_BASE_URL || 'http://localhost:8080';

const resolveFileUrl = (fileUrl: string) =>
  fileUrl.startsWith('http') ? fileUrl : `${ASSET_BASE_URL}${fileUrl}`;

interface UseExportIndustryReportResult {
  report: IndustryReportResponse | null;
  isLoading: boolean;
  isExporting: boolean;
  error: string | null;
  fetchReport: (params: IndustryReportParams) => Promise<void>;
  exportReport: (params: IndustryReportParams, format?: 'PDF' | 'EXCEL') => Promise<void>;
  reset: () => void;
}

export const useExportIndustryReport = (): UseExportIndustryReportResult => {
  const [report, setReport] = useState<IndustryReportResponse | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isExporting, setIsExporting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchReport = async (params: IndustryReportParams) => {
    setIsLoading(true);
    setError(null);
    setReport(null);
    try {
      const data = await getIndustrySummary(params);
      setReport(data);
      if (!data.hasData) {
        toast.info(data.message || 'Chưa có dữ liệu cho địa bàn và khoảng thời gian đã chọn.');
      }
    } catch (err: any) {
      const message =
        err.response?.data?.message ||
        (err.response ? 'Không thể tải báo cáo.' : 'Không thể kết nối đến máy chủ.');
      setError(message);
      toast.error(message);
    } finally {
      setIsLoading(false);
    }
  };

  const exportReport = async (params: IndustryReportParams, format: 'PDF' | 'EXCEL' = 'PDF') => {
    setIsExporting(true);
    try {
      const result = await exportIndustrySummary({ ...params, format });
      window.open(resolveFileUrl(result.fileUrl), '_blank');
      toast.success(`Xuất báo cáo ${format} thành công.`);
    } catch (err: any) {
      const message =
        err.response?.data?.message ||
        (err.response ? 'Không thể xuất báo cáo.' : 'Không thể kết nối đến máy chủ.');
      toast.error(message);
    } finally {
      setIsExporting(false);
    }
  };

  const reset = () => {
    setReport(null);
    setError(null);
  };

  return { report, isLoading, isExporting, error, fetchReport, exportReport, reset };
};