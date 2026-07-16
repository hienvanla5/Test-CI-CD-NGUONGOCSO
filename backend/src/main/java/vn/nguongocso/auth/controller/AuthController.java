package vn.nguongocso.auth.controller;

import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.*;
import vn.nguongocso.auth.service.AuthService;
import vn.nguongocso.auth.service.CustomUserDetails;
import vn.nguongocso.common.ApiResult;
import vn.nguongocso.dto.request.LoginRequest;
import vn.nguongocso.dto.response.LoginResponse;
import vn.nguongocso.dto.response.UserProfileResponse;

@RestController
@RequestMapping("/api/v1/auth")
@RequiredArgsConstructor
public class AuthController {

    private final AuthService authService;

    @PostMapping("/login")
    public ResponseEntity<ApiResult<LoginResponse>> login(@Valid @RequestBody LoginRequest request) {
        return ResponseEntity.ok(ApiResult.success(authService.login(request)));
    }

    @GetMapping("/me")
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<ApiResult<UserProfileResponse>> getCurrentUser() {

        Authentication auth = SecurityContextHolder.getContext().getAuthentication();
        CustomUserDetails userDetails = (CustomUserDetails) auth.getPrincipal();

        UserProfileResponse response = UserProfileResponse.builder()
                .userId(userDetails.getUserId())
                .username(userDetails.getUsername())
                .fullName(userDetails.getFullName())
                .roleCode(userDetails.getRoleCode())
                .roleName(userDetails.getRoleName())
                .organizationId(userDetails.getOrganizationId())
                .organizationCode(userDetails.getOrganizationCode())
                .organizationName(userDetails.getOrganizationName())
                .build();

        return ResponseEntity.ok(ApiResult.success(response));
    }
}
