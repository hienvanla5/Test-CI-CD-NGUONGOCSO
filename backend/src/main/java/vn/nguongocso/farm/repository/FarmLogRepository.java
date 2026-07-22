package vn.nguongocso.farm.repository;

import java.util.UUID;

import org.springframework.data.jpa.repository.JpaRepository;
import vn.nguongocso.farm.entity.FarmLog;

/**
 * Repository thao tác dữ liệu nhật ký canh tác.
 */
public interface FarmLogRepository extends JpaRepository<FarmLog, UUID> {
    
}
