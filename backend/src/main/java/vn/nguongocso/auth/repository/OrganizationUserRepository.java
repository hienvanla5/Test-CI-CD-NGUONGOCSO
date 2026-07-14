package vn.nguongocso.auth.repository;

import org.springframework.data.jpa.repository.JpaRepository;
import vn.nguongocso.auth.entity.OrganizationUser;
import vn.nguongocso.auth.entity.User;

import java.util.Optional;

public interface OrganizationUserRepository extends JpaRepository<OrganizationUserRepository, Integer> {
    
	boolean existsByName(String name);

	Optional<OrganizationUser> findByUserAndOrganizationCode(User user, String orgCode);

	Optional<OrganizationUser> findFirstByUser(User user);
}
