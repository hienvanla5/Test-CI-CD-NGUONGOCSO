import type { ChainEventType } from '@/enums/chainEventType';

/**
 * Maps event type enum values to human-readable Vietnamese labels.
 */
export const EVENT_TYPE_VN_LABELS: Record<ChainEventType, string> = {
  HARVEST: 'Thu hoạch',
  PACKAGING: 'Đóng gói',
  TRANSPORT: 'Vận chuyển',
  PROCUREMENT: 'Thu mua',
  CORRECTION: 'Điều chỉnh',
};

/**
 * Returns a human-readable Vietnamese label for a given technical event type.
 */
export function getEventTypeLabel(eventType: string): string {
  return EVENT_TYPE_VN_LABELS[eventType as ChainEventType] || eventType;
}

/**
 * Known business-field label mappings.
 * Keys are backend camelCase property names, values are human-readable Vietnamese labels.
 */
const KNOWN_FIELD_LABELS: Record<string, string> = {
  packagingSpecification: 'Quy cách đóng gói',
  productionLotName: 'Tên lô sản xuất',
  productionLotId: 'Mã lô sản xuất',
  packagingDate: 'Ngày đóng gói',
  harvestDate: 'Ngày thu hoạch',
  quantity: 'Số lượng',
  receivedQuantity: 'Số lượng nhận',
  seedType: 'Loại giống',
  plantingDate: 'Ngày trồng',
  fromLocation: 'Điểm xuất phát',
  toLocation: 'Điểm đến',
  transportMethod: 'Phương thức vận chuyển',
  correctionReason: 'Lý do điều chỉnh',
  specification: 'Quy cách',
  receivedWeight: 'Khối lượng nhận',
  deviceSource: 'Nguồn thiết bị',
  images: 'Ảnh',
};

/**
 * Converts a camelCase backend field name into a human-readable Vietnamese label.
 *
 * Rules:
 * 1. Use a known mapping if one exists (preferred).
 * 2. Otherwise: camelCase → words, capitalised.
 *
 * Examples:
 *   "packagingSpecification" → "Quy cách đóng gói"
 *   "harvestDate" → "Ngày thu hoạch"
 *   "unknownField" → "Unknown Field"
 */
export function formatFieldLabel(key: string): string {
  // 1. Known mapping
  if (KNOWN_FIELD_LABELS[key]) {
    return KNOWN_FIELD_LABELS[key];
  }

  // 2. Generic camelCase → words
  return key
    .replace(/([A-Z])/g, ' $1')
    .replace(/^./, (s) => s.toUpperCase())
    .trim();
}

/**
 * Returns true when a value looks like an ISO 8601 date / date-time string.
 */
function isISODateString(value: string): boolean {
  return /^\d{4}-\d{2}-\d{2}(T\d{2}:\d{2}:\d{2})?$/.test(value);
}

/**
 * Formats a display value based on its type.
 *
 * - Dates → "29/07/2026" (vi-VN)
 * - Booleans → "Có" / "Không"
 * - null/undefined → "" (caller should hide)
 * - UUIDs → passed through as-is (caller decides styling)
 * - Numbers → locale-formatted (vi-VN)
 * - Everything else → String(value)
 */
export function formatEventValue(value: unknown): string {
  if (value === null || value === undefined) {
    return '';
  }

  if (typeof value === 'boolean') {
    return value ? 'Có' : 'Không';
  }

  if (typeof value === 'number') {
    return value.toLocaleString('vi-VN');
  }

  if (typeof value === 'string') {
    if (isISODateString(value)) {
      try {
        return new Date(value).toLocaleDateString('vi-VN', {
          year: 'numeric',
          month: '2-digit',
          day: '2-digit',
        });
      } catch {
        return value;
      }
    }
    return value;
  }

  return String(value);
}

/**
 * Returns true if a value is considered empty / not displayable.
 * (null, undefined, empty string)
 */
export function isEventValueEmpty(value: unknown): boolean {
  return value === null || value === undefined || value === '';
}

/**
 * Formats a UTC ISO date-time string into display-friendly Vietnamese format.
 *
 * "2026-07-29T15:05:00Z" → "29/07/2026 22:05" (local time)
 */
export function formatDisplayDateTime(iso: string): string {
  try {
    const date = new Date(iso);
    if (isNaN(date.getTime())) return iso;

    const datePart = date.toLocaleDateString('vi-VN', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
    });

    const timePart = date.toLocaleTimeString('vi-VN', {
      hour: '2-digit',
      minute: '2-digit',
      hour12: false,
    });

    return `${datePart} ${timePart}`;
  } catch {
    return iso;
  }
}

/**
 * Formats an ISO date (e.g. "2026-07-29") to "29/07/2026".
 */
export function formatDisplayDate(iso: string): string {
  try {
    return new Date(iso).toLocaleDateString('vi-VN', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
    });
  } catch {
    return iso;
  }
}