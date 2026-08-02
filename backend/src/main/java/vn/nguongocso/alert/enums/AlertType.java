package vn.nguongocso.alert.enums;

/** Loại sự kiện kích hoạt cảnh báo. */
public enum AlertType {
    SCAN_ANOMALY, // Bất thường khi quét
    CERTIFICATION_EXPIRING, // Chứng nhận sắp hết hạn
    CERTIFICATION_EXPIRED // Chứng nhận đã hết hạn
}