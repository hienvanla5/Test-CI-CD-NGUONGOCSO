import { getProductionLots, submitProductionLot } from '@/api/productionLotApi';
import { ProductionLotList } from '@/components/production-lot/ProductionLotList';
import { useAuth } from '@/hooks/useAuth';
import type { ProductionLot } from '@/types/productionLot';
import { useCallback, useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'sonner';

export const ProductionLotBoard = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [lots, setLots] = useState<ProductionLot[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const loadLots = useCallback(async () => {
    try {
      setIsLoading(true);
      setLots(await getProductionLots());
    } catch {
      toast.error('Không thể tải danh sách lô sản xuất');
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    void loadLots();
  }, [loadLots]);

  const handleSubmitForApproval = async (id: string) => {
    try {
      await submitProductionLot(id);
      toast.success('Đã gửi yêu cầu duyệt lô!');
      await loadLots(); // reload để cập nhật trạng thái
    } catch (error: any) {
      const message = error.response?.data?.message || 'Không thể gửi duyệt lô.';
      toast.error(message);
    }
  };

  const canSubmitForApproval = user?.roleCode === 'VT-01' || user?.roleCode === 'VT-02';

  return (
    <ProductionLotList
      lots={lots}
      isLoading={isLoading}
      canCreate={user?.roleCode === 'VT-02'}
      canEdit={user?.roleCode === 'VT-02'}
      canSubmitForApproval={canSubmitForApproval}
      onCreate={() => navigate('/production-lots/create')}
      onEdit={(id) => navigate(`/production-lots/${id}/edit`)}
      onSubmitForApproval={handleSubmitForApproval}
    />
  );
};