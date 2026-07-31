import { approveProductionLot, getProductionLots, submitProductionLot } from '@/api/productionLotApi';
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
      const updated = await submitProductionLot(id);
      setLots((prev) => prev.map((lot) => (lot.id === id ? { ...lot, ...updated } : lot)));
      toast.success('Đã gửi yêu cầu duyệt lô!');
    } catch (error: any) {
      const message = error.response?.data?.message || 'Không thể gửi duyệt lô.';
      toast.error(message);
    }
  };

  const handleDecideApproval = async (id: string, approved: boolean, reason?: string) => {
    try {
      const result = await approveProductionLot(id, { approved, reason });
      setLots((prev) =>
        prev.map((lot) => (lot.id === id ? { ...lot, ...result } : lot)),
      );
      toast.success(approved ? 'Đã duyệt lô sản xuất!' : 'Đã trả lại lô sản xuất kèm lý do.');
    } catch (error: any) {
      const message = error.response?.data?.message || 'Không thể xử lý duyệt lô.';
      toast.error(message);
      throw error; // để dialog không đóng khi thất bại
    }
  };

  const canSubmitForApproval = user?.roleCode === 'VT-01' || user?.roleCode === 'VT-02';
  const canApprove = user?.roleCode === 'VT-02';

 return (
  <ProductionLotList
    lots={lots}
    isLoading={isLoading}
    canCreate={user?.roleCode === "VT-02"}
    canEdit={user?.roleCode === "VT-02"}
    canSubmitForApproval={canSubmitForApproval}
    canApprove={canApprove}
    canRecordFarmLog={user?.roleCode === "VT-03"}
    onCreate={() => navigate("/production-lots/create")}
    onEdit={(id) => navigate(`/production-lots/${id}/edit`)}
    onSubmitForApproval={handleSubmitForApproval}
    onDecideApproval={handleDecideApproval}
    onRecordFarmLog={(id) =>
      navigate(
        `/farm-logs/create?productionLotId=${encodeURIComponent(id)}`,
      )
    }
  />
);
};