package vn.nguongocso.web;

import com.fasterxml.jackson.databind.ObjectMapper;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.http.MediaType;
import org.springframework.security.test.context.support.WithMockUser;
import org.springframework.test.context.ActiveProfiles;
import org.springframework.test.context.bean.override.mockito.MockitoBean;
import org.springframework.test.web.servlet.MockMvc;
import vn.nguongocso.config.JwtTokenProvider;
import vn.nguongocso.auth.service.CustomUserDetailsService;
import vn.nguongocso.exception.BusinessException;
import vn.nguongocso.organization.dto.request.CreateOrganizationRequest;
import vn.nguongocso.organization.dto.response.OrganizationResponse;
import vn.nguongocso.organization.enums.OrganizationType;
import vn.nguongocso.organization.service.OrganizationService;

import java.util.UUID;

import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.when;
import static org.springframework.security.test.web.servlet.request.SecurityMockMvcRequestPostProcessors.csrf;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

@SpringBootTest
@AutoConfigureMockMvc
@ActiveProfiles("test")
class OrganizationControllerTest {

    @Autowired
    private MockMvc mockMvc;

    @Autowired
    private ObjectMapper objectMapper;

    // Mock các service dùng trong controller
    @MockitoBean
    private OrganizationService organizationService;

    // Vẫn cần mock các bean cho filter (dù không dùng trực tiếp)
    @MockitoBean
    private JwtTokenProvider jwtTokenProvider;

    @MockitoBean
    private CustomUserDetailsService customUserDetailsService;

    @Test
    @WithMockUser(roles = "VT-01")
    void createOrganization_withValidData_shouldReturn201() throws Exception {
        // Given
        CreateOrganizationRequest request = new CreateOrganizationRequest();
        request.setOrganizationName("Hợp tác xã X");
        request.setOrganizationCode("HTX999");
        request.setOrganizationType(OrganizationType.COOPERATIVE);
        request.setUserName("manager_x");
        request.setPassword("123456");
        request.setFullName("Nguyễn Văn X");

        OrganizationResponse response = new OrganizationResponse();
        response.setOrganizationID(UUID.randomUUID());
        response.setOrganizationName("Hợp tác xã X");
        response.setOrganizationCode("HTX999");
        response.setOrganizationType(OrganizationType.COOPERATIVE);

        when(organizationService.createOrganization(any(CreateOrganizationRequest.class)))
                .thenReturn(response);

        // When & Then
        mockMvc.perform(post("/api/admin/organizations")
                        .with(csrf())
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$.code").value("HTX999"));
    }

    @Test
    @WithMockUser(roles = "VT-01")
    void createOrganization_withDuplicatedCode_shouldReturnBadRequest() throws Exception {
        CreateOrganizationRequest request = new CreateOrganizationRequest();
        request.setOrganizationName("Hợp tác xã X");
        request.setOrganizationCode("HTX999");
        request.setOrganizationType(OrganizationType.COOPERATIVE);
        request.setUserName("manager_x");
        request.setPassword("123456");
        request.setFullName("Nguyễn Văn X");

        when(organizationService.createOrganization(any(CreateOrganizationRequest.class)))
                .thenThrow(new BusinessException("Mã tổ chức đã tồn tại"));

        mockMvc.perform(post("/api/admin/organizations")
                        .with(csrf())
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.message").value("Mã tổ chức đã tồn tại"));
    }

    @Test
    void createOrganization_withoutAdminRole_shouldReturnForbidden() throws Exception {
        // Không có @WithMockUser, role mặc định là anonymous
        CreateOrganizationRequest request = new CreateOrganizationRequest();
        request.setOrganizationName("Hợp tác xã X");
        request.setOrganizationCode("HTX999");
        request.setOrganizationType(OrganizationType.COOPERATIVE);
        request.setUserName("manager_x");
        request.setPassword("123456");
        request.setFullName("Nguyễn Văn X");

        mockMvc.perform(post("/api/admin/organizations")
                        .with(csrf())
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isForbidden());
    }
}