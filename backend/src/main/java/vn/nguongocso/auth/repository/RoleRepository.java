package vn.nguongocso.auth.repository;

import java.lang.foreign.Linker.Option;
import java.util.Optional;

import org.springframework.data.jpa.repository.JpaRepository;

import vn.nguongocso.auth.entity.Role;
import vn.nguongocso.auth.enums.RoleName;

public interface RoleRepository extends JpaRepository<Role, Integer> {

	Optional<Role> findByRole(RoleName role);
}
