package vn.nguongocso.event.repository;

import java.util.List;
import java.util.UUID;

import org.springframework.data.jpa.repository.JpaRepository;

import vn.nguongocso.event.entity.ChainEvent;

public interface ChainEventRepository extends JpaRepository<ChainEvent, UUID> {

    List<ChainEvent> findByShipment_IdOrderByRecordedAtAsc(UUID shipmentId);

}