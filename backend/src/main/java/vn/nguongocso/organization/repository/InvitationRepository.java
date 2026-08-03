package vn.nguongocso.organization.repository;

import java.util.List;
import java.util.Optional;
import java.util.UUID;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import vn.nguongocso.organization.entity.Invitation;
import vn.nguongocso.organization.enums.InvitationStatus;

@Repository
public interface InvitationRepository extends JpaRepository<Invitation, UUID> {

    Optional<Invitation> findByToken(String token);

    List<Invitation> findByEmailAndOrganizationOrganizationIdAndStatus(
            String email, 
            UUID organizationId, 
            InvitationStatus status
    );
}
