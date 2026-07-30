import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Plus, QrCode } from 'lucide-react';
import { useShipments } from '@/hooks/useShipments';
import { CreateShipmentModal } from './CreateShipmentModal';
import { QrCodeGrid } from './QrCodeGrid';
import type { Shipment, CreateShipmentPayload } from '@/types/shipment';

const statusLabelMap: Record<string, string> = {
  DRAFT: 'Nháp',
  CODE_PRINTED: 'Đã in mã',
  ACTIVE: 'Đang hoạt động',
  RECALLED: 'Đã thu hồi',
};

const statusVariantMap: Record<string, string> = {
  DRAFT: 'secondary',
  CODE_PRINTED: 'default',
  ACTIVE: 'success',
  RECALLED: 'destructive',
};

interface ShipmentListProps {
  productionLotId: string;
  productionLotStatus: string;
  canCreate: boolean;
}

export const ShipmentList = ({
  productionLotId,
  productionLotStatus,
  canCreate,
}: ShipmentListProps) => {
  const [modalOpen, setModalOpen] = useState(false);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [selectedShipment, setSelectedShipment] = useState<Shipment | null>(null);
  const { shipments, isLoading, createShipment, isCreating } = useShipments(productionLotId);

  const handleCreate = async (payload: CreateShipmentPayload) => {
    await createShipment(payload);
  };

  const openQrDialog = (shipment: Shipment) => {
    setSelectedShipment(shipment);
    setDialogOpen(true);
  };

  const formatDate = (dateStr: string) => {
    try {
      return new Date(dateStr).toLocaleString('vi-VN');
    } catch {
      return dateStr;
    }
  };

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle>Danh sách lô hàng</CardTitle>
          {canCreate && productionLotStatus === 'PACKAGED' && (
            <Button onClick={() => setModalOpen(true)}>
              <Plus className="h-4 w-4 mr-1" />
              Tạo lô hàng
            </Button>
          )}
        </div>
      </CardHeader>
      <CardContent>
        {isLoading ? (
          <div className="text-center py-8">Đang tải...</div>
        ) : shipments.length === 0 ? (
          <div className="text-center py-8 text-muted-foreground">
            Chưa có lô hàng nào cho lô sản xuất này.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Tên lô hàng</TableHead>
                  <TableHead className="text-center">Số lượng</TableHead>
                  <TableHead>Quy cách</TableHead>
                  <TableHead>Trạng thái</TableHead>
                  <TableHead>Ngày tạo</TableHead>
                  <TableHead className="text-center">Số mã</TableHead>
                  <TableHead className="text-center">Thao tác</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {shipments.map((shipment) => (
                  <TableRow key={shipment.id}>
                    <TableCell className="font-medium">{shipment.name}</TableCell>
                    <TableCell className="text-center">{shipment.totalQuantity}</TableCell>
                    <TableCell>{shipment.packagingInfo || '—'}</TableCell>
                    <TableCell>
                      <Badge variant={statusVariantMap[shipment.status] as any}>
                        {statusLabelMap[shipment.status] || shipment.status}
                      </Badge>
                    </TableCell>
                    <TableCell>{formatDate(shipment.createdAt)}</TableCell>
                    <TableCell className="text-center">{shipment.traceCodes?.length || 0}</TableCell>
                    <TableCell className="text-center">
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => openQrDialog(shipment)}
                      >
                        <QrCode className="h-4 w-4 mr-1" />
                        Xem QR
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        )}
      </CardContent>

      <CreateShipmentModal
        open={modalOpen}
        onClose={() => setModalOpen(false)}
        onSubmit={handleCreate}
        productionLotId={productionLotId}
        loading={isCreating}
      />

      <Dialog open={dialogOpen} onOpenChange={(open) => !open && setDialogOpen(false)}>
        <DialogContent className="max-w-3xl max-h-[85vh] flex flex-col overflow-hidden">
          <DialogHeader>
            <DialogTitle>Mã QR - {selectedShipment?.name || ''}</DialogTitle>
          </DialogHeader>
          <p className="text-sm text-muted-foreground">
            Tổng số mã: {selectedShipment?.traceCodes?.length || 0}
          </p>
          <div className="flex-1 overflow-y-auto py-4 pr-1">
            {selectedShipment && <QrCodeGrid traceCodes={selectedShipment.traceCodes || []} />}
          </div>
        </DialogContent>
      </Dialog>
    </Card>
  );
};