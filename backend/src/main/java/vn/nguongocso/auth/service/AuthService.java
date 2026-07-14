package vn.nguongocso.auth.service;

import lombok.RequiredArgsConstructor;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import vn.nguongocso.config.JwtTokenProvider;
import vn.nguongocso.dto.request.LoginRequest;
import vn.nguongocso.dto.response.LoginResponse;
import vn.nguongocso.exception.BusinessException;

@Service
@RequiredArgsConstructor
public class AuthService {

    private final CustomUserDetailsService userDetailsService;
    private final JwtTokenProvider tokenProvider;
    private final PasswordEncoder passwordEncoder;

    public LoginResponse login(LoginRequest request) {
        CustomUserDetails userDetails = (CustomUserDetails) userDetailsService.loadUserByUsernameAndOrg(request.getUsername(), request.getOrganizationCode());

        if (!passwordEncoder.matches(request.getPassword(), userDetails.getPassword())) {
            throw new BusinessException("Invalid credentials");
        }

        UsernamePasswordAuthenticationToken auth = new UsernamePasswordAuthenticationToken(
                userDetails, null, userDetails.getAuthorities()
        );
        SecurityContextHolder.getContext().setAuthentication(auth);

        String token = tokenProvider.generateToken(auth);

        return LoginResponse.builder()
                .accessToken(token)
                .expiresIn(tokenProvider.getExpirationInSeconds())
                .user(LoginResponse.UserInfo.builder()
                        .userId(userDetails.getUserId().toString())
                        .username(userDetails.getUsername())
                        .fullName(userDetails.getFullName())
                        .roleCode(userDetails.getRoleCode())
                        .organizationId(userDetails.getOrganizationId().toString())
                        .organizationCode(userDetails.getOrganizationCode())
                        .build()
                ).build();
    }
}
