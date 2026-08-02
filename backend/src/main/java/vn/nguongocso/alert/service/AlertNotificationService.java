package vn.nguongocso.alert.service;

import vn.nguongocso.alert.entity.Alert;

/** Dịch vụ gửi thông báo. */
public interface AlertNotificationService {

    /** Gửi thông báo cảnh báo. */
    void sendScanAnomalyNotification(Alert alert);

    /** Gửi thông báo hết hạn chứng nhận. */
    void sendCertificationExpiryNotification(Alert alert);
}