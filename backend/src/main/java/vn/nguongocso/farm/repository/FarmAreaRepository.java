package vn.nguongocso.farm.repository;

import java.util.List;
import java.util.UUID;

import org.springframework.data.jpa.repository.JpaRepository;

import vn.nguongocso.farm.entity.FarmArea;

/**
 * Repository thao tác dữ liệu vùng trồng.
 */
public interface FarmAreaRepository extends JpaRepository<FarmArea, UUID> {

	List<FarmArea> findByOrganization_OrganizationId(UUID organizationId);
}
