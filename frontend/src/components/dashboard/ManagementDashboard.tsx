import { useEffect, useMemo, useState } from 'react';
import { toast } from 'sonner';
import { getProductionLots } from '@/api/productionLotApi';
import { ProductionLotBoard } from '@/components/production-lot/ProductionLotBoard';
import { Card, CardContent } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { PackageOpen, CheckCircle2, Sprout, PackageCheck } from 'lucide-react';
import type { ProductionLot } from '@/types/productionLot';
import { IndustryReportTab } from './IndustryReportTab';

export function ManagementDashboard() {
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
    const total = productionLots.length;
    const approved = productionLots.filter((lot) => lot.status === 'APPROVED').length;
    const harvested = productionLots.filter((lot) => lot.status === 'HARVESTED').length;
    const packaged = productionLots.filter((lot) => lot.status === 'PACKAGED').length;
    return { total, approved, harvested, packaged };
  }, [productionLots]);

  const cards = [
    { title: 'Tổng số lô', value: statistics.total, icon: PackageOpen, iconClass: 'bg-blue-100 text-blue-700' },
    { title: 'Lô đã duyệt', value: statistics.approved, icon: CheckCircle2, iconClass: 'bg-emerald-100 text-emerald-700' },
    { title: 'Lô đã thu hoạch', value: statistics.harvested, icon: Sprout, iconClass: 'bg-lime-100 text-lime-700' },
    { title: 'Lô đã đóng gói', value: statistics.packaged, icon: PackageCheck, iconClass: 'bg-amber-100 text-amber-700' },
  ];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-slate-900">
          Quản lý ngành – Báo cáo tổng hợp
        </h1>
        <p className="mt-1 text-sm text-slate-500">
          Thống kê tình hình sản xuất và truy xuất nguồn gốc.
        </p>
      </div>

      <Tabs defaultValue="overview" className="w-full">
        <TabsList>
          <TabsTrigger value="overview">Tổng quan</TabsTrigger>
          <TabsTrigger value="industry-report">Báo cáo theo địa bàn</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="mt-4 space-y-6">
          <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
            {cards.map((card) => {
              const Icon = card.icon;
              return (
                <Card key={card.title}>
                  <CardContent className="flex items-center justify-between p-5">
                    <div>
                      <p className="text-sm text-slate-500">{card.title}</p>
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

          <ProductionLotBoard
            canCreate={false}
            canEdit={false}
            canSubmitForApproval={false}
            canApprove={false}
            canRecordFarmLog={false}
          />
        </TabsContent>

        <TabsContent value="industry-report" className="mt-4">
          <IndustryReportTab />
        </TabsContent>
      </Tabs>
    </div>
  );
}