package vn.nguongocso.auth.dto.response;

import lombok.Builder;
import lombok.Data;
import vn.nguongocso.organization.enums.OrganizationUserStatus;

import java.time.LocalDateTime;
import java.util.UUID;

@Data
@Builder
public class OrganizationUserResponse {

    private UUID id;
    private UUID organizationId;
    private UUID userId;
    private String username;
    private String fullName;
    private Integer roleId;
    private String roleCode;
    private String roleName;
    private String customPermissions;
    private OrganizationUserStatus status;
    private LocalDateTime joinedAt;
}
