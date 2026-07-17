package vn.nguongocso.unit.organization;

import org.hamcrest.Matchers;
import org.junit.jupiter.api.Test;
import static org.mockito.Mockito.*;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.http.MediaType;
import org.springframework.security.test.context.support.WithMockUser;
import static org.springframework.security.test.web.servlet.request.SecurityMockMvcRequestPostProcessors.csrf;
import org.springframework.test.context.ActiveProfiles;
import org.springframework.test.context.bean.override.mockito.MockitoBean;
import org.springframework.test.web.servlet.MockMvc;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.*;

import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;
import com.fasterxml.jackson.databind.ObjectMapper;
import vn.nguongocso.organization.dto.request.OrganizationUpdateRequest;
import vn.nguongocso.organization.dto.response.OrganizationProfileResponse;
import vn.nguongocso.organization.enums.OrganizationStatus;
import vn.nguongocso.organization.enums.OrganizationType;
import vn.nguongocso.organization.service.OrganizationService;

import java.util.UUID;

@SpringBootTest
@AutoConfigureMockMvc
@ActiveProfiles("test")
public class OrganizationControllerTest {

    @Autowired
    private MockMvc mockMvc;

    @Autowired
    private ObjectMapper objectMapper;

    @MockitoBean
    private OrganizationService organizationService;

    private final UUID orgId = UUID.randomUUID();

    @Test
    @WithMockUser(roles = "VT-02")
    void getProfile_shouldReturnOk() throws Exception {
        OrganizationProfileResponse response = OrganizationProfileResponse.builder()
                .organizationId(orgId)
                .name("HTX Xanh")
                .code("HTX001")
                .type(OrganizationType.COOPERATIVE)
                .status(OrganizationStatus.ACTIVE)
                .address("Số 1, đường A")
                .phone("0900000000")
                .email("htx@example.com")
                .build();

        when(organizationService.getCurrentOrganizationProfile()).thenReturn(response);

        mockMvc.perform(get("/api/v1/organizations/profile")
                    .with(csrf()))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.data.name").value("HTX Xanh"))
                .andExpect(jsonPath("$.data.code").value("HTX001"));
    }

    @Test
    @WithMockUser(roles = "VT-02")
    void updateProfile_shouldReturnOk_whenValidData() throws Exception {
        OrganizationUpdateRequest request = new OrganizationUpdateRequest();
        request.setName("HTX Xanh Mới");
        request.setAddress("Số 2, đường B");
        request.setPhone("0987654321");
        request.setEmail("new@htx.com");

        OrganizationProfileResponse response = OrganizationProfileResponse.builder()
                .organizationId(orgId)
                .name("HTX Xanh Mới")
                .code("HTX001")
                .type(OrganizationType.COOPERATIVE)
                .status(OrganizationStatus.ACTIVE)
                .address("Số 2, đường B")
                .phone("0987654321")
                .email("new@htx.com")
                .build();

        when(organizationService.updateCurrentOrganization(any(OrganizationUpdateRequest.class))).thenReturn(response);

        mockMvc.perform(put("/api/v1/organizations/profile")
                    .with(csrf())
                    .contentType(MediaType.APPLICATION_JSON)
                    .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.data.name").value("HTX Xanh Mới"))
                .andExpect(jsonPath("$.data.phone").value("0987654321"));
    }

    @Test
    @WithMockUser(roles = "VT-02")
    void updateProfile_shouldReturnBadRequest_whenInvalidData() throws Exception {
        OrganizationUpdateRequest request = new OrganizationUpdateRequest();
        request.setName("HTX Xanh");
        request.setEmail("invalid-email");

        mockMvc.perform(put("/api/v1/organizations/profile")
                    .with(csrf())
                    .contentType(MediaType.APPLICATION_JSON)
                    .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.message").value(Matchers.containsString("Email không hợp lệ")));
    }

    @Test
    @WithMockUser(roles = "VT-03")
    void updateProfile_withoutPermission_shouldReturnForbidden() throws Exception {
        OrganizationUpdateRequest request = new OrganizationUpdateRequest();
        request.setName("HTX Xanh");

        mockMvc.perform(put("/api/v1/organizations/profile")
                    .with(csrf())
                    .contentType(MediaType.APPLICATION_JSON)
                    .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isForbidden());
    }

    @Test
    @WithMockUser(roles = "VT-01")
    void updateOrganizationById_shouldReturnOk_whenAdmin() throws Exception {
        UUID targetId = UUID.randomUUID();
        OrganizationUpdateRequest request = new OrganizationUpdateRequest();
        request.setName("Admin sửa");

        OrganizationProfileResponse response = OrganizationProfileResponse.builder()
                .organizationId(targetId)
                .name("Admin sửa")
                .code("ORG001")
                .build();

        when(organizationService.updateOrganizationById(eq(targetId), any(OrganizationUpdateRequest.class))).thenReturn(response);

        mockMvc.perform(put("/api/v1/admin/organizations/profile/{id}", targetId)
                    .with(csrf())
                    .contentType(MediaType.APPLICATION_JSON)
                    .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.data.name").value("Admin sửa"));
    }
}
