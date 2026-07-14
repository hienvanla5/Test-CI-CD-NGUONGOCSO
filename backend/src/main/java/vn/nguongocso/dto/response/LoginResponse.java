package vn.nguongocso.dto.response;

import lombok.Builder;
import lombok.Data;

@Data
@Builder
public class LoginResponse {
    private String accessToken;
    private String tokenType = "Bearer";
    private Long expiresIn;
    private UserInfo user;

    @Data
    @Builder
    public static class UserInfo {
        private String userId;
        private String username;
        private String fullName;
        private String roleCode;
        private String organizationId;
        private String organizationName;
        private String organizationCode;
    }
}