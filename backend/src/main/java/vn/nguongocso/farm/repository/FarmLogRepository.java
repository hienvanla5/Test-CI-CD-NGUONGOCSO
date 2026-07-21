package vn.nguongocso.farm.repository;

import java.util.List;
import java.util.UUID;

import org.springframework.data.jpa.repository.JpaRepository;
import vn.nguongocso.farm.entity.FarmLog;

public interface FarmLogRepository extends JpaRepository<FarmLog, UUID> {
    
}
