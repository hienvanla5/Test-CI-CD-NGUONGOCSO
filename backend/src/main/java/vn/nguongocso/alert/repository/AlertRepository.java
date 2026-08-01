package vn.nguongocso.alert.repository;

import java.time.LocalDateTime;
import java.util.UUID;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;

import vn.nguongocso.alert.entity.Alert;
import vn.nguongocso.alert.enums.AlertStatus;
import vn.nguongocso.alert.enums.AlertType;

/** Repository thao tác Alert. */
public interface AlertRepository extends JpaRepository<Alert, UUID> {

    /** Lọc theo loại cảnh báo. */
    Page<Alert> findByType(
            AlertType type,
            Pageable pageable);

    /** Lọc theo loại và trạng thái. */
    Page<Alert> findByTypeAndStatus(
            AlertType type,
            AlertStatus status,
            Pageable pageable);

    /** Lọc theo loại và thời gian tạo. */
    Page<Alert> findByTypeAndCreatedAtBetween(
            AlertType type,
            LocalDateTime fromDate,
            LocalDateTime toDate,
            Pageable pageable);

    /** Lọc theo loại, trạng thái và thời gian tạo. */
    Page<Alert> findByTypeAndStatusAndCreatedAtBetween(
            AlertType type,
            AlertStatus status,
            LocalDateTime fromDate,
            LocalDateTime toDate,
            Pageable pageable);

}