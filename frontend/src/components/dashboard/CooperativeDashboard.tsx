import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'sonner';
import { ProductionLotList } from '@/components/production-lot/ProductionLotList';
import { getProductionLots } from '@/api/productionLotApi';
import type { ProductionLot } from '@/types/farm';
import { useAuth } from '@/hooks/useAuth';

export function CooperativeDashboard() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [lots, setLots] = useState<ProductionLot[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const loadLots = async () => {
    setIsLoading(true);
    try {
      const data = await getProductionLots();
      setLots(data);
    } catch {
      toast.error('Không thể tải danh sách lô sản xuất');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    void loadLots();
  }, []);

  const handleCreate = () => navigate('/production-lots/create');
  const handleEdit = (id: string) => navigate(`/production-lots/${id}/edit`);

  return (
    <div className="space-y-6">
      <ProductionLotList
        lots={lots}
        isLoading={isLoading}
        canCreate={user?.roleCode === 'VT-02'}
        canEdit={user?.roleCode === 'VT-02' || user?.roleCode === 'VT-03'}
        onCreate={handleCreate}
        onEdit={handleEdit}
      />
    </div>
  );
}