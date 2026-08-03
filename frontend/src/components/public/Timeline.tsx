import { Calendar, Package, Truck, Sprout, Clipboard } from "lucide-react";
import type { PublicChainEventItem } from '@/types/publicTrace';

const EVENT_ICONS: Record<string, any> = {
  HARVEST: Sprout,
  PACKAGING: Package,
  TRANSPORT: Truck,
  PROCUREMENT: Clipboard,
  CORRECTION: Calendar,
};

const EVENT_LABELS: Record<string, string> = {
  HARVEST: 'Thu hoạch',
  PACKAGING: 'Đóng gói',
  TRANSPORT: 'Vận chuyển',
  PROCUREMENT: 'Thu mua',
  CORRECTION: 'Đính chính',
};

// Mapping field keys → tiếng Việt theo loại sự kiện
const FIELD_LABELS: Record<string, Record<string, string>> = {
  HARVEST: {
    productionLotName: 'Tên lô sản xuất',
    quantity: 'Sản lượng (kg)',
    harvestDate: 'Ngày thu hoạch',
  },
  PACKAGING: {
    productionLotName: 'Tên lô sản xuất',
    packagingSpecification: 'Quy cách đóng gói',
    packagingDate: 'Ngày đóng gói',
  },
  TRANSPORT: {
    fromLocation: 'Điểm đi',
    toLocation: 'Điểm đến',
    transportDate: 'Ngày vận chuyển',
  },
  PROCUREMENT: {
    buyerName: 'Người thu mua',
    purchaseDate: 'Ngày thu mua',
    quantity: 'Số lượng',
  },
  CORRECTION: {
    correctionReason: 'Lý do đính chính',
    packagingSpecification: 'Quy cách mới',
    packagingDate: 'Ngày mới',
  },
};

// Lọc và dịch dữ liệu sự kiện
const getTranslatedData = (eventType: string, data: Record<string, any>): Record<string, string> => {
  const fieldMap = FIELD_LABELS[eventType] || {};
  const result: Record<string, string> = {};
  for (const [key, value] of Object.entries(data)) {
    if (value === null || value === undefined || value === '') continue;
    const label = fieldMap[key] || key.replace(/([A-Z])/g, ' $1').replace(/^./, (s) => s.toUpperCase());
    result[label] = String(value);
  }
  return result;
};

interface TimelineProps {
  events: PublicChainEventItem[];
}

const formatDate = (iso: string) => {
  try {
    const date = new Date(iso);
    return date.toLocaleDateString('vi-VN', {
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

export const Timeline = ({ events }: TimelineProps) => {
  if (!events || events.length === 0) {
    return (
      <div className="text-center py-8 text-gray-500">
        <p>Chưa có sự kiện nào được ghi nhận cho lô hàng này.</p>
      </div>
    );
  }

  return (
    <div className="relative pl-6 border-l-2 border-gray-200 space-y-6">
      {events.map((event, index) => {
        const Icon = EVENT_ICONS[event.eventType] || Calendar;
        const label = EVENT_LABELS[event.eventType] || event.eventType;
        const translatedData = getTranslatedData(event.eventType, event.eventData || {});
        const entries = Object.entries(translatedData);

        return (
          <div key={index} className="relative pl-6">
            {/* Dot trên timeline */}
            <div className="absolute left-[-9px] top-1 w-4 h-4 rounded-full bg-emerald-500 border-2 border-white shadow-sm" />

            <div className="bg-white rounded-lg border border-gray-100 p-4 shadow-sm hover:shadow-md transition-shadow">
              <div className="flex items-start gap-3">
                <div className="mt-0.5 p-1.5 bg-emerald-50 rounded-full">
                  <Icon className="h-4 w-4 text-emerald-600" />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between gap-2 flex-wrap">
                    <span className="font-semibold text-gray-900">{label}</span>
                    <span className="text-xs text-gray-400 flex items-center gap-1">
                      <Calendar className="h-3 w-3" />
                      {formatDate(event.recordedAt)}
                    </span>
                  </div>
                  {entries.length > 0 && (
                    <div className="mt-1 text-sm text-gray-600 space-y-1">
                      {entries.map(([label, value]) => (
                        <div key={label} className="flex gap-2">
                          <span className="font-medium text-gray-500">{label}:</span>
                          <span className="text-gray-900">{value}</span>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
};