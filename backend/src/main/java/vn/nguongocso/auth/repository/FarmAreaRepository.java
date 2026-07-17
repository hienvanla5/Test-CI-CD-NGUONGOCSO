package vn.nguongocso.auth.repository;

import org.springframework.data.jpa.repository.JpaRepository;
import vn.nguongocso.auth.entity.FarmArea;
import java.util.UUID;

public interface FarmAreaRepository extends JpaRepository<FarmArea, UUID> {
}

