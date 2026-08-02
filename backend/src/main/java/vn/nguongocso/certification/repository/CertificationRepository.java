package vn.nguongocso.certification.repository;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;
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

    Optional<Object> findByCode(@NotBlank(message = "Số hiệu chứng nhận không được để trống") @Size(max = 50, message = "Số hiệu chứng nhận tối đa 50 ký tự") String code);

    @Query("SELECT c FROM Certification c WHERE c.organization.organizationId = :orgId")
    List<Certification> findAllByOrganizationId(@Param("orgId") UUID organizationId);
}