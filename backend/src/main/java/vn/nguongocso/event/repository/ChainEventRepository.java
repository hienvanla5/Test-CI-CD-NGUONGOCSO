package vn.nguongocso.event.repository;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import vn.nguongocso.event.entity.ChainEvent;
import vn.nguongocso.event.enums.ChainEventType;

/**
 * Repository cho thực thể ChainEvent.
 *
 * @author Team WEB 1
 */
@Repository
public interface ChainEventRepository extends JpaRepository<ChainEvent, UUID> {

    List<ChainEvent> findByShipment_IdOrderByRecordedAtAsc(UUID shipmentId);

    @Query("""
            SELECT ce
            FROM ChainEvent ce
            WHERE ce.shipment.id = :shipmentId
              AND ce.location IS NOT NULL
              AND ce.isCorrection = false
            ORDER BY ce.recordedAt ASC
            """)
    List<ChainEvent> findJourneyPointsByShipmentId(@Param("shipmentId") UUID shipmentId);

    List<ChainEvent> findByShipmentIdOrderByRecordedAtAsc(UUID shipmentId);

    List<ChainEvent> findByShipmentIsNullAndEventTypeIn(List<ChainEventType> eventTypes);

    /**
     * Lấy sự kiện gần nhất của một lô hàng.
     *
     * Phục vụ chức năng quét mã để xác định loại sự kiện
     * hợp lệ tiếp theo khi mở biểu mẫu ghi sự kiện.
     *
     * @param shipmentId ID lô hàng
     * @return sự kiện mới nhất nếu tồn tại
     */
    Optional<ChainEvent> findTopByShipmentIdOrderByRecordedAtDesc(UUID shipmentId);

    void deleteByShipmentId(UUID id);

    // Đếm số lượng event theo loại cho từng shipment
    @Query("SELECT ce.shipment.id, ce.eventType, COUNT(ce) " +
            "FROM ChainEvent ce " +
            "WHERE ce.shipment.id IN :shipmentIds " +
            "AND ce.eventType IN :requiredTypes " +
            "AND ce.isCorrection = false " +
            "GROUP BY ce.shipment.id, ce.eventType")
    List<Object[]> countEventsByShipmentAndTypes(@Param("shipmentIds") List<UUID> shipmentIds,
                                                  @Param("requiredTypes") List<ChainEventType> requiredTypes);

    @Query("SELECT ce FROM ChainEvent ce " +
            "WHERE ce.shipment.id IN :shipmentIds " +
            "AND ce.isCorrection = false " +
            "ORDER BY ce.recordedAt ASC")
    List<ChainEvent> findByShipmentIdInOrderByRecordedAtAsc(@Param("shipmentIds") List<UUID> shipmentIds,
                                                           @Param("isCorrection") Boolean isCorrection);
}