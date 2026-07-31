package vn.nguongocso.farm.repository;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import vn.nguongocso.farm.entity.ProductionLot;
import vn.nguongocso.farm.enums.ProductionLotStatus;
import vn.nguongocso.report.dto.response.ProductBreakdownItem;

import java.time.LocalDate;
import java.util.List;
import java.util.UUID;

public interface ProductionLotRepository extends JpaRepository<ProductionLot, UUID> {

  List<ProductionLot> findByOrganization_OrganizationId(UUID organizationId);

  List<ProductionLot> findByOrganization_OrganizationIdAndStatus(UUID organizationId, ProductionLotStatus status);

  List<ProductionLot> findByFarmAreaId(UUID farmAreaId);

  /**
   * Truy vấn tổng hợp số lô, sản lượng thực tế và dự kiến theo trạng thái của tổ
   * chức.
   */
  @Query("""
          SELECT pl.status, COUNT(pl), SUM(pl.expectedQuantity), SUM(pl.actualQuantity)
          FROM ProductionLot pl
          WHERE pl.organization.organizationId = :organizationId
            AND (:startDate IS NULL OR pl.plantingDate >= :startDate)
            AND (:endDate IS NULL OR pl.plantingDate <= :endDate)
          GROUP BY pl.status
      """)
  List<Object[]> getDashboardSummaryAndStatus(
      @Param("organizationId") UUID organizationId,
      @Param("startDate") LocalDate startDate,
      @Param("endDate") LocalDate endDate);

  /**
   * Lấy các lô sản xuất có ngày xuống giống khác null để phục vụ gom nhóm theo
   * chu kỳ thời gian trên Java.
   */
  @Query("""
          SELECT pl.plantingDate, pl.expectedQuantity, pl.actualQuantity
          FROM ProductionLot pl
          WHERE pl.organization.organizationId = :organizationId
            AND pl.plantingDate IS NOT NULL
            AND (:startDate IS NULL OR pl.plantingDate >= :startDate)
            AND (:endDate IS NULL OR pl.plantingDate <= :endDate)
          ORDER BY pl.plantingDate ASC
      """)
  List<Object[]> getDashboardTimeSeriesData(
      @Param("organizationId") UUID organizationId,
      @Param("startDate") LocalDate startDate,
      @Param("endDate") LocalDate endDate);
}
