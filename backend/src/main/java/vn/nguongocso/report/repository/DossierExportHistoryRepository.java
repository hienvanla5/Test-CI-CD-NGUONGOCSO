package vn.nguongocso.report.repository;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import vn.nguongocso.report.entity.DossierExportHistory;

import java.util.UUID;

@Repository
public interface DossierExportHistoryRepository extends JpaRepository<DossierExportHistory, UUID> {

    void deleteByShipmentId(UUID shipmentId);
}
