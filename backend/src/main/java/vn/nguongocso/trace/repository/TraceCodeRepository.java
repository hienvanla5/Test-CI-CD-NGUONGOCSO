package vn.nguongocso.trace.repository;

import java.util.List;
import java.util.UUID;

import org.springframework.data.jpa.repository.JpaRepository;

import vn.nguongocso.trace.entity.TraceCode;

/**
 * Repository quản lý mã truy xuất.
 */
public interface TraceCodeRepository extends JpaRepository<TraceCode, UUID> {
	
    /**
     * Kiểm tra mã đã tồn tại.
     */
	boolean existsByCodeValue(String codeValue);

    /**
     * Lấy mã theo lô hàng.
     */
	List<TraceCode> findByShipmentId(UUID shipmentId);
}
