package vn.nguongocso.organization.dto.response;

import java.time.LocalDateTime;
import lombok.Builder;
import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
@Builder
public class InvitationPublicResponse {
    private String email;
    private String organizationName;
    private String roleName;
    private String status;
    private LocalDateTime expiryDate;
}
