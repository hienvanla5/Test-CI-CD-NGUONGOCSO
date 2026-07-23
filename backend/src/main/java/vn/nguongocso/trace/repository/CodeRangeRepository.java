package vn.nguongocso.trace.repository;

import org.springframework.data.jpa.repository.JpaRepository;
import vn.nguongocso.trace.entity.CodeRange;

import java.util.Optional;
import java.util.UUID;

public interface CodeRangeRepository extends JpaRepository<CodeRange, UUID> {

    Optional<CodeRange> findByPrefix(String prefix);
}
