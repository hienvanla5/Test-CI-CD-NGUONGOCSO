package vn.nguongocso.productionLotService;

import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.Mockito.when;
import static org.springframework.security.test.web.servlet.request.SecurityMockMvcRequestPostProcessors.csrf;
import static org.springframework.security.test.web.servlet.request.SecurityMockMvcRequestPostProcessors.user;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.put;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

import com.fasterxml.jackson.databind.ObjectMapper;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.http.MediaType;
import org.springframework.security.test.context.support.WithMockUser;
import org.springframework.test.context.ActiveProfiles;
import org.springframework.test.context.bean.override.mockito.MockitoBean;
import org.springframework.test.web.servlet.MockMvc;

import vn.nguongocso.auth.entity.Role;
import vn.nguongocso.auth.entity.User;
import vn.nguongocso.auth.service.CustomUserDetails;
import vn.nguongocso.farm.dto.request.UpdateProductionLotRequest;
import vn.nguongocso.farm.dto.response.UpdateProductionLotResponse;
import vn.nguongocso.farm.service.ProductionLotService;
import vn.nguongocso.organization.entity.Organization;
import vn.nguongocso.organization.entity.OrganizationUser;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.UUID;

@SpringBootTest
@AutoConfigureMockMvc
@ActiveProfiles("test")
class ProductionLotControllerTest {

    @Autowired
    private MockMvc mockMvc;

    @Autowired
    private ObjectMapper objectMapper;

    @MockitoBean
    private ProductionLotService productionLotService;

    private UUID lotId;
    private CustomUserDetails userDetails;
    private UpdateProductionLotRequest validRequest;

    @BeforeEach
    void setUp() {
        lotId = UUID.randomUUID();

        // Khởi tạo user giả lập
        User user = new User();
        user.setUserId(UUID.randomUUID());
        user.setUserName("quanly_htx");

        Organization organization = new Organization();
        organization.setOrganizationId(UUID.randomUUID());

        Role role = new Role();
        role.setCode("VT-02");

        OrganizationUser orgUser = new OrganizationUser();
        orgUser.setOrganization(organization);
        orgUser.setUser(user);
        orgUser.setRole(role);

        userDetails = new CustomUserDetails(user, orgUser, role);

        // Khởi tạo request hợp lệ
        validRequest = new UpdateProductionLotRequest();
        validRequest.setName("Lô nông sản ngon");
        validRequest.setFarmAreaId(UUID.randomUUID());
        validRequest.setProductCategoryId(UUID.randomUUID());
        validRequest.setExpectedQuantity(500.0);
        validRequest.setPlantingDate(LocalDate.now());
    }

    @Test
    void update_shouldReturn200_whenRequestIsValid() throws Exception {
        // Given
        UpdateProductionLotResponse response = UpdateProductionLotResponse.builder()
                .id(lotId)
                .name("Lô nông sản ngon")
                .farmAreaId(validRequest.getFarmAreaId())
                .productCategoryId(validRequest.getProductCategoryId())
                .expectedQuantity(500.0)
                .plantingDate(validRequest.getPlantingDate())
                .status("DRAFT")
                .updatedAt(LocalDateTime.now())
                .build();

        when(productionLotService.updateProductionLot(eq(lotId), any(UpdateProductionLotRequest.class), any(CustomUserDetails.class)))
                .thenReturn(response);

        // When & Then
        mockMvc.perform(put("/api/v1/production-lots/" + lotId)
                        .with(user(userDetails)) // Gán CustomUserDetails vào Authentication Principal
                        .with(csrf())
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(validRequest)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.success").value(true))
                .andExpect(jsonPath("$.data.name").value("Lô nông sản ngon"))
                .andExpect(jsonPath("$.data.status").value("DRAFT"));
    }

    @Test
    void update_shouldReturn400_whenValidationFails() throws Exception {
        // Given: Tên lô trống và sản lượng âm
        UpdateProductionLotRequest invalidRequest = new UpdateProductionLotRequest();
        invalidRequest.setName("");
        invalidRequest.setFarmAreaId(UUID.randomUUID());
        invalidRequest.setProductCategoryId(UUID.randomUUID());
        invalidRequest.setExpectedQuantity(-10.0);
        invalidRequest.setPlantingDate(LocalDate.now());

        // When & Then
        mockMvc.perform(put("/api/v1/production-lots/" + lotId)
                        .with(user(userDetails))
                        .with(csrf())
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(invalidRequest)))
                .andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.success").value(false))
                .andExpect(jsonPath("$.message").value("Dữ liệu không hợp lệ"));
    }

    @Test
    @WithMockUser(roles = "VT-06") // Vai trò Người tiêu dùng không có quyền sửa
    void update_shouldReturn403_whenUserHasNoPermission() throws Exception {
        // When & Then
        mockMvc.perform(put("/api/v1/production-lots/" + lotId)
                        .with(csrf())
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(validRequest)))
                .andExpect(status().isForbidden())
                .andExpect(jsonPath("$.success").value(false));
    }
}
