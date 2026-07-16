package vn.nguongocso.auth.repository;



import jakarta.validation.constraints.NotNull;
import org.springframework.data.jpa.repository.JpaRepository;

import vn.nguongocso.auth.entity.OrganizationUser;

import vn.nguongocso.auth.entity.User;
import vn.nguongocso.auth.enums.OrganizationUserStatus;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

public interface OrganizationUserRepository extends JpaRepository<OrganizationUser, UUID> {

	Optional<OrganizationUser> findByUserAndOrganization_Code(User user, String orgCode);

	Optional<OrganizationUser> findFirstByUser(User user);

    List<OrganizationUser> findByOrganization_OrganizationIdAndStatus(UUID orgId, OrganizationUserStatus organizationUserStatus);

	Optional<OrganizationUser> findByOrganization_OrganizationIdAndUser_UserId(UUID orgId, @NotNull(message = "User ID is required") UUID userId);
}
