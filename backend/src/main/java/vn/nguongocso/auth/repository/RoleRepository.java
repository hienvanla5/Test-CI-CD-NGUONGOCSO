package vn.nguongocso.auth.repository;

import org.springframework.data.jpa.repository.JpaRepository;
import vn.nguongocso.auth.entity.Role;

import java.util.Optional;

public interface RoleRepository extends JpaRepository<Role, Integer> {

}
