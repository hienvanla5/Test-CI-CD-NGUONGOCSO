package vn.nguongocso.alert.service.impl;

import java.util.ArrayList;
import java.util.List;
import java.util.UUID;

import org.springframework.stereotype.Service;

import lombok.RequiredArgsConstructor;
import vn.nguongocso.alert.entity.Alert;
import vn.nguongocso.alert.entity.Notification;
import vn.nguongocso.alert.enums.NotificationType;
import vn.nguongocso.alert.repository.NotificationRepository;
import vn.nguongocso.alert.service.AlertNotificationService;
import vn.nguongocso.exception.BusinessException;
import vn.nguongocso.organization.entity.OrganizationUser;
import vn.nguongocso.organization.repository.OrganizationUserRepository;
import vn.nguongocso.trace.entity.Shipment;
import vn.nguongocso.trace.entity.TraceCode;
import vn.nguongocso.trace.repository.TraceCodeRepository;

/** Triển khai dịch vụ gửi thông báo. */
@Service
@RequiredArgsConstructor
public class AlertNotificationServiceImpl implements AlertNotificationService {

    private static final String ADMIN_ROLE = "VT-01";
    private static final String ORG_MANAGER_ROLE = "VT-02";

    private static final String NOTIFICATION_TITLE = "Cảnh báo tem quét bất thường";
    private static final String NOTIFICATION_CONTENT = "Hệ thống phát hiện mã truy xuất có dấu hiệu bị quét bất thường ở nhiều vị trí.";

    private final NotificationRepository notificationRepository;
    private final TraceCodeRepository traceCodeRepository;
    private final OrganizationUserRepository organizationUserRepository;

    @Override
    public void sendScanAnomalyNotification(Alert alert) {

        TraceCode traceCode = traceCodeRepository.findById(alert.getRelatedEntityId())
                .orElseThrow(() -> new BusinessException("Mã truy xuất không tồn tại."));

        Shipment shipment = traceCode.getShipment();

        UUID organizationId = shipment.getOrganization().getOrganizationId();

        List<OrganizationUser> recipients = new ArrayList<>();

        recipients.addAll(
                organizationUserRepository.findAllByRole_Code(ADMIN_ROLE));

        recipients.addAll(
                organizationUserRepository
                        .findAllByOrganization_OrganizationIdAndRole_Code(
                                organizationId,
                                ORG_MANAGER_ROLE));

        List<Notification> notifications = recipients.stream()
                .map(user -> buildNotification(alert, user))
                .toList();

        notificationRepository.saveAll(notifications);
    }

    /** Tạo thông báo. */
    private Notification buildNotification(
            Alert alert,
            OrganizationUser organizationUser) {

        Notification notification = new Notification();

        notification.setUser(organizationUser.getUser());
        notification.setType(NotificationType.ALERT);

        notification.setTitle(NOTIFICATION_TITLE);
        notification.setContent(NOTIFICATION_CONTENT);

        return notification;
    }
}