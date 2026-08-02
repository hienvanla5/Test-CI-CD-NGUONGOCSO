package vn.nguongocso.auth.repository;

import java.util.Optional;

import org.springframework.data.jpa.repository.JpaRepository;
import vn.nguongocso.auth.entity.Role;

public interface RoleRepository extends JpaRepository<Role, Integer> {

    Optional<Role> findByCode(String code);

}

