package vn.nguongocso.auth.service;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.core.userdetails.UsernameNotFoundException;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

import vn.nguongocso.auth.dto.request.LoginRequest;
import vn.nguongocso.auth.dto.response.LoginResponse;
import vn.nguongocso.config.JwtTokenProvider;
import vn.nguongocso.exception.BusinessException;

@Slf4j
@Service
@RequiredArgsConstructor
public class AuthService {

    private final CustomUserDetailsService userDetailsService;
    private final JwtTokenProvider tokenProvider;
    private final PasswordEncoder passwordEncoder;

    public LoginResponse login(LoginRequest request) {
        try {
            log.info("Đăng nhập: user={}, org={}", request.getUsername(), request.getOrganizationCode());

            // 1. Load user
            CustomUserDetails userDetails = (CustomUserDetails) userDetailsService
                    .loadUserByUsernameAndOrg(request.getUsername(), request.getOrganizationCode());

            // 2. Kiểm tra mật khẩu
            if (!passwordEncoder.matches(request.getPassword(), userDetails.getPassword())) {
                log.warn("Sai mật khẩu: user={}", request.getUsername());
                throw new BusinessException("Sai mật khẩu");
            }

            // 3. Tạo authentication và set vào SecurityContext
            UsernamePasswordAuthenticationToken auth = new UsernamePasswordAuthenticationToken(
                    userDetails, null, userDetails.getAuthorities()
            );
            SecurityContextHolder.getContext().setAuthentication(auth);

            // 4. Sinh JWT
            String token = tokenProvider.generateToken(auth);

            log.info("Đăng nhập thành công: user={}", request.getUsername());

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
                            .build()
                    ).build();

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
}