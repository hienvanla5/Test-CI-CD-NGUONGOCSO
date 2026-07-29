package vn.nguongocso.event.repository;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import vn.nguongocso.event.entity.FailedEventLog;

import java.util.UUID;

@Repository
public interface FailedEventLogRepository extends JpaRepository<FailedEventLog, UUID> {
    Page<FailedEventLog> findAllByOrderByAttemptedAtDesc(Pageable pageable);
}
