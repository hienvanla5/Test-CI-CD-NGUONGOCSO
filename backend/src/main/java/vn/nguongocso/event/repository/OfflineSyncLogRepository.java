package vn.nguongocso.event.repository;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import vn.nguongocso.event.entity.OfflineSyncLog;

import java.util.Optional;
import java.util.UUID;

@Repository
public interface OfflineSyncLogRepository extends JpaRepository<OfflineSyncLog, UUID> {

    // Tìm kiếm log theo ID sự kiện ngoại tuyến để phục vụ kiểm tra trùng
    Optional<OfflineSyncLog> findByOfflineEventId(UUID offlineEventId);
}
