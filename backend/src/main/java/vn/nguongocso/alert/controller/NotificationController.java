package vn.nguongocso.alert.controller;

import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;
import vn.nguongocso.alert.dto.response.NotificationResponse;
import vn.nguongocso.alert.service.UserNotificationService;
import vn.nguongocso.auth.service.CustomUserDetails;
import vn.nguongocso.common.ApiResult;

import java.util.UUID;

@RestController
@RequestMapping("/api/v1/notifications")
@RequiredArgsConstructor
public class NotificationController {

    private final UserNotificationService userNotificationService;

    @GetMapping
    public ResponseEntity<ApiResult<Page<NotificationResponse>>> getUserNotifications(
            @RequestParam(required = false) Boolean isRead,
            @RequestParam(defaultValue = "0") Integer page,
            @RequestParam(defaultValue = "10") Integer size,
            @AuthenticationPrincipal CustomUserDetails currentUser) {

        Pageable pageable = PageRequest.of(page, size);
        Page<NotificationResponse> list = userNotificationService.getUserNotifications(isRead, currentUser, pageable);
        return ResponseEntity.ok(ApiResult.success(list));
    }

    @PatchMapping("/{notificationId}/read")
    public ResponseEntity<ApiResult<NotificationResponse>> markAsRead(
            @PathVariable UUID notificationId,
            @AuthenticationPrincipal CustomUserDetails currentUser) {

        NotificationResponse response = userNotificationService.markAsRead(notificationId, currentUser);
        return ResponseEntity.ok(ApiResult.success(response));
    }

    @PatchMapping("/read-all")
    public ResponseEntity<ApiResult<Integer>> markAllAsRead(
            @AuthenticationPrincipal CustomUserDetails currentUser) {

        int count = userNotificationService.markAllAsRead(currentUser);
        return ResponseEntity.ok(ApiResult.success(count));
    }
}
