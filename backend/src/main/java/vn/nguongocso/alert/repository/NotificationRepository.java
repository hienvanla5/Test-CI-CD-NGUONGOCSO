package vn.nguongocso.alert.repository;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.data.jpa.repository.JpaRepository;
import vn.nguongocso.alert.entity.Notification;

import java.time.LocalDateTime;
import java.util.UUID;

/** Repository thao tác Notification. */
public interface NotificationRepository
        extends JpaRepository<Notification, UUID> {

    @Query("SELECT n FROM Notification n WHERE n.user.userId = :userId AND (:isRead IS NULL OR n.isRead = :isRead) ORDER BY n.createdAt DESC")
    Page<Notification> findByUserIdAndIsRead(
            @Param("userId") UUID userId,
            @Param("isRead") Boolean isRead,
            Pageable pageable);

    @Modifying
    @Query("UPDATE Notification n SET n.isRead = true, n.readAt = :readAt WHERE n.user.userId = :userId AND n.isRead = false")
    int markAllAsReadForUser(
            @Param("userId") UUID userId,
            @Param("readAt") LocalDateTime readAt);
}