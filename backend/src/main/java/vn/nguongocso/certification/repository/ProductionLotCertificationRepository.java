package vn.nguongocso.certification.repository;

import org.springframework.data.jpa.repository.JpaRepository;
import vn.nguongocso.certification.entity.ProductionLotCertification;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

public interface ProductionLotCertificationRepository extends JpaRepository<ProductionLotCertification, UUID> {

    List<ProductionLotCertification> findByProductionLotId(UUID lotId);

    Optional<ProductionLotCertification> findByProductionLotIdAndCertificationId(UUID lotId, UUID certId);

    boolean existsByProductionLotIdAndCertificationId(UUID lotId, UUID certId);

    void deleteByProductionLotIdAndCertificationId(UUID lotId, UUID certId);
}