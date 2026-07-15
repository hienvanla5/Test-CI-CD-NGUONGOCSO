package vn.nguongocso.auth.repository;

import java.util.UUID;

import org.springframework.data.jpa.repository.JpaRepository;

import vn.nguongocso.auth.entity.OrganizationUser;

public interface OrganizationUserRepository extends JpaRepository<OrganizationUser, UUID> {

}