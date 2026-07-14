package vn.nguongocso.auth.repository;

import org.springframework.data.jpa.repository.JpaRepository;
import vn.nguongocso.auth.entity.Organization;
import vn.nguongocso.auth.entity.OrganizationUser;
import vn.nguongocso.auth.entity.User;

import java.lang.ScopedValue;
import java.util.Optional;

public interface OrganizationRepository extends JpaRepository<OrganizationRepository, Integer> {
    
	boolean existsByName(String name);

	Optional<OrganizationUser> findByUserAndOrganizationCode(User user, String orgCode);

	Optional<OrganizationUser> findFirstByUser(User user);
}
