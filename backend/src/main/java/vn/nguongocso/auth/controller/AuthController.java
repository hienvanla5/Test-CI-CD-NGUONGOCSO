package vn.nguongocso.auth.controller;

import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.*;

import vn.nguongocso.auth.dto.request.LoginRequest;
import vn.nguongocso.auth.dto.response.LoginResponse;
import vn.nguongocso.auth.dto.response.UserProfileResponse;
import vn.nguongocso.permission.service.PermissionChecker;
import vn.nguongocso.auth.service.AuthService;
import vn.nguongocso.auth.service.CustomUserDetails;
import vn.nguongocso.common.ApiResult;

/**
 * REST controller providing authentication-related endpoints.
 *
 * <p>
 * This controller handles user authentication and exposes APIs
 * for retrieving information about the currently authenticated user.
 * </p>
 */
@RestController
@RequestMapping("/api/v1/auth")
@RequiredArgsConstructor
public class AuthController {
    private final AuthService authService;
    private final PermissionChecker permissionChecker;

    /**
     * Authenticates a user using the provided credentials.
     *
     * <p>
     * If the credentials are valid, a JWT access token and the
     * associated user information are returned.
     * </p>
     *
     * @param request login request containing username, password and
     *                organization information
     * @return authenticated user information and JWT token
     */
    @PostMapping("/login")
    public ResponseEntity<ApiResult<LoginResponse>> login(@Valid @RequestBody LoginRequest request) {
        return ResponseEntity.ok(ApiResult.success(authService.login(request)));
    }

    /**
     * Returns the profile of the currently authenticated user.
     *
     * <p>
     * The user information is obtained from the Spring Security
     * authentication context.
     * </p>
     *
     * @return profile of the authenticated user
     */
    @GetMapping("/me")
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<ApiResult<UserProfileResponse>> getCurrentUser() {

        Authentication auth = SecurityContextHolder.getContext().getAuthentication();
        CustomUserDetails userDetails = (CustomUserDetails) auth.getPrincipal();

        java.util.List<String> permissions = permissionChecker.getPermissionsForCurrentUser();

        UserProfileResponse response = UserProfileResponse.builder()
                .userId(userDetails.getUserId())
                .username(userDetails.getUsername())
                .fullName(userDetails.getFullName())
                .roleCode(userDetails.getRoleCode())
                .roleName(userDetails.getRoleName())
                .organizationId(userDetails.getOrganizationId())
                .organizationCode(userDetails.getOrganizationCode())
                .organizationName(userDetails.getOrganizationName())
                .organizationType(userDetails.getOrganizationType())
                .permissions(permissions)
                .build();

        return ResponseEntity.ok(ApiResult.success(response));
    }
}
