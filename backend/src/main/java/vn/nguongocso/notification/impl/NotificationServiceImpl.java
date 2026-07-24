package vn.nguongocso.notification.impl;

import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import vn.nguongocso.notification.NotificationService;

@Slf4j
@Service
public class NotificationServiceImpl implements NotificationService {

    @Override
    public void sendAlert(String message) {
        log.warn("🚨 CẢNH BÁO: {}", message);
    }
}
