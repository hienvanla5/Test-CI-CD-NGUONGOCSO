package vn.nguongocso.auth.repository;

import org.springframework.data.jpa.repository.JpaRepository;

import vn.nguongocso.auth.entity.User;

public interface UserRepository extends JpaRepository<User, Integer> {
	
	boolean existsByUserName(String userName);
	
}
