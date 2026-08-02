package vn.nguongocso.notification.impl;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;
import java.util.UUID;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;

import vn.nguongocso.alert.enums.AlertType;
import vn.nguongocso.certification.entity.Certification;
import vn.nguongocso.certification.repository.CertificationRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import vn.nguongocso.alert.entity.Alert;
import vn.nguongocso.alert.enums.NotificationType;
import vn.nguongocso.auth.service.CustomUserDetails;
import vn.nguongocso.common.PageResponse;
import vn.nguongocso.exception.BusinessException;
import vn.nguongocso.notification.dto.response.NotificationResponse;
import vn.nguongocso.notification.dto.response.UnreadCountResponse;
import vn.nguongocso.notification.entity.Notification;
import vn.nguongocso.notification.repository.NotificationRepository;
import vn.nguongocso.notification.service.NotificationService;
import vn.nguongocso.organization.entity.OrganizationUser;
import vn.nguongocso.organization.repository.OrganizationUserRepository;
import vn.nguongocso.trace.entity.Recall;
import vn.nguongocso.trace.entity.Shipment;
import vn.nguongocso.trace.entity.TraceCode;
import vn.nguongocso.trace.repository.TraceCodeRepository;

/** Triển khai dịch vụ gửi thông báo. */
@Slf4j
@Service
@RequiredArgsConstructor
public class NotificationServiceImpl implements NotificationService {

        private static final String ADMIN_ROLE = "VT-01";
        private static final String ORG_MANAGER_ROLE = "VT-02";

        private static final String NOTIFICATION_TITLE = "Cảnh báo tem quét bất thường";
        private static final String NOTIFICATION_CONTENT = "Hệ thống phát hiện mã truy xuất có dấu hiệu bị quét bất thường ở nhiều vị trí.";
        private static final String RECALL_TITLE = "Thông báo thu hồi lô hàng";
        private static final String MSG_NOTIFICATION_NOT_FOUND = "Thông báo không tồn tại.";
        private static final String MSG_NO_PERMISSION_TO_ACCESS = "Bạn không có quyền thao tác với thông báo này.";

        private final NotificationRepository notificationRepository;
        private final TraceCodeRepository traceCodeRepository;
        private final OrganizationUserRepository organizationUserRepository;
        private final CertificationRepository certificationRepository;

        @Override
        public void sendScanAnomalyNotification(Alert alert) {

                TraceCode traceCode = traceCodeRepository.findById(alert.getRelatedEntityId())
                                .orElseThrow(() -> new BusinessException("Mã truy xuất không tồn tại."));

                Shipment shipment = traceCode.getShipment();

                UUID organizationId = shipment.getOrganization().getOrganizationId();

                List<OrganizationUser> recipients = getRecipients(organizationId);

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

        @Override
        public void sendShipmentRecallNotification(Recall recall) {

                Shipment shipment = recall.getShipment();

                UUID organizationId = shipment.getOrganization().getOrganizationId();

                List<OrganizationUser> recipients = getRecipients(organizationId);

                List<Notification> notifications = recipients.stream()
                                .map(user -> buildRecallNotification(recall, user))
                                .toList();

                notificationRepository.saveAll(notifications);
        }

        private Notification buildRecallNotification(
                        Recall recall,
                        OrganizationUser organizationUser) {

                Notification notification = new Notification();

                notification.setUser(organizationUser.getUser());
                notification.setType(NotificationType.ALERT);

                notification.setTitle(RECALL_TITLE);

                notification.setContent(
                                "Lô hàng \"" + recall.getShipment().getName()
                                                + "\" đã bị thu hồi. Lý do: "
                                                + recall.getReason());

                return notification;
        }

        @Override
        public void sendCertificationExpiryNotification(Alert alert) {

                Certification certification = certificationRepository
                                .findById(alert.getRelatedEntityId())
                                .orElseThrow(() -> new BusinessException("Chứng nhận không tồn tại."));

                UUID organizationId = certification
                                .getOrganization()
                                .getOrganizationId();

                List<OrganizationUser> recipients = getRecipients(organizationId);

                List<Notification> notifications = recipients.stream()
                                .map(recipient -> buildCertificationExpiryNotification(
                                                alert,
                                                certification,
                                                recipient))
                                .toList();

                notificationRepository.saveAll(notifications);
        }

        private Notification buildCertificationExpiryNotification(
                        Alert alert,
                        Certification certification,
                        OrganizationUser organizationUser) {

                boolean expired = alert.getType() == AlertType.CERT_EXPIRED;

                Notification notification = new Notification();

                notification.setUser(organizationUser.getUser());
                notification.setType(NotificationType.ALERT);

                if (expired) {
                        notification.setTitle("Chứng nhận đã hết hạn");
                        notification.setContent(
                                        "Chứng nhận \"" + certification.getName()
                                                        + "\" (" + certification.getCode()
                                                        + ") đã hết hạn vào ngày "
                                                        + certification.getExpiryDate() + ".");
                } else {
                        notification.setTitle("Chứng nhận sắp hết hạn");
                        notification.setContent(
                                        "Chứng nhận \"" + certification.getName()
                                                        + "\" (" + certification.getCode()
                                                        + ") sẽ hết hạn vào ngày "
                                                        + certification.getExpiryDate() + ".");
                }

                return notification;
        }

        private List<OrganizationUser> getRecipients(UUID organizationId) {

                List<OrganizationUser> recipients = new ArrayList<>();

                recipients.addAll(
                                organizationUserRepository.findAllByRole_Code(ADMIN_ROLE));

                recipients.addAll(
                                organizationUserRepository
                                                .findAllByOrganization_OrganizationIdAndRole_Code(
                                                                organizationId,
                                                                ORG_MANAGER_ROLE));

                return recipients;
        }

        /**
         * Lấy danh sách thông báo của người dùng hiện tại, có lọc theo trạng thái đã
         * đọc.
         */
        @Override
        public PageResponse<NotificationResponse> getNotifications(
                        Boolean isRead,
                        Pageable pageable) {

                CustomUserDetails currentUser = getCurrentUser();

                Page<Notification> page;

                if (isRead == null) {
                        page = notificationRepository
                                        .findByUser_UserIdOrderByCreatedAtDesc(
                                                        currentUser.getUserId(),
                                                        pageable);
                } else {
                        page = notificationRepository
                                        .findByUser_UserIdAndIsReadOrderByCreatedAtDesc(
                                                        currentUser.getUserId(),
                                                        isRead,
                                                        pageable);
                }

                List<NotificationResponse> items = page.getContent()
                                .stream()
                                .map(this::toResponse)
                                .toList();

                return PageResponse.from(page, items);
        }

        private NotificationResponse toResponse(Notification notification) {

                return NotificationResponse.builder()
                                .id(notification.getId())
                                .type(notification.getType())
                                .title(notification.getTitle())
                                .content(notification.getContent())
                                .isRead(notification.getIsRead())
                                .readAt(notification.getReadAt())
                                .createdAt(notification.getCreatedAt())
                                .build();
        }

        /**
         * Đếm số thông báo chưa đọc của người dùng hiện tại.
         */
        @Override
        public UnreadCountResponse getUnreadCount() {

                CustomUserDetails currentUser = getCurrentUser();

                long unreadCount = notificationRepository
                                .countByUser_UserIdAndIsReadFalse(currentUser.getUserId());

                return UnreadCountResponse.builder()
                                .unreadCount(unreadCount)
                                .build();
        }

        /**
         * Đánh dấu một thông báo cụ thể là đã đọc (nếu chưa đọc).
         */
        @Override
        public NotificationResponse markAsRead(UUID notificationId) {

                CustomUserDetails currentUser = getCurrentUser();

                Notification notification = notificationRepository.findById(notificationId)
                                .orElseThrow(() -> new BusinessException(MSG_NOTIFICATION_NOT_FOUND));

                if (!notification.getUser().getUserId().equals(currentUser.getUserId())) {
                        throw new BusinessException(MSG_NO_PERMISSION_TO_ACCESS);
                }

                if (!notification.getIsRead()) {
                        notification.setIsRead(true);
                        notification.setReadAt(LocalDateTime.now());

                        notification = notificationRepository.save(notification);
                }

                return toResponse(notification);
        }

        private CustomUserDetails getCurrentUser() {
                Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
                return (CustomUserDetails) authentication.getPrincipal();
        }

        @Override
        public void sendAlert(String message) {
                log.warn("🚨 CẢNH BÁO: {}", message);
        }
}