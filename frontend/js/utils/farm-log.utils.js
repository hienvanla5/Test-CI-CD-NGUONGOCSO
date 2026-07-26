export const FARM_ACTIVITY_LABELS =
    Object.freeze({
        PLANTING: "Gieo trồng",
        WATERING: "Tưới nước",
        FERTILIZING: "Bón phân",
        PESTICIDE: "Phun thuốc",
        WEEDING: "Làm cỏ",
        HARVESTING: "Thu hoạch",
        OTHER: "Khác"
    });

export const FARM_LOG_ALLOWED_STATUSES =
    Object.freeze([
        "APPROVED",
        "HARVESTED"
    ]);

/**
 * Chuẩn hóa một giá trị enum.
 */
export function normalizeEnumValue(
    value
) {
    return String(value || "")
        .trim()
        .toUpperCase();
}

/**
 * Lấy tên tiếng Việt của hoạt động.
 */
export function getActivityLabel(
    activityType
) {
    const normalizedActivityType =
        normalizeEnumValue(
            activityType
        );

    return (
        FARM_ACTIVITY_LABELS[
            normalizedActivityType
        ] ||
        normalizedActivityType ||
        "—"
    );
}

/**
 * Kiểm tra trạng thái lô có được
 * phép ghi nhật ký hay không.
 */
export function isAllowedFarmLogStatus(
    status
) {
    return FARM_LOG_ALLOWED_STATUSES
        .includes(
            normalizeEnumValue(status)
        );
}

/**
 * Định dạng LocalDate yyyy-MM-dd
 * thành dd/MM/yyyy.
 */
export function formatDate(value) {
    if (!value) {
        return "—";
    }

    const dateValue =
        String(value).trim();

    const datePattern =
        /^(\d{4})-(\d{2})-(\d{2})$/;

    const match =
        dateValue.match(datePattern);

    if (!match) {
        return dateValue;
    }

    const [, year, month, day] =
        match;

    return `${day}/${month}/${year}`;
}

/**
 * Định dạng LocalDateTime.
 */
export function formatDateTime(value) {
    if (!value) {
        return "—";
    }

    const date =
        new Date(value);

    if (
        Number.isNaN(
            date.getTime()
        )
    ) {
        return String(value);
    }

    return date.toLocaleString(
        "vi-VN"
    );
}

/**
 * Định dạng số lượng.
 */
export function formatQuantity(value) {
    if (
        value === null ||
        value === undefined ||
        value === ""
    ) {
        return "—";
    }

    const numberValue =
        Number(value);

    if (Number.isNaN(numberValue)) {
        return String(value);
    }

    return numberValue
        .toLocaleString("vi-VN", {
            maximumFractionDigits: 2
        });
}

/**
 * Trả về dấu gạch ngang nếu
 * dữ liệu rỗng.
 */
export function displayValue(value) {
    if (
        value === null ||
        value === undefined ||
        String(value).trim() === ""
    ) {
        return "—";
    }

    return String(value);
}

/**
 * Chuyển chuỗi tùy chọn thành
 * string đã trim hoặc null.
 */
export function optionalText(value) {
    const normalizedValue =
        String(value || "").trim();

    return normalizedValue || null;
}