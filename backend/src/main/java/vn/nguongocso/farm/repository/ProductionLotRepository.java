package vn.nguongocso.farm.repository;


import vn.nguongocso.farm.entity.ProductionLot;
import vn.nguongocso.farm.enums.ProductionLotStatus;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.UUID;

public interface ProductionLotRepository extends JpaRepository<ProductionLot, UUID> {

    List<ProductionLot> findByOrganization_OrganizationId(UUID organizationId);

    List<ProductionLot> findByOrganization_OrganizationIdAndStatus(UUID organizationId, ProductionLotStatus status);

    List<ProductionLot> findByFarmAreaId(UUID farmAreaId);
}
