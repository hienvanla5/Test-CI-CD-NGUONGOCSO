package vn.nguongocso.dto.request;

import jakarta.validation.constraints.NotBlank;
import lombok.Data;

@Data
public class LoginRequest {
    @NotBlank
    private String username;

    @NotBlank
    private String password;

    private String organizationCode; // Optional, nếu user thuộc nhiều tổ chức
}