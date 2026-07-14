package vn.nguongocso.auth.repository;

import org.springframework.data.jpa.repository.JpaRepository;

import vn.nguongocso.auth.entity.User;

import java.lang.ScopedValue;
import java.util.Optional;

public interface UserRepository extends JpaRepository<User, Integer> {
	
	boolean existsByUserName(String userName);

	Optional<User> findByUsername(String username);
}
