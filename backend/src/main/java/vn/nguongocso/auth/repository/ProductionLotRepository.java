package vn.nguongocso.auth.repository;


import vn.nguongocso.auth.entity.ProductionLot;
import vn.nguongocso.auth.enums.ProductionLotStatus;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.UUID;

public interface ProductionLotRepository extends JpaRepository<ProductionLot, UUID> {

    List<ProductionLot> findByOrganizationId(UUID organizationId);

    List<ProductionLot> findByOrganizationIdAndStatus(UUID organizationId, ProductionLotStatus status);

    List<ProductionLot> findByFarmAreaId(UUID farmAreaId);
}
