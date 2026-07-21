package vn.nguongocso.farm;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.Mockito.*;

import java.time.LocalDate;
import java.util.List;
import java.util.Optional;
import java.util.UUID;

import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.core.context.SecurityContextHolder;

import vn.nguongocso.auth.entity.Role;
import vn.nguongocso.auth.entity.User;
import vn.nguongocso.auth.enums.UserStatus;
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
import vn.nguongocso.organization.entity.OrganizationUser;

import java.util.Collection;
import org.springframework.security.core.GrantedAuthority;
import org.springframework.security.core.authority.SimpleGrantedAuthority;

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
        organization.setName("HTX A");
        organization.setCode("HTX01");

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
        user.setUserId(UUID.randomUUID());
        user.setUserName("user01");
        user.setPasswordHash("123");
        user.setFullName("Nguyễn Văn A");
        user.setStatus(UserStatus.ACTIVE);

        // Role
        Role role = new Role();
        role.setCode("EVENT_RECODER");   // ==> ROLE_EVENT_RECODER
        role.setName("Người ghi sự kiện");

        // OrganizationUser
        OrganizationUser orgUser = new OrganizationUser();
        orgUser.setOrganization(organization);

        // CustomUserDetails thật
        CustomUserDetails userDetails =
                new CustomUserDetails(user, orgUser, role);

        UsernamePasswordAuthenticationToken authentication =
                new UsernamePasswordAuthenticationToken(
                        userDetails,
                        null,
                        userDetails.getAuthorities());

        SecurityContextHolder.getContext().setAuthentication(authentication);

        // Request
        request = new CreateFarmLogRequest();
        request.setProductionLotId(productionLotId);
        request.setActivityType(FarmActivityType.WATERING);
        request.setMaterial("Nước");
        request.setQuantity(20.0);
        request.setUnit("Lít");
        request.setExecutedDate(LocalDate.now());
        request.setNotes("Tưới buổi sáng");
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

        assertEquals(
        	    "Chỉ được ghi nhật ký cho lô đã duyệt hoặc đang thu hoạch.",
        	    ex.getMessage());

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
                "Bạn không thuộc tổ chức của lô sản xuất.",
                ex.getMessage());

        verify(farmLogRepository, never()).save(any());
    }
    
    @Test
    void create_shouldThrowException_whenUserHasNoEventRecorderRole() {

        Role role = new Role();
        role.setCode("ADMIN");

        Organization organization = new Organization();
        organization.setOrganizationId(organizationId);

        OrganizationUser orgUser = new OrganizationUser();
        orgUser.setOrganization(organization);

        CustomUserDetails userDetails =
                new CustomUserDetails(user, orgUser, role);

        UsernamePasswordAuthenticationToken authentication =
                new UsernamePasswordAuthenticationToken(
                        userDetails,
                        null,
                        userDetails.getAuthorities());

        SecurityContextHolder.getContext().setAuthentication(authentication);

        BusinessException ex = assertThrows(
                BusinessException.class,
                () -> farmLogService.create(request));

        assertEquals(
                "Bạn không có quyền ghi nhật ký canh tác.",
                ex.getMessage());

        verify(productionLotRepository, never()).findById(any());
        verify(farmLogRepository, never()).save(any());
    }
}
