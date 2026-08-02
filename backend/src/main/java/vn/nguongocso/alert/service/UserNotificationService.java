package vn.nguongocso.alert.service;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import vn.nguongocso.alert.dto.response.NotificationResponse;
import vn.nguongocso.auth.service.CustomUserDetails;

import java.util.UUID;

public interface UserNotificationService {
    Page<NotificationResponse> getUserNotifications(Boolean isRead, CustomUserDetails currentUser, Pageable pageable);
    NotificationResponse markAsRead(UUID notificationId, CustomUserDetails currentUser);
    int markAllAsRead(CustomUserDetails currentUser);
}
