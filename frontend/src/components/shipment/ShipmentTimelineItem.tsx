import { Calendar, MapPin, Package, Truck, Sprout, Clipboard, Pencil } from 'lucide-react';
import type { ChainEventResponse } from '@/types/packaging';

const EVENT_ICONS: Record<string, any> = {
  HARVEST: Sprout,
  PACKAGING: Package,
  TRANSPORT: Truck,
  PROCUREMENT: Clipboard,
  CORRECTION: Pencil,
};

const EVENT_LABELS: Record<string, string> = {
  HARVEST: 'Thu hoạch',
  PACKAGING: 'Đóng gói',
  TRANSPORT: 'Vận chuyển',
  PROCUREMENT: 'Thu mua',
  CORRECTION: 'Đính chính',
};

interface Props {
  event: ChainEventResponse;
  index: number;
  total: number;
}

const formatDate = (iso: string) => {
  try {
    return new Date(iso).toLocaleString('vi-VN', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  } catch {
    return iso;
  }
};

export const ShipmentTimelineItem = ({ event, index, total }: Props) => {
  const Icon = EVENT_ICONS[event.eventType] || Calendar;
  const label = EVENT_LABELS[event.eventType] || event.eventType;

  return (
    <div className="relative pl-8 pb-8 last:pb-0">
      {index < total - 1 && (
        <div className="absolute left-3 top-5 bottom-0 w-0.5 bg-gray-200" />
      )}
      <div className="absolute left-0 top-1.5 w-6 h-6 rounded-full bg-emerald-100 border-2 border-emerald-500 flex items-center justify-center">
        <Icon className="h-3.5 w-3.5 text-emerald-600" />
      </div>

      <div className="bg-white rounded-lg border border-gray-100 p-4 shadow-sm hover:shadow-md transition-shadow">
        <div className="flex flex-wrap items-start justify-between gap-2">
          <div className="flex items-center gap-2">
            <span className="font-semibold text-gray-900">{label}</span>
            {event.eventType === 'CORRECTION' && (
              <span className="bg-amber-100 text-amber-700 text-xs px-2 py-0.5 rounded-full">Đính chính</span>
            )}
          </div>
          <div className="flex items-center gap-2 text-xs text-gray-400">
            <Calendar className="h-3 w-3" />
            <span>{formatDate(event.recordedAt)}</span>
          </div>
        </div>

        {event.recordedByName && (
          <div className="mt-1 text-xs text-gray-500">
            Người ghi: <span className="font-medium">{event.recordedByName}</span>
          </div>
        )}

        {event.eventData && Object.keys(event.eventData).length > 0 && (
          <div className="mt-2 text-sm text-gray-600 space-y-1">
            {Object.entries(event.eventData).map(([key, value]) => (
              <div key={key} className="flex gap-2">
                <span className="font-medium text-gray-500 capitalize">{key}:</span>
                <span>{String(value)}</span>
              </div>
            ))}
          </div>
        )}

        {event.latitude && event.longitude && (
          <div className="mt-2 text-xs text-gray-400 flex items-center gap-1">
            <MapPin className="h-3 w-3" />
            <span>{event.latitude.toFixed(6)}, {event.longitude.toFixed(6)}</span>
          </div>
        )}
      </div>
    </div>
  );
};