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
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { BadgeCheck, Plus, QrCode } from 'lucide-react';
import { useShipments } from '@/hooks/useShipments';
import type { Shipment, CreateShipmentPayload } from '@/types/shipment';
import { CreateShipmentModal } from '@/components/shipment/CreateShipmentModal';
import { QrCodeGrid } from '@/components/shipment/QrCodeGrid';
import { ShipmentTimelineDialog } from '@/components/shipment/ShipmentTimelineDialog';
import { ActivateShipmentDialog } from '@/components/shipment/ActivateShipmentDialog';

const statusLabelMap: Record<string, string> = {
  DRAFT: 'Nháp',
  CODE_PRINTED: 'Đã in mã',
  ACTIVATED: 'Đã kích hoạt',
  RECALLED: 'Đã thu hồi',
};

const statusColorMap: Record<string, string> = {
  DRAFT: 'bg-slate-100 text-slate-700',
  CODE_PRINTED: 'bg-blue-100 text-blue-700',
  ACTIVATED: 'bg-emerald-100 text-emerald-700',
  RECALLED: 'bg-red-100 text-red-700',
};

interface ShipmentListProps {
  productionLotId: string;
  productionLotStatus: string;
  canCreate: boolean;
  canActivate: boolean;
}

export const ShipmentList = ({
  productionLotId,
  productionLotStatus,
  canCreate,
  canActivate,
}: ShipmentListProps) => {
  const [modalOpen, setModalOpen] = useState(false);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [selectedShipment, setSelectedShipment] = useState<Shipment | null>(null);
  const [activatingShipment, setActivatingShipment] = useState<Shipment | null>(null);
  const [timelineDialog, setTimelineDialog] = useState<{
    open: boolean;
    shipmentId: string;
    name: string;
  }>({
    open: false,
    shipmentId: '',
    name: '',
  });

  const {
    shipments,
    isLoading,
    createShipment,
    isCreating,
    activatingShipmentId,
    activateShipment,
  } = useShipments(productionLotId);

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
    <>
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
                        <span
                          className={`rounded-full px-2.5 py-1 text-xs font-semibold ${
                            statusColorMap[shipment.status] || 'bg-gray-100 text-gray-700'
                          }`}
                        >
                          {statusLabelMap[shipment.status] || shipment.status}
                        </span>
                      </TableCell>
                      <TableCell>{formatDate(shipment.createdAt)}</TableCell>
                      <TableCell className="text-center">{shipment.traceCodes?.length || 0}</TableCell>
                      <TableCell className="text-center">
                        <div className="flex flex-wrap justify-center gap-2">
                          {canActivate && shipment.status === 'CODE_PRINTED' && (
                            <Button
                              size="sm"
                              onClick={() => setActivatingShipment(shipment)}
                            >
                              <BadgeCheck className="mr-1 h-4 w-4" />
                              Kích hoạt tem
                            </Button>
                          )}
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => openQrDialog(shipment)}
                          >
                            <QrCode className="mr-1 h-4 w-4" />
                            Xem QR
                          </Button>
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() =>
                              setTimelineDialog({
                                open: true,
                                shipmentId: shipment.id,
                                name: shipment.name,
                              })
                            }
                          >
                            Xem sự kiện
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>

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

      <ShipmentTimelineDialog
        open={timelineDialog.open}
        onClose={() =>
          setTimelineDialog({
            open: false,
            shipmentId: '',
            name: '',
          })
        }
        shipmentId={timelineDialog.shipmentId}
        shipmentName={timelineDialog.name}
      />

      <ActivateShipmentDialog
        shipment={activatingShipment}
        isActivating={activatingShipmentId === activatingShipment?.id}
        onClose={() => setActivatingShipment(null)}
        onConfirm={async (shipmentId) => {
          await activateShipment(shipmentId);
        }}
      />
    </>
  );
};