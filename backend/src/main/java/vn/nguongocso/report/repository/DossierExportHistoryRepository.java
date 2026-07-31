package vn.nguongocso.report.repository;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import vn.nguongocso.report.entity.DossierExportHistory;

import java.util.UUID;

/**
 * Repository cho entity DossierExportHistory.
 *
 * @author Triệu Văn Đại
 */
@Repository
public interface DossierExportHistoryRepository extends JpaRepository<DossierExportHistory, UUID> {
}