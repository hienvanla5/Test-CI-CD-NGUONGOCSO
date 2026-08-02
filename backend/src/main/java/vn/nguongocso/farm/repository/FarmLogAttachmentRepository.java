package vn.nguongocso.farm.repository;

import org.springframework.data.jpa.repository.JpaRepository;
import vn.nguongocso.farm.entity.FarmLogAttachment;

import java.util.List;
import java.util.UUID;

public interface FarmLogAttachmentRepository extends JpaRepository<FarmLogAttachment, UUID> {

    List<FarmLogAttachment> findByFarmLogId(UUID farmLogId);

    int countByFarmLogId(UUID farmLogId);
}
