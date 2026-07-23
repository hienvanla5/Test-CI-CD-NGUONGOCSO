package vn.nguongocso.trace.repository;

import java.util.UUID;

import org.springframework.data.jpa.repository.JpaRepository;

import vn.nguongocso.trace.entity.Shipment;

public interface ShipmentRepository extends JpaRepository<Shipment, UUID>{

}
