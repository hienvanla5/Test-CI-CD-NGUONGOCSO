package vn.nguongocso.trace.controller;

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
import vn.nguongocso.auth.service.CustomUserDetailsService;
import vn.nguongocso.config.JwtTokenProvider;
import vn.nguongocso.config.SecurityConfig;
import vn.nguongocso.exception.BusinessException;
import vn.nguongocso.trace.dto.request.CreateShipmentRequest;
import vn.nguongocso.trace.dto.response.ShipmentResponse;
import vn.nguongocso.trace.enums.ShipmentStatus;
import vn.nguongocso.trace.service.ShipmentService;

import java.util.Collections;
import java.util.UUID;

import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.when;
import static org.springframework.security.test.web.servlet.request.SecurityMockMvcRequestPostProcessors.csrf;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

@WebMvcTest(ShipmentController.class)
@Import(SecurityConfig.class)
@ActiveProfiles("test")
class ShipmentControllerTest {

    @Autowired
    private MockMvc mockMvc;

    @Autowired
    private ObjectMapper objectMapper;

    @MockitoBean
    private ShipmentService shipmentService;

    @MockitoBean
    private JwtTokenProvider jwtTokenProvider;

    @MockitoBean
    private CustomUserDetailsService customUserDetailsService;

    // --- ENDPOINT: POST /api/v1/shipments ---

    @Test
    @WithMockUser
    void createShipment_shouldReturnCreated_whenValidRequest() throws Exception {
        // Given
        CreateShipmentRequest request = new CreateShipmentRequest();
        request.setProductionLotId(UUID.randomUUID());
        request.setName("Lô hàng xuất khẩu");
        request.setTotalQuantity(100L);
        request.setPackagingInfo("Hộp");

        ShipmentResponse response = ShipmentResponse.builder()
                .id(UUID.randomUUID())
                .productionLotId(request.getProductionLotId())
                .name(request.getName())
                .totalQuantity(request.getTotalQuantity())
                .status(ShipmentStatus.CODE_PRINTED)
                .traceCodes(Collections.emptyList())
                .build();

        when(shipmentService.createShipment(any(CreateShipmentRequest.class))).thenReturn(response);

        // When & Then
        mockMvc.perform(post("/api/v1/shipments")
                        .with(csrf()) // Thêm CSRF token để vượt qua filter của Spring Security
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isCreated()) // HttpStatus.CREATED (201)
                .andExpect(jsonPath("$.data.name").value("Lô hàng xuất khẩu"))
                .andExpect(jsonPath("$.data.totalQuantity").value(100))
                .andExpect(jsonPath("$.data.status").value("CODE_PRINTED"));
    }

    @Test
    @WithMockUser
    void createShipment_shouldReturnBadRequest_whenValidationErrorOccurs() throws Exception {
        // Given: Request không có tên lô hàng và số lượng <= 0 (Vi phạm Validation)
        CreateShipmentRequest request = new CreateShipmentRequest();
        request.setProductionLotId(UUID.randomUUID());
        request.setName(""); // Trống
        request.setTotalQuantity(-5L); // Phải là số dương

        // When & Then
        mockMvc.perform(post("/api/v1/shipments")
                        .with(csrf())
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isBadRequest()); // validation thất bại trả về 400 Bad Request
    }

    @Test
    @WithMockUser
    void createShipment_shouldReturnBadRequest_whenServiceThrowsBusinessException() throws Exception {
        // Given
        CreateShipmentRequest request = new CreateShipmentRequest();
        request.setProductionLotId(UUID.randomUUID());
        request.setName("Lô hàng hợp lệ");
        request.setTotalQuantity(50L);

        when(shipmentService.createShipment(any(CreateShipmentRequest.class)))
                .thenThrow(new BusinessException("Tổ chức chưa được cấp dải mã truy xuất."));

        // When & Then
        mockMvc.perform(post("/api/v1/shipments")
                        .with(csrf())
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.message").value("Tổ chức chưa được cấp dải mã truy xuất."));
    }

    // --- ENDPOINT: POST /api/v1/shipments/{id}/activate ---

    @Test
    @WithMockUser
    void activateStamps_shouldReturnOk_whenValidId() throws Exception {
        // Given
        UUID shipmentId = UUID.randomUUID();
        ShipmentResponse response = ShipmentResponse.builder()
                .id(shipmentId)
                .name("Lô hàng đã kích hoạt")
                .status(ShipmentStatus.ACTIVATED)
                .build();

        when(shipmentService.activateShipmentStamps(shipmentId)).thenReturn(response);

        // When & Then
        mockMvc.perform(post("/api/v1/shipments/{id}/activate", shipmentId)
                        .with(csrf()))
                .andExpect(status().isOk()) // Trả về 200 OK
                .andExpect(jsonPath("$.data.status").value("ACTIVATED"))
                .andExpect(jsonPath("$.data.id").value(shipmentId.toString()));
    }

    @Test
    @WithMockUser
    void activateStamps_shouldReturnBadRequest_whenBusinessException() throws Exception {
        // Given
        UUID shipmentId = UUID.randomUUID();
        when(shipmentService.activateShipmentStamps(shipmentId))
                .thenThrow(new BusinessException("Tem đã được kích hoạt trước đó."));

        // When & Then
        mockMvc.perform(post("/api/v1/shipments/{id}/activate", shipmentId)
                        .with(csrf()))
                .andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.message").value("Tem đã được kích hoạt trước đó."));
    }
}
