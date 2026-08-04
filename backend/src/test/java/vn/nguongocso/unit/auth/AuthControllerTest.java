package vn.nguongocso.unit.auth;

import com.fasterxml.jackson.databind.ObjectMapper;
import org.junit.jupiter.api.AfterEach;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.WebMvcTest;
import org.springframework.context.annotation.Import;
import org.springframework.http.MediaType;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContext;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.test.context.ActiveProfiles;
import org.springframework.test.context.bean.override.mockito.MockitoBean;
import org.springframework.test.web.servlet.MockMvc;
import vn.nguongocso.auth.controller.AuthController;
import vn.nguongocso.auth.service.AuthService;
import vn.nguongocso.auth.service.CustomUserDetails;
import vn.nguongocso.auth.service.CustomUserDetailsService;
import vn.nguongocso.config.JwtTokenProvider;
import vn.nguongocso.config.SecurityConfig;
import vn.nguongocso.permission.service.PermissionChecker;

import java.util.List;
import java.util.UUID;

import static org.mockito.Mockito.*;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

@WebMvcTest(AuthController.class)
@Import(SecurityConfig.class)
@ActiveProfiles("test")
public class AuthControllerTest {

    @Autowired
    private MockMvc mockMvc;

    @MockitoBean
    private AuthService authService;

    @MockitoBean
    private JwtTokenProvider jwtTokenProvider;

    @MockitoBean
    private CustomUserDetailsService customUserDetailsService;

    @MockitoBean
    private PermissionChecker permissionChecker;

    private CustomUserDetails userDetails;
    private UUID userId;
    private UUID orgId;

    @BeforeEach
    void setUp() {
        userId = UUID.randomUUID();
        orgId = UUID.randomUUID();

        userDetails = mock(CustomUserDetails.class);
        when(userDetails.getUserId()).thenReturn(userId);
        when(userDetails.getUsername()).thenReturn("laodai");
        when(userDetails.getFullName()).thenReturn("Lao Dai");
        when(userDetails.getRoleCode()).thenReturn("VT-02");
        when(userDetails.getRoleName()).thenReturn("Quản lý HTX");
        when(userDetails.getOrganizationId()).thenReturn(orgId);
        when(userDetails.getOrganizationCode()).thenReturn("HTX_XYZ");
        when(userDetails.getOrganizationName()).thenReturn("HTX Nông Nghiệp XYZ");
        when(userDetails.getOrganizationType()).thenReturn(vn.nguongocso.organization.enums.OrganizationType.COOPERATIVE);

        Authentication authentication = mock(Authentication.class);
        when(authentication.getPrincipal()).thenReturn(userDetails);
        when(authentication.isAuthenticated()).thenReturn(true);
        
        SecurityContext securityContext = mock(SecurityContext.class);
        when(securityContext.getAuthentication()).thenReturn(authentication);
        SecurityContextHolder.setContext(securityContext);
    }

    @AfterEach
    void tearDown() {
        SecurityContextHolder.clearContext();
    }

    @Test
    void getCurrentUser_shouldReturnProfileWithPermissions_whenAuthenticated() throws Exception {
        List<String> mockPermissions = List.of("farm_area:CREATE", "production_lot:READ");
        when(permissionChecker.getPermissionsForCurrentUser()).thenReturn(mockPermissions);

        mockMvc.perform(get("/api/v1/auth/me")
                        .contentType(MediaType.APPLICATION_JSON))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.success").value(true))
                .andExpect(jsonPath("$.data.userId").value(userId.toString()))
                .andExpect(jsonPath("$.data.username").value("laodai"))
                .andExpect(jsonPath("$.data.roleCode").value("VT-02"))
                .andExpect(jsonPath("$.data.permissions[0]").value("farm_area:CREATE"))
                .andExpect(jsonPath("$.data.permissions[1]").value("production_lot:READ"));

        verify(permissionChecker, times(1)).getPermissionsForCurrentUser();
    }
}
