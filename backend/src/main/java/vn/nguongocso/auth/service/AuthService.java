package vn.nguongocso.auth.service;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.core.userdetails.UsernameNotFoundException;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

import vn.nguongocso.auth.dto.request.LoginRequest;
import vn.nguongocso.auth.dto.response.LoginResponse;
import vn.nguongocso.config.JwtTokenProvider;
import vn.nguongocso.exception.BusinessException;

/**
 * Service responsible for authenticating users and issuing JWT tokens.
 *
 * <p>This service validates user credentials, establishes the authenticated
 * security context and generates the JWT returned to the client.</p>
 */
@Service
@RequiredArgsConstructor
@Slf4j
public class AuthService {

    private final CustomUserDetailsService userDetailsService;
    private final JwtTokenProvider tokenProvider;
    private final PasswordEncoder passwordEncoder;

    /**
     * Authenticates a user and returns a JWT access token.
     *
     * <p>The authentication process consists of:
     * <ol>
     *     <li>Loading the user within the specified organization.</li>
     *     <li>Validating the supplied password.</li>
     *     <li>Creating the Spring Security authentication.</li>
     *     <li>Generating a JWT access token.</li>
     *     <li>Building the login response.</li>
     * </ol>
     *
     * @param request login request
     * @return login response containing JWT and user information
     * @throws BusinessException if authentication fails or an unexpected error occurs
     */
    public LoginResponse login(LoginRequest request) {
        try {
            System.out.println("=== LOGIN ===");
            log.info("Đăng nhập: user={}, org={}", request.getUsername(), request.getOrganizationCode());

            // 1. Load user
            CustomUserDetails userDetails = loadUser(request);

            // 2. Kiểm tra mật khẩu
            validatePassword(request, userDetails);

            // 3. Tạo authentication và set vào SecurityContext
            Authentication authentication =
                    buildAuthentication(userDetails);
            // 4. Sinh JWT
            String token = tokenProvider.generateToken(authentication);

            log.info("Đăng nhập thành công: user={}", request.getUsername());

            return buildLoginResponse(userDetails, token);

        } catch (UsernameNotFoundException e) {
            log.error("User không tồn tại: {}", request.getUsername());
            throw new BusinessException("Tài khoản không tồn tại");

        } catch (BusinessException e) {
            throw e;

        } catch (Exception e) {
            log.error("Lỗi không xác định khi đăng nhập: user={}", request.getUsername(), e);
            throw new BusinessException("Lỗi hệ thống, vui lòng thử lại sau");
        }
    }

    private CustomUserDetails loadUser(LoginRequest request) {

        return (CustomUserDetails)
                userDetailsService.loadUserByUsernameAndOrg(
                        request.getUsername(),
                        request.getOrganizationCode());
    }

    private void validatePassword(
            LoginRequest request,
            CustomUserDetails userDetails) {

        log.info("Password match = {}",
                passwordEncoder.matches(
                        request.getPassword(),
                        userDetails.getPassword()
                ));
        if (!passwordEncoder.matches(
                request.getPassword(),
                userDetails.getPassword())) {
            throw new BusinessException("Sai mật khẩu");
        }
    }

    private Authentication buildAuthentication(
            CustomUserDetails userDetails) {

        Authentication authentication =
                new UsernamePasswordAuthenticationToken(
                        userDetails,
                        null,
                        userDetails.getAuthorities());

        SecurityContextHolder
                .getContext()
                .setAuthentication(authentication);

        return authentication;
    }

    private LoginResponse buildLoginResponse(
            CustomUserDetails userDetails,
            String token) {

        return LoginResponse.builder()
                .accessToken(token)
                .expiresIn(tokenProvider.getExpirationInSeconds())
                .tokenType("Bearer")
                .user(LoginResponse.UserInfo.builder()
                        .userId(userDetails.getUserId().toString())
                        .username(userDetails.getUsername())
                        .fullName(userDetails.getFullName())
                        .roleCode(userDetails.getRoleCode())
                        .organizationId(userDetails.getOrganizationId().toString())
                        .organizationName(userDetails.getOrganizationName())
                        .organizationCode(userDetails.getOrganizationCode())
                        .organizationType(userDetails.getOrganizationType())
                        .build()
                ).build();
    }
}