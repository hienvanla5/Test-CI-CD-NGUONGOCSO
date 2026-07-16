package vn.nguongocso.organization.repository;



import org.springframework.data.jpa.repository.JpaRepository;

import vn.nguongocso.auth.entity.User;
import vn.nguongocso.organization.entity.OrganizationUser;

import java.util.Optional;
import java.util.UUID;

public interface OrganizationUserRepository extends JpaRepository<OrganizationUser, UUID> {

	Optional<OrganizationUser> findByUserAndOrganizationCode(User user, String orgCode);

	Optional<OrganizationUser> findFirstByUser(User user);
}
