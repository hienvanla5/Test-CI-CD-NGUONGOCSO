package vn.nguongocso.organization.repository;

import java.util.Optional;
import java.util.UUID;

import jakarta.validation.constraints.Email;
import org.springframework.data.jpa.repository.JpaRepository;

import vn.nguongocso.organization.entity.Organization;

public interface OrganizationRepository extends JpaRepository<Organization, UUID> {

    boolean existsByCode(String code);

    boolean existsByName(String name);

    Optional<Organization> findByCode(String code);

    boolean existsByEmail(@Email(message = "Email tổ chức không đúng định dạng") String email);
}

