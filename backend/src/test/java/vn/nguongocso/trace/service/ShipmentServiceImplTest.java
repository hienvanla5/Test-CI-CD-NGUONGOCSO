package vn.nguongocso.trace.service;


import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.anyList;
import static org.mockito.Mockito.*;

import java.time.LocalDateTime;
import java.util.Collections;
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
import vn.nguongocso.auth.repository.UserRepository;
import vn.nguongocso.auth.service.CustomUserDetails;
import vn.nguongocso.exception.BusinessException;
import vn.nguongocso.farm.entity.ProductionLot;
import vn.nguongocso.farm.enums.ProductionLotStatus;
import vn.nguongocso.farm.repository.ProductionLotRepository;
import vn.nguongocso.organization.entity.Organization;
import vn.nguongocso.trace.dto.request.CreateShipmentRequest;
import vn.nguongocso.trace.dto.response.ShipmentResponse;
import vn.nguongocso.trace.entity.CodeRange;
import vn.nguongocso.trace.entity.Shipment;
import vn.nguongocso.trace.entity.TraceCode;
import vn.nguongocso.trace.enums.ShipmentStatus;
import vn.nguongocso.trace.enums.TraceCodeStatus;
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

    @Mock
    private UserRepository userRepository;

    @Mock
    private SecurityContext securityContext;

    @Mock
    private Authentication authentication;

    @InjectMocks
    private ShipmentServiceImpl shipmentService;

    private UUID userId;
    private UUID orgId;
    private UUID lotId;
    private UUID shipmentId;

    private CustomUserDetails userDetails;
    private ProductionLot productionLot;
    private CodeRange codeRange;
    private Organization organization;

    @BeforeEach
    void setUp() {
        userId = UUID.randomUUID();
        orgId = UUID.randomUUID();
        lotId = UUID.randomUUID();
        shipmentId = UUID.randomUUID();

        organization = new Organization();
        organization.setOrganizationId(orgId);
        organization.setName("Tổ chức HTX Nông Nghiệp");

        productionLot = new ProductionLot();
        productionLot.setId(lotId);
        productionLot.setName("Lô sản phẩm Organic");
        productionLot.setOrganization(organization);
        productionLot.setStatus(ProductionLotStatus.PACKAGED); // Mặc định ở trạng thái hợp lệ để tạo lô hàng

        codeRange = new CodeRange();
        codeRange.setPrefix("ORG893");
        codeRange.setTotalLimit(100L);
        codeRange.setUsedCount(10L);

        userDetails = mock(CustomUserDetails.class);
        lenient().when(userDetails.getUserId()).thenReturn(userId);
        lenient().when(userDetails.getOrganizationId()).thenReturn(orgId);
        lenient().when(userDetails.getRoleCode()).thenReturn("VT-02"); // Vai trò Quản lý tổ chức hợp lệ
        lenient().when(userDetails.getFullName()).thenReturn("Nguyễn Văn A");
    }

    @AfterEach
    void tearDown() {
        SecurityContextHolder.clearContext();
    }

    private void mockLogin(CustomUserDetails user) {
        when(authentication.getPrincipal()).thenReturn(user);
        when(securityContext.getAuthentication()).thenReturn(authentication);
        SecurityContextHolder.setContext(securityContext);
    }


    @Test
    void createShipment_shouldSuccess_whenAllValid() {
        mockLogin(userDetails);

        CreateShipmentRequest request = new CreateShipmentRequest();
        request.setProductionLotId(lotId);
        request.setName("Lô Hàng Xuất Khẩu Số 1");
        request.setTotalQuantity(20L); // Yêu cầu 20 tem (Hạn mức còn lại là 90)
        request.setPackagingInfo("Thùng 24 lon");

        when(productionLotRepository.findById(lotId)).thenReturn(Optional.of(productionLot));
        when(codeRangeRepository.findByOrganizationOrganizationId(orgId)).thenReturn(Optional.of(codeRange));

        when(shipmentRepository.save(any(Shipment.class))).thenAnswer(invocation -> {
            Shipment s = invocation.getArgument(0);
            s.setId(shipmentId);
            return s;
        });

        when(traceCodeRepository.saveAll(anyList())).thenAnswer(invocation -> {
            List<TraceCode> codes = invocation.getArgument(0);
            for (int i = 0; i < codes.size(); i++) {
                codes.get(i).setId(UUID.randomUUID());
            }
            return codes;
        });


        ShipmentResponse response = shipmentService.createShipment(request);

        assertThat(response).isNotNull();
        assertThat(response.getName()).isEqualTo("Lô Hàng Xuất Khẩu Số 1");
        assertThat(response.getStatus()).isEqualTo(ShipmentStatus.CODE_PRINTED);
        assertThat(response.getTraceCodes()).hasSize(20);
        assertThat(response.getTraceCodes().get(0).getCodeValue()).isEqualTo("ORG89300000011"); // Start sequence = 10 + 1

        assertThat(codeRange.getUsedCount()).isEqualTo(30L);

        verify(shipmentRepository, times(1)).save(any(Shipment.class));
        verify(traceCodeRepository, times(1)).saveAll(anyList());
    }

    @Test
    void createShipment_shouldThrow_whenUserHasInvalidRole() {
        // Given: Đăng nhập với quyền không hợp lệ (ví dụ: VT-03)
        when(userDetails.getRoleCode()).thenReturn("VT-03");
        mockLogin(userDetails);

        CreateShipmentRequest request = new CreateShipmentRequest();

        assertThatThrownBy(() -> shipmentService.createShipment(request))
                .isInstanceOf(BusinessException.class)
                .hasMessage("Bạn không có quyền tạo lô hàng.");

        verifyNoInteractions(productionLotRepository, codeRangeRepository, shipmentRepository, traceCodeRepository);
    }

    @Test
    void createShipment_shouldThrow_whenProductionLotNotFound() {
        // Given
        mockLogin(userDetails);
        CreateShipmentRequest request = new CreateShipmentRequest();
        request.setProductionLotId(lotId);

        when(productionLotRepository.findById(lotId)).thenReturn(Optional.empty());

        assertThatThrownBy(() -> shipmentService.createShipment(request))
                .isInstanceOf(BusinessException.class)
                .hasMessage("Không tìm thấy lô sản xuất.");
    }

    @Test
    void createShipment_shouldThrow_whenDifferentOrganization() {
        // Given: Tổ chức của người dùng khác với tổ chức của lô sản xuất
        mockLogin(userDetails);
        UUID userOrgId = UUID.randomUUID();
        when(userDetails.getOrganizationId()).thenReturn(userOrgId);

        CreateShipmentRequest request = new CreateShipmentRequest();
        request.setProductionLotId(lotId);

        when(productionLotRepository.findById(lotId)).thenReturn(Optional.of(productionLot));

        assertThatThrownBy(() -> shipmentService.createShipment(request))
                .isInstanceOf(BusinessException.class)
                .hasMessage("Bạn không thuộc tổ chức của lô sản xuất.");
    }

    @Test
    void createShipment_shouldThrow_whenProductionLotNotPackaged() {
        // Given: Lô chưa đóng gói (ví dụ mới chỉ ở trạng thái HARVESTED)
        mockLogin(userDetails);
        productionLot.setStatus(ProductionLotStatus.HARVESTED);

        CreateShipmentRequest request = new CreateShipmentRequest();
        request.setProductionLotId(lotId);

        when(productionLotRepository.findById(lotId)).thenReturn(Optional.of(productionLot));

        assertThatThrownBy(() -> shipmentService.createShipment(request))
                .isInstanceOf(BusinessException.class)
                .hasMessage("Chỉ có thể tạo lô hàng từ lô sản xuất đã đóng gói.");
    }

    @Test
    void createShipment_shouldThrow_whenCodeRangeNotFound() {
        // Given
        mockLogin(userDetails);
        CreateShipmentRequest request = new CreateShipmentRequest();
        request.setProductionLotId(lotId);

        when(productionLotRepository.findById(lotId)).thenReturn(Optional.of(productionLot));
        when(codeRangeRepository.findByOrganizationOrganizationId(orgId)).thenReturn(Optional.empty());

        assertThatThrownBy(() -> shipmentService.createShipment(request))
                .isInstanceOf(BusinessException.class)
                .hasMessage("Tổ chức chưa được cấp dải mã truy xuất.");
    }

    @Test
    void createShipment_shouldThrow_whenCodeRangeLimitExceeded() {
        // Given: Hạn mức còn lại là 90, nhưng yêu cầu 91 tem
        mockLogin(userDetails);
        CreateShipmentRequest request = new CreateShipmentRequest();
        request.setProductionLotId(lotId);
        request.setTotalQuantity(91L);

        when(productionLotRepository.findById(lotId)).thenReturn(Optional.of(productionLot));
        when(codeRangeRepository.findByOrganizationOrganizationId(orgId)).thenReturn(Optional.of(codeRange));

        assertThatThrownBy(() -> shipmentService.createShipment(request))
                .isInstanceOf(BusinessException.class)
                .hasMessage("Số lượng tem vượt quá hạn mức dải mã còn lại.");
    }


    @Test
    void activateShipmentStamps_shouldSuccess_whenAllValid() {
        // Given
        mockLogin(userDetails);

        Shipment shipment = new Shipment();
        shipment.setId(shipmentId);
        shipment.setOrganization(organization);
        shipment.setProductionLot(productionLot);
        shipment.setStatus(ShipmentStatus.CODE_PRINTED); // Đủ điều kiện kích hoạt

        User actor = new User();
        actor.setUserId(userId);
        actor.setFullName("Nguyễn Văn A");

        TraceCode traceCode = new TraceCode();
        traceCode.setId(UUID.randomUUID());
        traceCode.setCodeValue("ORG89300000011");
        traceCode.setStatus(TraceCodeStatus.INACTIVE);

        when(shipmentRepository.findById(shipmentId)).thenReturn(Optional.of(shipment));
        when(userRepository.findById(userId)).thenReturn(Optional.of(actor));
        when(traceCodeRepository.findByShipmentId(shipmentId)).thenReturn(List.of(traceCode));

        ShipmentResponse response = shipmentService.activateShipmentStamps(shipmentId);

        assertThat(response).isNotNull();
        assertThat(response.getStatus()).isEqualTo(ShipmentStatus.ACTIVATED);
        assertThat(traceCode.getStatus()).isEqualTo(TraceCodeStatus.ACTIVE);
        assertThat(traceCode.getActivatedBy()).isEqualTo(actor);
        assertThat(traceCode.getActivatedAt()).isNotNull();

        verify(shipmentRepository, times(1)).save(shipment);
        verify(traceCodeRepository, times(1)).saveAll(anyList());
    }

    @Test
    void activateShipmentStamps_shouldThrow_whenUserHasInvalidRole() {
        when(userDetails.getRoleCode()).thenReturn("VT-03");
        mockLogin(userDetails);

        assertThatThrownBy(() -> shipmentService.activateShipmentStamps(shipmentId))
                .isInstanceOf(BusinessException.class)
                .hasMessage("Bạn không có quyền kích hoạt tem.");
    }

    @Test
    void activateShipmentStamps_shouldThrow_whenShipmentNotFound() {
        mockLogin(userDetails);
        when(shipmentRepository.findById(shipmentId)).thenReturn(Optional.empty());

        assertThatThrownBy(() -> shipmentService.activateShipmentStamps(shipmentId))
                .isInstanceOf(BusinessException.class)
                .hasMessage("Không tìm thấy lô hàng.");
    }

    @Test
    void activateShipmentStamps_shouldThrow_whenDifferentOrganization() {
        // Given: Người dùng đăng nhập thuộc tổ chức khác với tổ chức của lô hàng
        mockLogin(userDetails);
        when(userDetails.getOrganizationId()).thenReturn(UUID.randomUUID());

        Shipment shipment = new Shipment();
        shipment.setId(shipmentId);
        shipment.setOrganization(organization);

        when(shipmentRepository.findById(shipmentId)).thenReturn(Optional.of(shipment));

        assertThatThrownBy(() -> shipmentService.activateShipmentStamps(shipmentId))
                .isInstanceOf(BusinessException.class)
                .hasMessage("Bạn không có quyền kích hoạt tem của tổ chức khác.");
    }

    @Test
    void activateShipmentStamps_shouldThrow_whenProductionLotNotPackaged() {
        // Given: Lô hàng có liên kết với lô sản xuất nhưng lô sản xuất không ở trạng thái PACKAGED
        mockLogin(userDetails);

        ProductionLot unpackagedLot = new ProductionLot();
        unpackagedLot.setStatus(ProductionLotStatus.HARVESTED);

        Shipment shipment = new Shipment();
        shipment.setId(shipmentId);
        shipment.setOrganization(organization);
        shipment.setProductionLot(unpackagedLot);

        when(shipmentRepository.findById(shipmentId)).thenReturn(Optional.of(shipment));

        assertThatThrownBy(() -> shipmentService.activateShipmentStamps(shipmentId))
                .isInstanceOf(BusinessException.class)
                .hasMessage("Chỉ có thể tạo lô hàng từ lô sản xuất đã đóng gói.");
    }

    @Test
    void activateShipmentStamps_shouldThrow_whenAlreadyActivated() {
        mockLogin(userDetails);

        Shipment shipment = new Shipment();
        shipment.setId(shipmentId);
        shipment.setOrganization(organization);
        shipment.setProductionLot(productionLot);
        shipment.setStatus(ShipmentStatus.ACTIVATED);

        when(shipmentRepository.findById(shipmentId)).thenReturn(Optional.of(shipment));

        assertThatThrownBy(() -> shipmentService.activateShipmentStamps(shipmentId))
                .isInstanceOf(BusinessException.class)
                .hasMessage("Tem đã được kích hoạt trước đó.");
    }

    @Test
    void activateShipmentStamps_shouldThrow_whenNotCodePrinted() {
        mockLogin(userDetails);

        Shipment shipment = new Shipment();
        shipment.setId(shipmentId);
        shipment.setOrganization(organization);
        shipment.setProductionLot(productionLot);
        shipment.setStatus(ShipmentStatus.DRAFT);

        when(shipmentRepository.findById(shipmentId)).thenReturn(Optional.of(shipment));

        assertThatThrownBy(() -> shipmentService.activateShipmentStamps(shipmentId))
                .isInstanceOf(BusinessException.class)
                .hasMessage("Lô hàng chưa được cấp hoặc in mã tem.");
    }

    @Test
    void activateShipmentStamps_shouldThrow_whenActorNotFound() {
        mockLogin(userDetails);

        Shipment shipment = new Shipment();
        shipment.setId(shipmentId);
        shipment.setOrganization(organization);
        shipment.setProductionLot(productionLot);
        shipment.setStatus(ShipmentStatus.CODE_PRINTED);

        when(shipmentRepository.findById(shipmentId)).thenReturn(Optional.of(shipment));
        when(userRepository.findById(userId)).thenReturn(Optional.empty()); // Lỗi do không tìm thấy tài khoản người kích hoạt

        assertThatThrownBy(() -> shipmentService.activateShipmentStamps(shipmentId))
                .isInstanceOf(BusinessException.class)
                .hasMessage("Người dùng không tồn tại.");
    }
}

