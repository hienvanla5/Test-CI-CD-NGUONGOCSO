package vn.nguongocso.alert.service;

import vn.nguongocso.alert.entity.Alert;
import vn.nguongocso.trace.entity.Recall;

/** Dịch vụ gửi thông báo. */
public interface AlertNotificationService {

    /** Gửi thông báo cảnh báo. */
    void sendScanAnomalyNotification(Alert alert);

    /** Gửi thông báo thu hồi lô hàng. */
    void sendShipmentRecallNotification(Recall recall);

}