package vn.nguongocso.trace.controller;

import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.when;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

import java.time.LocalDateTime;
import java.util.List;
import java.util.UUID;

import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.boot.test.mock.mockito.MockBean;
import org.springframework.http.MediaType;
import org.springframework.security.test.context.support.WithMockUser;
import org.springframework.test.web.servlet.MockMvc;

import com.fasterxml.jackson.databind.ObjectMapper;

import vn.nguongocso.exception.BusinessException;
import vn.nguongocso.trace.dto.request.CreateShipmentRequest;
import vn.nguongocso.trace.dto.response.ShipmentResponse;
import vn.nguongocso.trace.dto.response.TraceCodeResponse;
import vn.nguongocso.trace.enums.ShipmentStatus;
import vn.nguongocso.trace.enums.TraceCodeStatus;
import vn.nguongocso.trace.service.ShipmentService;

@SpringBootTest
@AutoConfigureMockMvc
@WithMockUser(roles = "USER")
class ShipmentControllerTest {

    @Autowired
    private MockMvc mockMvc;

    @Autowired
    private ObjectMapper objectMapper;

    @MockBean
    private ShipmentService shipmentService;

    private final UUID productionLotId = UUID.randomUUID();
    private final UUID shipmentId = UUID.randomUUID();

    // ==================== TEST THÀNH CÔNG ====================

    @Test
    void createShipment_ShouldReturnCreated_WhenRequestValid() throws Exception {
        CreateShipmentRequest request = new CreateShipmentRequest();
        request.setProductionLotId(productionLotId);
        request.setName("Lô hàng cà chua số 1");
        request.setTotalQuantity(50L);
        request.setPackagingInfo("Đóng thùng 10kg");

        ShipmentResponse response = buildSuccessResponse();

        when(shipmentService.createShipment(any(CreateShipmentRequest.class)))
                .thenReturn(response);

        mockMvc.perform(post("/api/v1/shipments")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$.success").value(true))
                .andExpect(jsonPath("$.status").value(200))
                .andExpect(jsonPath("$.data.id").value(shipmentId.toString()))
                .andExpect(jsonPath("$.data.name").value("Lô hàng cà chua số 1"))
                .andExpect(jsonPath("$.data.totalQuantity").value(50))
                .andExpect(jsonPath("$.data.packagingInfo").value("Đóng thùng 10kg"))
                .andExpect(jsonPath("$.data.status").value("CODE_PRINTED"))
                .andExpect(jsonPath("$.data.traceCodes.length()").value(2));
    }

    // ==================== TEST VALIDATION LỖI ====================

    @Test
    void createShipment_ShouldReturnBadRequest_WhenProductionLotIdMissing() throws Exception {
        CreateShipmentRequest request = new CreateShipmentRequest();
        request.setName("Lô hàng cà chua số 1");
        request.setTotalQuantity(50L);

        mockMvc.perform(post("/api/v1/shipments")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isBadRequest());
        // Không cần kiểm tra chi tiết body vì validation do Spring tự động trả về
    }

    @Test
    void createShipment_ShouldReturnBadRequest_WhenNameMissing() throws Exception {
        CreateShipmentRequest request = new CreateShipmentRequest();
        request.setProductionLotId(productionLotId);
        request.setTotalQuantity(50L);

        mockMvc.perform(post("/api/v1/shipments")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isBadRequest());
    }

    @Test
    void createShipment_ShouldReturnBadRequest_WhenTotalQuantityZeroOrNegative() throws Exception {
        CreateShipmentRequest request = new CreateShipmentRequest();
        request.setProductionLotId(productionLotId);
        request.setName("Lô hàng cà chua số 1");
        request.setTotalQuantity(0L);

        mockMvc.perform(post("/api/v1/shipments")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isBadRequest());
    }

    // ==================== TEST SERVICE NÉM BUSINESS EXCEPTION ====================

    @Test
    void createShipment_ShouldReturnBadRequest_WhenProductionLotNotFound() throws Exception {
        CreateShipmentRequest request = new CreateShipmentRequest();
        request.setProductionLotId(productionLotId);
        request.setName("Lô hàng cà chua số 1");
        request.setTotalQuantity(50L);
        request.setPackagingInfo("Đóng thùng 10kg");

        when(shipmentService.createShipment(any(CreateShipmentRequest.class)))
                .thenThrow(new BusinessException("Không tìm thấy lô sản xuất."));

        mockMvc.perform(post("/api/v1/shipments")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.success").value(false))
                .andExpect(jsonPath("$.status").value(400))
                .andExpect(jsonPath("$.message").value("Không tìm thấy lô sản xuất."));
    }

    @Test
    void createShipment_ShouldReturnBadRequest_WhenCodeRangeLimitExceeded() throws Exception {
        CreateShipmentRequest request = new CreateShipmentRequest();
        request.setProductionLotId(productionLotId);
        request.setName("Lô hàng cà chua số 1");
        request.setTotalQuantity(50L);
        request.setPackagingInfo("Đóng thùng 10kg");

        when(shipmentService.createShipment(any(CreateShipmentRequest.class)))
                .thenThrow(new BusinessException("Số lượng tem vượt quá hạn mức dải mã còn lại."));

        mockMvc.perform(post("/api/v1/shipments")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.success").value(false))
                .andExpect(jsonPath("$.status").value(400))
                .andExpect(jsonPath("$.message").value("Số lượng tem vượt quá hạn mức dải mã còn lại."));
    }

    // ==================== HELPER ====================

    private ShipmentResponse buildSuccessResponse() {
        TraceCodeResponse traceCode1 = TraceCodeResponse.builder()
                .id(UUID.randomUUID())
                .codeValue("NCL00000001")
                .status(TraceCodeStatus.INACTIVE)
                .build();

        TraceCodeResponse traceCode2 = TraceCodeResponse.builder()
                .id(UUID.randomUUID())
                .codeValue("NCL00000002")
                .status(TraceCodeStatus.INACTIVE)
                .build();

        return ShipmentResponse.builder()
                .id(shipmentId)
                .productionLotId(productionLotId)
                .productionLotName("Lô cà chua vụ Đông")
                .name("Lô hàng cà chua số 1")
                .totalQuantity(50L)
                .packagingInfo("Đóng thùng 10kg")
                .status(ShipmentStatus.CODE_PRINTED)
                .traceCodes(List.of(traceCode1, traceCode2))
                .createdByName("Nguyễn Văn A")
                .createdAt(LocalDateTime.now())
                .build();
    }
}