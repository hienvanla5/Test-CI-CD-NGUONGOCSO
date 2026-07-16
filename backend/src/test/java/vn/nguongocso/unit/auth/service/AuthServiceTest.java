package vn.nguongocso.unit.auth.service;

import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.security.crypto.password.PasswordEncoder;
import vn.nguongocso.auth.service.AuthService;
import vn.nguongocso.auth.service.CustomUserDetails;
import vn.nguongocso.auth.service.CustomUserDetailsService;
import vn.nguongocso.config.JwtTokenProvider;
import vn.nguongocso.dto.request.LoginRequest;
import vn.nguongocso.dto.response.LoginResponse;
import vn.nguongocso.exception.BusinessException;

import java.util.UUID;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class AuthServiceTest {

    @Mock
    private CustomUserDetailsService userDetailsService;

    @Mock
    private JwtTokenProvider tokenProvider;

    @Mock
    private PasswordEncoder passwordEncoder;

    @InjectMocks
    private AuthService authService;

    @Test
    void login_withValidCredentials_shouldReturnToken() {
        // Given
        LoginRequest request = new LoginRequest();
        request.setUsername("htx_manager");
        request.setPassword("123456");
        request.setOrganizationCode("HTX001");

        CustomUserDetails mockUser = mock(CustomUserDetails.class);
        when(userDetailsService.loadUserByUsernameAndOrg("htx_manager", "HTX001"))
                .thenReturn(mockUser);
        when(mockUser.getPassword()).thenReturn("encodedPassword");
        when(mockUser.getUserId()).thenReturn(UUID.randomUUID());
        when(mockUser.getUsername()).thenReturn("htx_manager");
        when(mockUser.getFullName()).thenReturn("Nguyễn Văn A");
        when(mockUser.getRoleCode()).thenReturn("VT-02");
        when(mockUser.getOrganizationId()).thenReturn(UUID.randomUUID());
        when(mockUser.getOrganizationCode()).thenReturn("HTX001");

        when(passwordEncoder.matches("123456", "encodedPassword")).thenReturn(true);
        when(tokenProvider.generateToken(any())).thenReturn("jwt-token-mock");
        when(tokenProvider.getExpirationInSeconds()).thenReturn(86400L);

        // When
        LoginResponse response = authService.login(request);

        // Then
        assertThat(response).isNotNull();
        assertThat(response.getAccessToken()).isEqualTo("jwt-token-mock");
        assertThat(response.getUser().getUsername()).isEqualTo("htx_manager");
        verify(tokenProvider, times(1)).generateToken(any());
    }

    @Test
    void login_withInvalidPassword_shouldThrowException() {
        // Given
        LoginRequest request = new LoginRequest();
        request.setUsername("htx_manager");
        request.setPassword("wrong");
        request.setOrganizationCode("HTX001");

        CustomUserDetails mockUser = mock(CustomUserDetails.class);
        when(userDetailsService.loadUserByUsernameAndOrg("htx_manager", "HTX001"))
                .thenReturn(mockUser);
        when(mockUser.getPassword()).thenReturn("encodedPassword");
        when(passwordEncoder.matches("wrong", "encodedPassword")).thenReturn(false);

        // When / Then
        assertThatThrownBy(() -> authService.login(request))
                .isInstanceOf(BusinessException.class)
                .hasMessageContaining("Sai mật khẩu");
    }

    @Test
    void login_withNonExistentUser_shouldThrowException() {
        // Given
        LoginRequest request = new LoginRequest();
        request.setUsername("unknown");
        request.setPassword("123456");
        request.setOrganizationCode("HTX001");

        when(userDetailsService.loadUserByUsernameAndOrg("unknown", "HTX001"))
                .thenThrow(new BusinessException("User not found"));

        // When / Then
        assertThatThrownBy(() -> authService.login(request))
                .isInstanceOf(BusinessException.class)
                .hasMessageContaining("User not found");
    }
}