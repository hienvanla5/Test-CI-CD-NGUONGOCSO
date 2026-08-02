package vn.nguongocso.alert.service.impl;

import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import vn.nguongocso.alert.dto.response.NotificationResponse;
import vn.nguongocso.alert.entity.Notification;
import vn.nguongocso.alert.repository.NotificationRepository;
import vn.nguongocso.alert.service.UserNotificationService;
import vn.nguongocso.auth.service.CustomUserDetails;
import vn.nguongocso.exception.BusinessException;
import vn.nguongocso.exception.ResourceNotFoundException;

import java.time.LocalDateTime;
import java.util.UUID;

@Service
@RequiredArgsConstructor
public class UserNotificationServiceImpl implements UserNotificationService {

    private final NotificationRepository notificationRepository;

    @Override
    @Transactional(readOnly = true)
    public Page<NotificationResponse> getUserNotifications(Boolean isRead, CustomUserDetails currentUser, Pageable pageable) {
        Page<Notification> notifications = notificationRepository.findByUserIdAndIsRead(
                currentUser.getUser().getUserId(),
                isRead,
                pageable
        );
        return notifications.map(this::toResponse);
    }

    @Override
    @Transactional
    public NotificationResponse markAsRead(UUID notificationId, CustomUserDetails currentUser) {
        Notification notification = notificationRepository.findById(notificationId)
                .orElseThrow(() -> new ResourceNotFoundException("Không tìm thấy thông báo."));

        if (!notification.getUser().getUserId().equals(currentUser.getUser().getUserId())) {
            throw new BusinessException("Bạn không có quyền thao tác trên thông báo này.");
        }

        if (!notification.getIsRead()) {
            notification.setIsRead(true);
            notification.setReadAt(LocalDateTime.now());
            notification = notificationRepository.save(notification);
        }

        return toResponse(notification);
    }

    @Override
    @Transactional
    public int markAllAsRead(CustomUserDetails currentUser) {
        return notificationRepository.markAllAsReadForUser(
                currentUser.getUser().getUserId(),
                LocalDateTime.now()
        );
    }

    private NotificationResponse toResponse(Notification n) {
        return NotificationResponse.builder()
                .id(n.getId())
                .type(n.getType())
                .title(n.getTitle())
                .content(n.getContent())
                .isRead(n.getIsRead())
                .readAt(n.getReadAt())
                .createdAt(n.getCreatedAt())
                .build();
    }
}
