import { useEffect, useState } from 'react';
import { toast } from 'sonner';

import { getProductionLotDashboard, type DashboardResponse } from '@/api/productionLotApi';
import { ProductionLotBoard } from '@/components/production-lot/ProductionLotBoard';
import { ProductionStatistics } from '@/components/dashboard/PoductionStatistics'

export function CooperativeDashboard() {
  const [data, setData] = useState<DashboardResponse | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const loadDashboard = async () => {
      try {
        setIsLoading(true);
        const result = await getProductionLotDashboard();
        setData(result);
      } catch (error: any) {
        if (error.response?.status === 403) {
          toast.error('Bạn không có quyền truy cập dữ liệu này.');
        } else {
          toast.error('Không thể tải bảng điều khiển');
        }
        setData(null);
      } finally {
        setIsLoading(false);
      }
    };

    void loadDashboard();
  }, []);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-slate-900">Tổng quan hợp tác xã</h1>
        <p className="mt-1 text-sm text-slate-500">
          Theo dõi tình hình các lô sản xuất của hợp tác xã.
        </p>
      </div>

      <ProductionStatistics data={data} isLoading={isLoading} />
      <ProductionLotBoard />
    </div>
  );
}