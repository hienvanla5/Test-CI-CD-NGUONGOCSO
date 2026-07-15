package vn.nguongocso.auth.repository;

import java.util.Optional;
import java.util.UUID;

import org.springframework.data.jpa.repository.JpaRepository;

import vn.nguongocso.auth.entity.User;

public interface UserRepository extends JpaRepository<User, UUID> {

    boolean existsByUserName(String userName);

    boolean existsByEmail(String email);

    Optional<User> findByUserName(String userName);

}