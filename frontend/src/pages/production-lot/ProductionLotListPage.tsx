import { getProductionLots } from '@/api/productionLotApi';
import { ProductionLotList } from '@/components/production-lot/ProductionLotList';
import { useAuth } from '@/hooks/useAuth';
import type { ProductionLot } from '@/types/farm';
import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'sonner';

const ProductionLotListPage = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [lots, setLots] = useState<ProductionLot[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const loadLots = async () => {
      try {
        setIsLoading(true);
        setLots(await getProductionLots());
      } catch {
        toast.error('Không thể tải danh sách lô sản xuất');
      } finally {
        setIsLoading(false);
      }
    };

    void loadLots();
  }, []);

  return (
    <main className="min-h-screen bg-slate-50 px-4 py-8 text-slate-900 md:px-8">
      <div className="mx-auto max-w-7xl space-y-6">
        <header>
          <p className="mb-2 text-xs font-semibold uppercase tracking-[0.18em] text-emerald-700">
            Quản lý sản xuất
          </p>
          <h1 className="text-2xl font-bold tracking-tight md:text-3xl">
            Lô sản xuất
          </h1>
          <p className="mt-2 text-sm text-slate-500">
            Quản lý các lô sản xuất thuộc phạm vi tổ chức của bạn.
          </p>
        </header>

        <ProductionLotList
          lots={lots}
          isLoading={isLoading}
          canCreate={user?.roleCode === 'VT-02'}
          canEdit={user?.roleCode === 'VT-02' || user?.roleCode === 'VT-03'}
          onCreate={() => navigate('/production-lots/create')}
          onEdit={(id) => navigate(`/production-lots/${id}/edit`)}
        />
      </div>
    </main>
  );
};

export default ProductionLotListPage;