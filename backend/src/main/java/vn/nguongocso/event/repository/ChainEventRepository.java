package vn.nguongocso.event.repository;

import java.util.List;
import java.util.UUID;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import vn.nguongocso.event.entity.ChainEvent;

/**
 * Repository cho thực thể ChainEvent.
 *
 * @author Team WEB 1
 */

@Repository
public interface ChainEventRepository extends JpaRepository<ChainEvent, UUID> {

    List<ChainEvent> findByShipment_IdOrderByRecordedAtAsc(UUID shipmentId);

}