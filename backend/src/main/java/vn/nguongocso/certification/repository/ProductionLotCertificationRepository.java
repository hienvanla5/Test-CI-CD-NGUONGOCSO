package vn.nguongocso.certification.repository;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import vn.nguongocso.certification.entity.ProductionLotCertification;

/**
 * Repository thao tác ProductionLotCertification.
 */
public interface ProductionLotCertificationRepository
        extends JpaRepository<ProductionLotCertification, UUID> {

    /**
     * Lấy tất cả chứng nhận đã gắn cho một lô sản xuất.
     */
    List<ProductionLotCertification> findByProductionLotId(UUID lotId);

    /**
     * Lấy liên kết giữa lô và chứng nhận.
     */
    Optional<ProductionLotCertification> findByProductionLotIdAndCertificationId(
            UUID lotId,
            UUID certId);

    /**
     * Kiểm tra chứng nhận đã được gắn cho lô hay chưa.
     */
    boolean existsByProductionLotIdAndCertificationId(
            UUID lotId,
            UUID certId);

    /**
     * Gỡ chứng nhận khỏi lô.
     */
    void deleteByProductionLotIdAndCertificationId(
            UUID lotId,
            UUID certId);

    /**
     * Lấy danh sách chứng nhận theo mã tem truy xuất công khai.
     */
    @Query("""
            SELECT plc
            FROM ProductionLotCertification plc
                JOIN FETCH plc.certification c
                JOIN plc.productionLot pl
                JOIN Shipment s ON s.productionLot = pl
                JOIN TraceCode tc ON tc.shipment = s
            WHERE tc.codeValue = :codeValue
            """)
    List<ProductionLotCertification> findByTraceCode(@Param("codeValue") String codeValue);
}