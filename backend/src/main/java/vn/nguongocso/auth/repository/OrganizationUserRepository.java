package vn.nguongocso.auth.repository;



import org.springframework.data.jpa.repository.JpaRepository;

import vn.nguongocso.auth.entity.OrganizationUser;

import vn.nguongocso.auth.entity.User;

import java.util.Optional;
import java.util.UUID;

public interface OrganizationUserRepository extends JpaRepository<OrganizationUser, UUID> {

	Optional<OrganizationUser> findByUserAndOrganizationCode(User user, String orgCode);

	Optional<OrganizationUser> findFirstByUser(User user);
}
