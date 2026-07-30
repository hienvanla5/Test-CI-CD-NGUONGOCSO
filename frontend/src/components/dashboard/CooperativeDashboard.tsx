import { useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  CheckCircle2,
  Clock3,
  FileText,
  PackageOpen,
} from 'lucide-react';
import { toast } from 'sonner';

import { getProductionLots } from '@/api/productionLotApi';
import { ProductionLotList } from '@/components/production-lot/ProductionLotList';
import { Card, CardContent } from '@/components/ui/card';
import { useAuth } from '@/hooks/useAuth';
import type { ProductionLot } from '@/types/productionLot';

export function CooperativeDashboard() {
  const navigate = useNavigate();
  const { user } = useAuth();

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
  }, []);

  const statistics = useMemo(() => {
    return {
      total: productionLots.length,

      draft: productionLots.filter(
        (lot) => lot.status === 'DRAFT',
      ).length,

      pending: productionLots.filter(
        (lot) => lot.status === 'PENDING',
      ).length,

      approved: productionLots.filter(
        (lot) => lot.status === 'APPROVED',
      ).length,
    };
  }, [productionLots]);

  const cards = [
    {
      title: 'Tổng số lô sản xuất',
      value: statistics.total,
      icon: PackageOpen,
      iconClass: 'bg-emerald-100 text-emerald-700',
    },
    {
      title: 'Lô đang ở bản nháp',
      value: statistics.draft,
      icon: FileText,
      iconClass: 'bg-slate-100 text-slate-700',
    },
    {
      title: 'Lô đang chờ duyệt',
      value: statistics.pending,
      icon: Clock3,
      iconClass: 'bg-amber-100 text-amber-700',
    },
    {
      title: 'Lô đã được duyệt',
      value: statistics.approved,
      icon: CheckCircle2,
      iconClass: 'bg-blue-100 text-blue-700',
    },
  ];

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

      {/* Bốn thẻ thống kê */}
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {cards.map((card) => {
          const Icon = card.icon;

          return (
            <Card key={card.title}>
              <CardContent className="flex items-center justify-between p-5">
                <div>
                  <p className="text-sm text-slate-500">
                    {card.title}
                  </p>

                  <p className="mt-2 text-3xl font-bold text-slate-900">
                    {isLoading ? '...' : card.value}
                  </p>
                </div>

                <div className={`rounded-xl p-3 ${card.iconClass}`}>
                  <Icon className="size-6" />
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* Bảng danh sách lô sản xuất */}
      <ProductionLotList
        lots={productionLots}
        isLoading={isLoading}
        canCreate={user?.roleCode === 'VT-02'}
        canEdit={user?.roleCode === 'VT-02'}
        canRecordFarmLog={user?.roleCode === 'VT-03'}
        onCreate={() => navigate('/production-lots/create')}
        onEdit={(id) => navigate(`/production-lots/${id}/edit`)}
        onRecordFarmLog={(id) =>
          navigate(
            `/farm-logs/create?productionLotId=${encodeURIComponent(id)}`,
          )
        }
      />
    </div>
  );
}