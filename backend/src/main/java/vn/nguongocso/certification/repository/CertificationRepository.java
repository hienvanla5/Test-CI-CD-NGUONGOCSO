package vn.nguongocso.certification.repository;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import vn.nguongocso.certification.entity.Certification;

import java.time.LocalDate;
import java.util.List;
import java.util.Optional;
import java.util.UUID;

public interface CertificationRepository extends JpaRepository<Certification, UUID> {

    @Query("SELECT c FROM Certification c WHERE c.id = :id AND c.organization.organizationId = :orgId")
    Optional<Certification> findByIdAndOrganizationId(@Param("id") UUID id, @Param("orgId") UUID organizationId);

    @Query("SELECT c FROM Certification c WHERE c.organization.organizationId = :orgId AND c.expiryDate > :date")
    List<Certification> findByOrganizationIdAndExpiryDateAfter(@Param("orgId") UUID organizationId, @Param("date") LocalDate date);

    @Query("SELECT c FROM Certification c WHERE c.organization.organizationId = :orgId")
    List<Certification> findByOrganizationId(@Param("orgId") UUID organizationId);
}