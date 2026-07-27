package vn.nguongocso.event.repository;


import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import vn.nguongocso.event.entity.ChainEvent;

import java.util.UUID;

/**
 * Repository cho thực thể ChainEvent.
 *
 * @author Team WEB 1
 */

@Repository
public interface ChainEventRepository extends JpaRepository<ChainEvent, UUID> {
}
