package vn.nguongocso.farm.repository;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import vn.nguongocso.farm.entity.FarmLogAttachment;

import java.util.List;
import java.util.UUID;

public interface FarmLogAttachmentRepository extends JpaRepository<FarmLogAttachment, UUID> {

    List<FarmLogAttachment> findByFarmLogId(UUID farmLogId);

    int countByFarmLogId(UUID farmLogId);

    @Query("SELECT fla FROM FarmLogAttachment fla WHERE fla.farmLog.id IN :farmLogIds")
    List<FarmLogAttachment> findByFarmLogIdIn(@Param("farmLogIds") List<UUID> farmLogIds);
}
