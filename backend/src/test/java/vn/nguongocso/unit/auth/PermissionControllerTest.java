package vn.nguongocso.unit.auth;

import com.fasterxml.jackson.databind.ObjectMapper;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.WebMvcTest;
import org.springframework.context.annotation.Import;
import org.springframework.http.MediaType;
import org.springframework.security.test.context.support.WithMockUser;
import org.springframework.test.context.ActiveProfiles;
import org.springframework.test.context.bean.override.mockito.MockitoBean;
import org.springframework.test.web.servlet.MockMvc;
import vn.nguongocso.auth.controller.PermissionController;
import vn.nguongocso.auth.dto.request.AddMemberRequest;
import vn.nguongocso.auth.dto.request.AssignRoleRequest;
import vn.nguongocso.auth.dto.response.OrganizationUserResponse;
import vn.nguongocso.auth.service.CustomUserDetailsService;
import vn.nguongocso.auth.service.PermissionService;
import vn.nguongocso.config.JwtTokenProvider;
import vn.nguongocso.config.SecurityConfig;
import vn.nguongocso.permission.service.PermissionChecker;

import java.util.Collections;
import java.util.UUID;

import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;
import static org.springframework.security.test.web.servlet.request.SecurityMockMvcRequestPostProcessors.csrf;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.*;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

/**
 * Unit test xác minh kiểm tra phân quyền chi tiết trong PermissionController.
 */
@WebMvcTest(PermissionController.class)
@Import(SecurityConfig.class)
@ActiveProfiles("test")
public class PermissionControllerTest {

    @Autowired
    private MockMvc mockMvc;

    @Autowired
    private ObjectMapper objectMapper;

    @MockitoBean
    private PermissionService permissionService;

    @MockitoBean
    private JwtTokenProvider jwtTokenProvider;

    @MockitoBean
    private CustomUserDetailsService customUserDetailsService;

    @MockitoBean
    private PermissionChecker permissionChecker;

    @Test
    @WithMockUser(roles = "VT-02")
    void getMembers_shouldReturnOk_whenAuthorized() throws Exception {
        OrganizationUserResponse member = OrganizationUserResponse.builder()
                .userId(UUID.randomUUID())
                .fullName("Nguyen Van Member")
                .build();

        when(permissionService.getMembersOfCurrentOrganization()).thenReturn(Collections.singletonList(member));

        mockMvc.perform(get("/api/v1/organization/members")
                        .with(csrf()))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.data[0].fullName").value("Nguyen Van Member"));

        verify(permissionChecker).check("organization_user", "READ");
    }

    @Test
    @WithMockUser(roles = "VT-02")
    void assignRole_shouldReturnOk_whenAuthorized() throws Exception {
        AssignRoleRequest request = new AssignRoleRequest();
        request.setUserId(UUID.randomUUID());
        request.setRoleId(3);

        OrganizationUserResponse response = OrganizationUserResponse.builder()
                .userId(request.getUserId())
                .roleCode("VT-03")
                .build();

        when(permissionService.assignRole(any(AssignRoleRequest.class))).thenReturn(response);

        mockMvc.perform(put("/api/v1/organization/members/roles")
                        .with(csrf())
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.data.roleCode").value("VT-03"));

        verify(permissionChecker).check("organization_user", "UPDATE");
    }

    @Test
    @WithMockUser(roles = "VT-02")
    void addMember_shouldReturnOk_whenAuthorized() throws Exception {
        AddMemberRequest request = new AddMemberRequest();
        request.setUsername("member123");
        request.setPassword("password123");
        request.setFullName("Nguyen Van Member");
        request.setRoleId(3);

        OrganizationUserResponse response = OrganizationUserResponse.builder()
                .username("member123")
                .roleCode("VT-03")
                .build();

        when(permissionService.addMember(any(AddMemberRequest.class))).thenReturn(response);

        mockMvc.perform(post("/api/v1/organization/members")
                        .with(csrf())
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.data.username").value("member123"))
                .andExpect(jsonPath("$.data.roleCode").value("VT-03"));

        verify(permissionChecker).check("organization_user", "CREATE");
    }

    @Test
    @WithMockUser(roles = "VT-03")
    void addMember_shouldReturnForbidden_whenRoleNotAuthorized() throws Exception {
        AddMemberRequest request = new AddMemberRequest();
        request.setUsername("member123");
        request.setPassword("password123");
        request.setFullName("Nguyen Van Member");
        request.setRoleId(3);

        mockMvc.perform(post("/api/v1/organization/members")
                        .with(csrf())
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isForbidden());
    }
}
