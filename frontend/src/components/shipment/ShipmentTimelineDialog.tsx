import { useEffect, useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { LoaderCircle, AlertCircle } from 'lucide-react';
import { getShipmentTimeline } from '@/api/chainEventApi';
import type { ChainEventResponse } from '@/types/packaging';
import { ShipmentTimelineItem } from './ShipmentTimelineItem';

interface Props {
  open: boolean;
  onClose: () => void;
  shipmentId: string;
  shipmentName: string;
}

export const ShipmentTimelineDialog = ({ open, onClose, shipmentId, shipmentName }: Props) => {
  const [events, setEvents] = useState<ChainEventResponse[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!open || !shipmentId) return;

    const fetchTimeline = async () => {
      try {
        setLoading(true);
        setError(null);
        const data = await getShipmentTimeline(shipmentId);
        setEvents(data);
      } catch (err: any) {
        const msg = err.response?.data?.message || 'Không thể tải dòng sự kiện.';
        setError(msg);
      } finally {
        setLoading(false);
      }
    };

    fetchTimeline();
  }, [open, shipmentId]);

  return (
    <Dialog open={open} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="sm:max-w-lg md:max-w-2xl lg:max-w-3xl max-h-[80vh] flex flex-col overflow-hidden">
        <DialogHeader>
          <DialogTitle>Dòng sự kiện - {shipmentName}</DialogTitle>
          {!loading && !error && (
            <p className="text-sm text-muted-foreground">
              Tổng số {events.length} sự kiện
            </p>
          )}
        </DialogHeader>

        <div className="flex-1 overflow-y-auto pr-1 space-y-2">
          {loading && (
            <div className="flex justify-center py-12">
              <LoaderCircle className="h-8 w-8 animate-spin text-emerald-600" />
            </div>
          )}
          {error && (
            <div className="flex items-start gap-2 text-red-600 bg-red-50 p-4 rounded-lg">
              <AlertCircle className="h-5 w-5 flex-shrink-0 mt-0.5" />
              <span>{error}</span>
            </div>
          )}
          {!loading && !error && events.length === 0 && (
            <div className="text-center py-12 text-muted-foreground">
              <p className="text-lg font-semibold">Chưa có sự kiện</p>
              <p className="text-sm">Lô hàng này chưa có sự kiện nào được ghi nhận.</p>
            </div>
          )}
          {!loading && !error && events.length > 0 && (
            <div className="relative">
              {events.map((event, idx) => (
                <ShipmentTimelineItem
                  key={event.id}
                  event={event}
                  index={idx}
                  total={events.length}
                />
              ))}
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
};