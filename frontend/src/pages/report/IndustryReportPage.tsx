import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { AlertCircle, FileText, RefreshCw } from 'lucide-react';
import { toast } from 'sonner';
import { getIndustrySummary, exportIndustryReport } from '@/api/reportApi';
import { IndustryReportFilter } from '@/components/report/IndustryReportFilter';
import { IndustryReportSummary } from '@/components/report/IndustryReportSummary';
import { ProductBreakdownTable } from '@/components/report/ProductBreakdownTable';
import type { IndustryReportResponse } from '@/types/report';

export default function IndustryReportPage() {
  const [report, setReport] = useState<IndustryReportResponse | null>(null);
  const [loading, setLoading] = useState(false);
  const [exporting, setExporting] = useState(false);
  const [lastParams, setLastParams] = useState<{ region: string; fromDate: string; toDate: string } | null>(null);

  const fetchReport = async (region: string, fromDate: string, toDate: string) => {
    try {
      setLoading(true);
      const data = await getIndustrySummary(region, fromDate, toDate);
      setReport(data);
      setLastParams({ region, fromDate, toDate });
    } catch (error: any) {
      const msg = error.response?.data?.message || 'Không thể tải báo cáo';
      toast.error(msg);
    } finally {
      setLoading(false);
    }
  };

  const handleExport = async () => {
    if (!lastParams) return;
    try {
      setExporting(true);
      const blob = await exportIndustryReport(lastParams.region, lastParams.fromDate, lastParams.toDate);
      // Tạo link tải file
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `industry-summary-${lastParams.region}-${lastParams.fromDate}-${lastParams.toDate}.pdf`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
      toast.success('Xuất báo cáo thành công');
    } catch (error: any) {
      toast.error('Không thể xuất báo cáo');
    } finally {
      setExporting(false);
    }
  };

  const handleReset = () => {
    setReport(null);
    setLastParams(null);
  };

  return (
    <div className="container mx-auto py-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Báo cáo tổng hợp ngành</h1>
          <p className="text-sm text-muted-foreground">
            Tổng hợp sản lượng và lô hàng theo địa bàn và khoảng thời gian
          </p>
        </div>
        {report?.hasData && (
          <Button onClick={handleExport} disabled={exporting || loading}>
            <FileText className="h-4 w-4 mr-1" />
            {exporting ? 'Đang xuất...' : 'Xuất PDF'}
          </Button>
        )}
      </div>

      <IndustryReportFilter onSearch={fetchReport} onReset={handleReset} loading={loading} />

      {loading ? (
        <div className="flex justify-center py-12">
          <RefreshCw className="h-8 w-8 animate-spin text-emerald-600" />
        </div>
      ) : report ? (
        <>
          {!report.hasData ? (
            <div className="bg-amber-50 border border-amber-200 rounded-lg p-6 text-center text-amber-800 flex items-center justify-center gap-3">
              <AlertCircle className="h-6 w-6" />
              <span>{report.message || 'Không có dữ liệu cho địa bàn và khoảng thời gian đã chọn.'}</span>
            </div>
          ) : (
            <>
              <IndustryReportSummary
                totalOrganizations={report.totalOrganizations}
                totalShipments={report.totalShipments}
                totalQuantity={report.totalQuantity}
              />
              <ProductBreakdownTable data={report.productBreakdown} />
            </>
          )}
        </>
      ) : (
        <div className="text-center py-12 text-muted-foreground">
          <p>Nhập địa bàn và khoảng thời gian để xem báo cáo.</p>
        </div>
      )}
    </div>
  );
}