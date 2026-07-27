import {
    normalizeEnumValue
} from "./farm-log.utils.js";

/**
 * Nhãn tiếng Việt cho loại sự kiện chuỗi cung ứng.
 *
 * Khớp với enum backend:
 * vn.nguongocso.event.enums.ChainEventType
 */
export const CHAIN_EVENT_LABELS =
    Object.freeze({
        HARVEST: "Thu hoạch",
        TRANSPORT: "Vận chuyển",
        PACKAGING: "Đóng gói",
        PROCUREMENT: "Thu mua",
        CORRECTION: "Đính chính"
    });

/**
 * Icon hiển thị trên dòng thời gian
 * theo từng loại sự kiện.
 */
export const CHAIN_EVENT_ICONS =
    Object.freeze({
        HARVEST: "🌾",
        TRANSPORT: "🚚",
        PACKAGING: "📦",
        PROCUREMENT: "🏢",
        CORRECTION: "✎"
    });

/**
 * Các loại sự kiện đã có API ghi nhận thật ở backend.
 *
 * TRANSPORT và PROCUREMENT tồn tại trong enum nhưng
 * chưa có endpoint tương ứng ở ChainEventController,
 * nên tạm thời chỉ cho phép chọn khi ghi sự kiện mới.
 */
export const SUPPORTED_RECORD_EVENT_TYPES =
    Object.freeze([
        "HARVEST",
        "PACKAGING"
    ]);

/**
 * Lấy nhãn tiếng Việt của loại sự kiện.
 */
export function getChainEventLabel(
    eventType
) {
    const normalizedType =
        normalizeEnumValue(eventType);

    return (
        CHAIN_EVENT_LABELS[
            normalizedType
        ] ||
        normalizedType ||
        "—"
    );
}

/**
 * Lấy icon của loại sự kiện.
 */
export function getChainEventIcon(
    eventType
) {
    const normalizedType =
        normalizeEnumValue(eventType);

    return (
        CHAIN_EVENT_ICONS[
            normalizedType
        ] || "•"
    );
}

/**
 * Kiểm tra loại sự kiện đã có API ghi nhận thật.
 */
export function isSupportedRecordEventType(
    eventType
) {
    return SUPPORTED_RECORD_EVENT_TYPES
        .includes(
            normalizeEnumValue(eventType)
        );
}

/**
 * Rút gọn một chuỗi mã dài (ví dụ mã QR)
 * để hiển thị dễ đọc hơn.
 *
 * Ví dụ: "NGS-2026-AB12CD34EF56" giữ nguyên,
 * chuỗi rất dài sẽ bị rút gọn ở giữa.
 */
export function truncateCode(
    value,
    maxLength = 28
) {
    const normalizedValue =
        String(value || "").trim();

    if (
        !normalizedValue ||
        normalizedValue.length <= maxLength
    ) {
        return normalizedValue || "—";
    }

    const headLength =
        Math.ceil(maxLength / 2);

    const tailLength =
        Math.floor(maxLength / 2) - 3;

    return (
        `${normalizedValue.slice(0, headLength)}...${normalizedValue.slice(
            normalizedValue.length - tailLength
        )}`
    );
}