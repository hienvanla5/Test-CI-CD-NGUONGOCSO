package vn.nguongocso.farm;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.Mockito.*;

import java.time.LocalDate;
import java.util.Optional;
import java.util.UUID;

import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.context.SecurityContextHolder;

import vn.nguongocso.auth.entity.User;
import vn.nguongocso.auth.service.CustomUserDetails;
import vn.nguongocso.exception.BusinessException;
import vn.nguongocso.farm.dto.request.CreateFarmLogRequest;
import vn.nguongocso.farm.dto.response.FarmLogResponse;
import vn.nguongocso.farm.entity.FarmArea;
import vn.nguongocso.farm.entity.FarmLog;
import vn.nguongocso.farm.entity.ProductionLot;
import vn.nguongocso.farm.enums.FarmActivityType;
import vn.nguongocso.farm.enums.ProductionLotStatus;
import vn.nguongocso.farm.repository.FarmLogRepository;
import vn.nguongocso.farm.repository.ProductionLotRepository;
import vn.nguongocso.farm.service.impl.FarmLogServiceImpl;
import vn.nguongocso.organization.entity.Organization;

@ExtendWith(MockitoExtension.class)
class FarmLogServiceImplTest {

    @Mock
    private FarmLogRepository farmLogRepository;

    @Mock
    private ProductionLotRepository productionLotRepository;

    @InjectMocks
    private FarmLogServiceImpl farmLogService;

    private UUID organizationId;
    private UUID productionLotId;

    private User user;
    private ProductionLot productionLot;
    private CreateFarmLogRequest request;

    @BeforeEach
    void setUp() {

        organizationId = UUID.randomUUID();
        productionLotId = UUID.randomUUID();

        // Organization
        Organization organization = new Organization();
        organization.setOrganizationId(organizationId);

        // FarmArea
        FarmArea farmArea = new FarmArea();
        farmArea.setOrganization(organization);

        // ProductionLot
        productionLot = new ProductionLot();
        productionLot.setId(productionLotId);
        productionLot.setName("Lô xoài");
        productionLot.setFarmArea(farmArea);
        productionLot.setStatus(ProductionLotStatus.APPROVED);

        // User
        user = new User();
        user.setFullName("Nguyễn Văn A");

        // Request
        request = new CreateFarmLogRequest();
        request.setProductionLotId(productionLotId);
        request.setActivityType(FarmActivityType.WATERING);
        request.setMaterial("Nước");
        request.setQuantity(20.0);
        request.setUnit("Lít");
        request.setExecutedDate(LocalDate.now());
        request.setNotes("Tưới buổi sáng");

        // Mock user đăng nhập
        CustomUserDetails userDetails = mock(CustomUserDetails.class);

        when(userDetails.getOrganizationId()).thenReturn(organizationId);
        when(userDetails.getUser()).thenReturn(user);

        UsernamePasswordAuthenticationToken authentication =
                new UsernamePasswordAuthenticationToken(userDetails, null);

        SecurityContextHolder.getContext().setAuthentication(authentication);
    }
    
    //Thành công
    @Test
    void create_shouldCreateFarmLogSuccessfully() {

        when(productionLotRepository.findById(productionLotId))
                .thenReturn(Optional.of(productionLot));

        when(farmLogRepository.save(any(FarmLog.class)))
                .thenAnswer(invocation -> {

                    FarmLog log = invocation.getArgument(0);
                    log.setId(UUID.randomUUID());
                    return log;
                });

        FarmLogResponse response = farmLogService.create(request);

        assertNotNull(response);
        assertEquals("Lô xoài", response.getProductionLotName());
        assertEquals(FarmActivityType.WATERING, response.getActivityType());

        verify(farmLogRepository).save(any(FarmLog.class));
    }
    
    //Không tìm thấy ProductionLot
    @Test
    void create_shouldThrowException_whenProductionLotNotFound() {

        when(productionLotRepository.findById(productionLotId))
                .thenReturn(Optional.empty());

        BusinessException ex = assertThrows(
                BusinessException.class,
                () -> farmLogService.create(request));

        assertEquals("Không tìm thấy lô sản xuất", ex.getMessage());

        verify(farmLogRepository, never()).save(any());
    }
    
    
    //Chưa được duyệt
    @Test
    void create_shouldThrowException_whenProductionLotNotApproved() {

        productionLot.setStatus(ProductionLotStatus.DRAFT);

        when(productionLotRepository.findById(productionLotId))
                .thenReturn(Optional.of(productionLot));

        BusinessException ex = assertThrows(
                BusinessException.class,
                () -> farmLogService.create(request));

        assertEquals("Lô sản xuất chưa được duyệt.", ex.getMessage());

        verify(farmLogRepository, never()).save(any());
    }
    
    
    //Sai Organization
    @Test
    void create_shouldThrowException_whenNoPermission() {

        UUID anotherOrganization = UUID.randomUUID();

        productionLot.getFarmArea()
                .getOrganization()
                .setOrganizationId(anotherOrganization);

        when(productionLotRepository.findById(productionLotId))
                .thenReturn(Optional.of(productionLot));

        BusinessException ex = assertThrows(
                BusinessException.class,
                () -> farmLogService.create(request));

        assertEquals(
                "Bạn không có quyền ghi nhật ký cho lô sản xuất này",
                ex.getMessage());

        verify(farmLogRepository, never()).save(any());
    }
}
