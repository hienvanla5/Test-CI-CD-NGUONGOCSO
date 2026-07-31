import { useEffect, useState } from 'react';
import { toast } from 'sonner';

import { getProductionLots } from '@/api/productionLotApi';
import { logDashboardAccess } from '@/api/reportApi';
import { ProductionLotBoard } from '@/components/production-lot/ProductionLotBoard';
import { ProductionStatistics } from '@/components/dashboard/PoductionStatistics';
import type { ProductionLot } from '@/types/productionLot';

export function CooperativeDashboard() {
  const [productionLots, setProductionLots] = useState<ProductionLot[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const loadProductionLots = async () => {
      try {
        setIsLoading(true);

        const data = await getProductionLots();
        setProductionLots(data);
      } catch {
        toast.error('Không thể tải danh sách lô sản xuất');
      } finally {
        setIsLoading(false);
      }
    };

    void loadProductionLots();

    // TC-04 (NCL-07-CN-001): ghi nhận mỗi lần bảng điều khiển được mở.
    void logDashboardAccess('cooperative-dashboard');
  }, []);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-slate-900">
          Tổng quan hợp tác xã
        </h1>

        <p className="mt-1 text-sm text-slate-500">
          Theo dõi tình hình các lô sản xuất của hợp tác xã.
        </p>
      </div>

      {/* TC-01: có dữ liệu → thẻ số liệu + biểu đồ theo tháng.
          TC-02: rỗng → ProductionStatistics tự hiển thị trạng thái chưa có dữ liệu. */}
      <ProductionStatistics lots={productionLots} isLoading={isLoading} />

      {/* Bảng danh sách lô sản xuất */}
      <ProductionLotBoard />
    </div>
  );
}