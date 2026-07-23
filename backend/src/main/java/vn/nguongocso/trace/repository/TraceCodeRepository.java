package vn.nguongocso.trace.repository;

import java.util.List;
import java.util.UUID;

import org.springframework.data.jpa.repository.JpaRepository;

import vn.nguongocso.trace.entity.TraceCode;

public interface TraceCodeRepository extends JpaRepository<TraceCode, UUID> {
	
	boolean existsByCodeValue(String codeValue);

	List<TraceCode> findByShipmentId(UUID shipmentId);
}
