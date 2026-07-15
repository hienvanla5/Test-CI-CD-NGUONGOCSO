package vn.nguongocso.dto.response;

import lombok.Builder;
import lombok.Data;

import java.util.UUID;

@Data
@Builder
public class UserProfileResponse {

    private UUID userId;
    private String username;
    private String fullName;
    private String phone;
    private String email;
    private String roleCode;
    private String roleName;
    private UUID organizationId;
    private String organizationCode;
    private String organizationName;
}
