package vn.nguongocso.trace.repository;

import java.time.LocalDateTime;
import java.util.List;
import java.util.UUID;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import vn.nguongocso.report.dto.response.ProductBreakdownItem;
import vn.nguongocso.trace.entity.Shipment;

/**
 * Repository quản lý lô hàng.
 */
public interface ShipmentRepository extends JpaRepository<Shipment, UUID> {

    List<Shipment> findByProductionLotId(UUID productionLotId);

    /**
     * Tính tổng sản lượng của các lô hàng theo địa bàn và khoảng thời gian.
     */
    @Query("""
                SELECT COALESCE(SUM(s.totalQuantity), 0)
                FROM Shipment s
                WHERE s.organization.organizationId IN :organizationIds
                  AND s.createdAt >= :fromDate
                  AND s.createdAt < :toDate
            """)
    Double getTotalQuantity(
            @Param("organizationIds") List<UUID> organizationIds,
            @Param("fromDate") LocalDateTime fromDate,
            @Param("toDate") LocalDateTime toDate);

    /**
     * Thống kê số lô hàng và tổng sản lượng theo từng loại nông sản.
     */
    @Query("""
                SELECT new vn.nguongocso.report.dto.response.ProductBreakdownItem(
                    pc.name,
                    COUNT(s),
                    COALESCE(SUM(s.totalQuantity), 0)
                )
                FROM Shipment s
                    JOIN s.productionLot pl
                    JOIN pl.productCategory pc
                WHERE s.organization.organizationId IN :organizationIds
                  AND s.createdAt >= :fromDate
                  AND s.createdAt < :toDate
                GROUP BY pc.name
                ORDER BY COALESCE(SUM(s.totalQuantity), 0) DESC
            """)
    List<ProductBreakdownItem> getProductBreakdown(
            @Param("organizationIds") List<UUID> organizationIds,
            @Param("fromDate") LocalDateTime fromDate,
            @Param("toDate") LocalDateTime toDate);

    /**
     * Đếm số lô hàng của các tổ chức trong khoảng thời gian.
     */
    @Query("""
                SELECT COUNT(s)
                FROM Shipment s
                WHERE s.organization.organizationId IN :organizationIds
                  AND s.createdAt >= :fromDate
                  AND s.createdAt < :toDate
            """)
    Long countShipments(
            @Param("organizationIds") List<UUID> organizationIds,
            @Param("fromDate") LocalDateTime fromDate,
            @Param("toDate") LocalDateTime toDate);
}
