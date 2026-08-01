package vn.nguongocso.alert.repository;

import java.util.UUID;

import org.springframework.data.jpa.repository.JpaRepository;

import vn.nguongocso.alert.entity.Notification;

/** Repository thao tác Notification. */
public interface NotificationRepository
        extends JpaRepository<Notification, UUID> {

}