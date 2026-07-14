package vn.nguongocso.auth.repository;

import org.springframework.data.jpa.repository.JpaRepository;

public interface OrganizationRepository extends JpaRepository<OrganizationRepository, Integer> {
    
	boolean existsByName(String name);
	
}
