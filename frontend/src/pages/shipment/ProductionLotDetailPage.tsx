import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ArrowLeft } from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';
import { getProductionLotById } from '@/api/productionLotApi';
import { ShipmentList } from '@/components/shipment/ShipmentList';
import { FarmLogList } from '@/components/farm-log/FarmLogList';
import type { ProductionLot } from '@/types/productionLot';
import { toast } from 'sonner';

export const ProductionLotDetailPage = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [lot, setLot] = useState<ProductionLot | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!id) return;
    const load = async () => {
      try {
        const data = await getProductionLotById(id);
        setLot(data);
      } catch (error) {
        toast.error('Không thể tải thông tin lô sản xuất');
      } finally {
        setLoading(false);
      }
    };
    load();
  }, [id]);

  if (loading) {
    return <div className="flex justify-center p-12">Đang tải...</div>;
  }

  if (!lot) {
    return <div className="text-center p-12 text-muted-foreground">Không tìm thấy lô sản xuất</div>;
  }

  const canCreateShipment = user?.roleCode === 'VT-02' && lot.status === 'PACKAGED';

  return (
    <div className="container mx-auto py-6 space-y-6">
      <Button variant="outline" onClick={() => navigate(-1)}>
        <ArrowLeft className="h-4 w-4 mr-1" />
        Quay lại
      </Button>

      <Card>
        <CardHeader>
          <CardTitle>Chi tiết lô sản xuất</CardTitle>
        </CardHeader>
        <CardContent>
          <dl className="grid grid-cols-2 gap-4">
            <div>
              <dt className="text-sm font-medium text-muted-foreground">Tên lô</dt>
              <dd className="text-base font-semibold">{lot.name}</dd>
            </div>
            <div>
              <dt className="text-sm font-medium text-muted-foreground">Trạng thái</dt>
              <dd className="text-base font-semibold">{lot.status}</dd>
            </div>
            <div>
              <dt className="text-sm font-medium text-muted-foreground">Sản lượng dự kiến</dt>
              <dd className="text-base">{lot.expectedQuantity} {lot.expectedQuantityUnit}</dd>
            </div>
            <div>
              <dt className="text-sm font-medium text-muted-foreground">Ngày trồng</dt>
              <dd className="text-base">{lot.plantingDate ? new Date(lot.plantingDate).toLocaleDateString('vi-VN') : '—'}</dd>
            </div>
            <div>
              <dt className="text-sm font-medium text-muted-foreground">Vùng trồng</dt>
              <dd className="text-base">{lot.farmAreaName || '—'}</dd>
            </div>
            <div>
              <dt className="text-sm font-medium text-muted-foreground">Nông sản</dt>
              <dd className="text-base">{lot.productCategoryName || '—'}</dd>
            </div>
          </dl>
        </CardContent>
      </Card>

      <Tabs defaultValue="info" className="w-full">
        <TabsList>
          <TabsTrigger value="info">Thông tin chung</TabsTrigger>
          <TabsTrigger value="farmlogs">Nhật ký canh tác</TabsTrigger>
          <TabsTrigger value="shipments">Lô hàng & Mã QR</TabsTrigger>
        </TabsList>
        <TabsContent value="info" className="mt-4">
          <Card>
            <CardContent className="pt-6">
              <dl className="grid grid-cols-2 gap-4">
                <div>
                  <dt className="text-sm font-medium text-muted-foreground">ID</dt>
                  <dd className="text-sm font-mono">{lot.id}</dd>
                </div>
                <div>
                  <dt className="text-sm font-medium text-muted-foreground">Ngày tạo</dt>
                  <dd className="text-sm">{new Date(lot.createdAt).toLocaleString('vi-VN')}</dd>
                </div>
                <div>
                  <dt className="text-sm font-medium text-muted-foreground">Người tạo</dt>
                  <dd className="text-sm">{lot.createdByName || '—'}</dd>
                </div>
              </dl>
            </CardContent>
          </Card>
        </TabsContent>
        <TabsContent value="farmlogs" className="mt-4">
          <FarmLogList productionLotId={lot.id} productionLotName={lot.name} />
        </TabsContent>
        <TabsContent value="shipments" className="mt-4">
          <ShipmentList
            productionLotId={lot.id}
            productionLotStatus={lot.status}
            canCreate={canCreateShipment}
          />
        </TabsContent>
      </Tabs>
    </div>
  );
};