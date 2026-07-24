package vn.nguongocso.trace.service;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.*;
import static org.mockito.Mockito.*;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;
import java.util.UUID;

import org.junit.jupiter.api.AfterEach;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContext;
import org.springframework.security.core.context.SecurityContextHolder;

import vn.nguongocso.auth.entity.User;
import vn.nguongocso.auth.service.CustomUserDetails;
import vn.nguongocso.exception.BusinessException;
import vn.nguongocso.farm.entity.ProductionLot;
import vn.nguongocso.farm.enums.ProductionLotStatus;
import vn.nguongocso.farm.repository.ProductionLotRepository;
import vn.nguongocso.organization.entity.Organization;
import vn.nguongocso.trace.dto.request.CreateShipmentRequest;
import vn.nguongocso.trace.dto.response.ShipmentResponse;
import vn.nguongocso.trace.dto.response.TraceCodeResponse;
import vn.nguongocso.trace.entity.CodeRange;
import vn.nguongocso.trace.entity.Shipment;
import vn.nguongocso.trace.entity.TraceCode;
import vn.nguongocso.trace.enums.ShipmentStatus;
import vn.nguongocso.trace.repository.CodeRangeRepository;
import vn.nguongocso.trace.repository.ShipmentRepository;
import vn.nguongocso.trace.repository.TraceCodeRepository;
import vn.nguongocso.trace.service.impl.ShipmentServiceImpl;


@ExtendWith(MockitoExtension.class)
class ShipmentServiceImplTest {

    @Mock
    private ShipmentRepository shipmentRepository;

    @Mock
    private TraceCodeRepository traceCodeRepository;

    @Mock
    private CodeRangeRepository codeRangeRepository;

    @Mock
    private ProductionLotRepository productionLotRepository;

    @InjectMocks
    private ShipmentServiceImpl shipmentService;

    private CustomUserDetails currentUser;
    private Organization organization;
    private ProductionLot productionLot;
    private CodeRange codeRange;
    private CreateShipmentRequest request;

    @BeforeEach
    void setUp() {
        // --- Tạo dữ liệu ---
        organization = new Organization();
        organization.setOrganizationId(UUID.randomUUID());
        organization.setName("HTX Nông Nghiệp Xanh");

        User user = new User();
        user.setUserId(UUID.randomUUID());
        user.setFullName("Nguyễn Văn A");

        // --- Mock currentUser với lenient để tránh lỗi unnecessary stubbing ---
        currentUser = mock(CustomUserDetails.class);
        lenient().when(currentUser.getUserId()).thenReturn(user.getUserId());
        lenient().when(currentUser.getOrganizationId()).thenReturn(organization.getOrganizationId());
        lenient().when(currentUser.getRoleCode()).thenReturn("VT-02");
        lenient().when(currentUser.getFullName()).thenReturn(user.getFullName());

        // --- Thiết lập SecurityContext ---
        Authentication authentication = mock(Authentication.class);
        when(authentication.getPrincipal()).thenReturn(currentUser);
        SecurityContext securityContext = mock(SecurityContext.class);
        when(securityContext.getAuthentication()).thenReturn(authentication);
        SecurityContextHolder.setContext(securityContext);

        // --- Tạo ProductionLot (PACKAGED) ---
        productionLot = new ProductionLot();
        productionLot.setId(UUID.randomUUID());
        productionLot.setName("Lô cà chua vụ Đông");
        productionLot.setOrganization(organization);
        productionLot.setStatus(ProductionLotStatus.PACKAGED);

        // --- Tạo CodeRange ---
        codeRange = new CodeRange();
        codeRange.setId(UUID.randomUUID());
        codeRange.setOrganization(organization);
        codeRange.setPrefix("NCL");
        codeRange.setTotalLimit(1000L);
        codeRange.setUsedCount(0L);

        // --- Tạo request ---
        request = new CreateShipmentRequest();
        request.setProductionLotId(productionLot.getId());
        request.setName("Lô hàng cà chua số 1");
        request.setTotalQuantity(50L);
        request.setPackagingInfo("Đóng thùng 10kg");
    }

    @AfterEach
    void clearSecurityContext() {
        SecurityContextHolder.clearContext();
    }

    // ==================== TEST THÀNH CÔNG ====================

    @Test
    void createShipment_ShouldSuccess_WhenAllValid() {
        // Arrange
        when(productionLotRepository.findById(productionLot.getId()))
                .thenReturn(Optional.of(productionLot));

        when(codeRangeRepository.findByOrganizationOrganizationId(organization.getOrganizationId()))
                .thenReturn(Optional.of(codeRange));

        when(shipmentRepository.save(any(Shipment.class)))
                .thenAnswer(invocation -> {
                    Shipment s = invocation.getArgument(0);
                    s.setId(UUID.randomUUID());
                    s.setCreatedAt(LocalDateTime.now());
                    return s;
                });

        when(traceCodeRepository.saveAll(anyList()))
                .thenAnswer(invocation -> {
                    List<TraceCode> list = invocation.getArgument(0);
                    list.forEach(tc -> {
                        tc.setId(UUID.randomUUID());
                        tc.setCreatedAt(LocalDateTime.now());
                    });
                    return list;
                });

        // Act
        ShipmentResponse response = shipmentService.createShipment(request);

        // Assert
        assertNotNull(response);
        assertEquals(request.getName(), response.getName());
        assertEquals(request.getTotalQuantity(), response.getTotalQuantity());
        assertEquals(request.getPackagingInfo(), response.getPackagingInfo());
        assertEquals(ShipmentStatus.CODE_PRINTED, response.getStatus());
        assertEquals(productionLot.getId(), response.getProductionLotId());
        assertEquals(productionLot.getName(), response.getProductionLotName());
        assertNotNull(response.getTraceCodes());
        assertEquals(request.getTotalQuantity(), response.getTraceCodes().size());
        String firstCode = response.getTraceCodes().get(0).getCodeValue();
        assertTrue(firstCode.startsWith("NCL"));
        assertEquals(50L, codeRange.getUsedCount());

        verify(shipmentRepository).save(any(Shipment.class));
        verify(traceCodeRepository).saveAll(anyList());
        verify(productionLotRepository).findById(productionLot.getId());
        verify(codeRangeRepository).findByOrganizationOrganizationId(organization.getOrganizationId());
    }

    // ==================== TEST THẤT BẠI ====================

    @Test
    void createShipment_ShouldThrowException_WhenRoleNotManager() {
        // Arrange
        when(currentUser.getRoleCode()).thenReturn("VT-01"); // override role

        // Act & Assert
        BusinessException exception = assertThrows(BusinessException.class,
                () -> shipmentService.createShipment(request));

        assertEquals("Bạn không có quyền tạo lô hàng.", exception.getMessage());

        verify(productionLotRepository, never()).findById(any());
        verify(shipmentRepository, never()).save(any());
        verify(traceCodeRepository, never()).saveAll(any());
    }

    @Test
    void createShipment_ShouldThrowException_WhenProductionLotNotFound() {
        // Arrange
        when(productionLotRepository.findById(productionLot.getId()))
                .thenReturn(Optional.empty());

        // Act & Assert
        BusinessException exception = assertThrows(BusinessException.class,
                () -> shipmentService.createShipment(request));

        assertEquals("Không tìm thấy lô sản xuất.", exception.getMessage());

        verify(productionLotRepository).findById(productionLot.getId());
        verify(codeRangeRepository, never()).findByOrganizationOrganizationId(any());
        verify(shipmentRepository, never()).save(any());
    }

    @Test
    void createShipment_ShouldThrowException_WhenOrganizationMismatch() {
        // Arrange
        Organization otherOrg = new Organization();
        otherOrg.setOrganizationId(UUID.randomUUID());
        productionLot.setOrganization(otherOrg);

        when(productionLotRepository.findById(productionLot.getId()))
                .thenReturn(Optional.of(productionLot));

        // Act & Assert
        BusinessException exception = assertThrows(BusinessException.class,
                () -> shipmentService.createShipment(request));

        assertEquals("Bạn không thuộc tổ chức của lô sản xuất.", exception.getMessage());

        verify(codeRangeRepository, never()).findByOrganizationOrganizationId(any());
        verify(shipmentRepository, never()).save(any());
    }

    @Test
    void createShipment_ShouldThrowException_WhenProductionLotStatusNotPackaged() {
        // Arrange
        productionLot.setStatus(ProductionLotStatus.APPROVED);
        when(productionLotRepository.findById(productionLot.getId()))
                .thenReturn(Optional.of(productionLot));

        // Act & Assert
        BusinessException exception = assertThrows(BusinessException.class,
                () -> shipmentService.createShipment(request));

        assertEquals("Chỉ có thể tạo lô hàng từ lô sản xuất đã đóng gói.", exception.getMessage());

        verify(codeRangeRepository, never()).findByOrganizationOrganizationId(any());
        verify(shipmentRepository, never()).save(any());
    }

    @Test
    void createShipment_ShouldThrowException_WhenCodeRangeNotFound() {
        // Arrange
        when(productionLotRepository.findById(productionLot.getId()))
                .thenReturn(Optional.of(productionLot));

        when(codeRangeRepository.findByOrganizationOrganizationId(organization.getOrganizationId()))
                .thenReturn(Optional.empty());

        // Act & Assert
        BusinessException exception = assertThrows(BusinessException.class,
                () -> shipmentService.createShipment(request));

        assertEquals("Tổ chức chưa được cấp dải mã truy xuất.", exception.getMessage());

        verify(codeRangeRepository).findByOrganizationOrganizationId(organization.getOrganizationId());
        verify(shipmentRepository, never()).save(any());
        verify(traceCodeRepository, never()).saveAll(any());
    }

    @Test
    void createShipment_ShouldThrowException_WhenCodeRangeLimitExceeded() {
        // Arrange
        when(productionLotRepository.findById(productionLot.getId()))
                .thenReturn(Optional.of(productionLot));

        codeRange.setUsedCount(980L);
        when(codeRangeRepository.findByOrganizationOrganizationId(organization.getOrganizationId()))
                .thenReturn(Optional.of(codeRange));

        // Act & Assert
        BusinessException exception = assertThrows(BusinessException.class,
                () -> shipmentService.createShipment(request));

        assertEquals("Số lượng tem vượt quá hạn mức dải mã còn lại.", exception.getMessage());

        verify(codeRangeRepository).findByOrganizationOrganizationId(organization.getOrganizationId());
        verify(shipmentRepository, never()).save(any());
        verify(traceCodeRepository, never()).saveAll(any());
    }

    // ==================== TEST KIỂM TRA VIỆC SINH MÃ ====================

    @Test
    void createShipment_ShouldGenerateCorrectCodeValues_WhenMultipleCodes() {
        // Arrange
        long quantity = 3L;
        request.setTotalQuantity(quantity);
        codeRange.setUsedCount(5L); // đã dùng 5, mã mới bắt đầu từ 6

        when(productionLotRepository.findById(productionLot.getId()))
                .thenReturn(Optional.of(productionLot));

        when(codeRangeRepository.findByOrganizationOrganizationId(organization.getOrganizationId()))
                .thenReturn(Optional.of(codeRange));

        when(shipmentRepository.save(any(Shipment.class)))
                .thenAnswer(invocation -> {
                    Shipment s = invocation.getArgument(0);
                    s.setId(UUID.randomUUID());
                    s.setCreatedAt(LocalDateTime.now());
                    return s;
                });

        when(traceCodeRepository.saveAll(anyList()))
                .thenAnswer(invocation -> {
                    List<TraceCode> list = invocation.getArgument(0);
                    list.forEach(tc -> {
                        tc.setId(UUID.randomUUID());
                        tc.setCreatedAt(LocalDateTime.now());
                    });
                    return list;
                });

        // Act
        ShipmentResponse response = shipmentService.createShipment(request);

        // Assert
        List<TraceCodeResponse> traceCodes = response.getTraceCodes();
        assertEquals(quantity, traceCodes.size());
        // Sửa lại định dạng: 8 chữ số, bắt đầu từ 6 => 00000006
        assertEquals("NCL00000006", traceCodes.get(0).getCodeValue());
        assertEquals("NCL00000007", traceCodes.get(1).getCodeValue());
        assertEquals("NCL00000008", traceCodes.get(2).getCodeValue());
        assertEquals(8L, codeRange.getUsedCount());
    }
}