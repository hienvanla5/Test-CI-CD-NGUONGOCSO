package vn.nguongocso.productionLotService;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

import java.util.Arrays;
import java.util.Collections;
import java.util.Optional;
import java.util.UUID;

import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.ArgumentCaptor;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.context.ApplicationEventPublisher;

import vn.nguongocso.auth.service.CustomUserDetails;
import vn.nguongocso.exception.BusinessException;
import vn.nguongocso.farm.dto.response.CreateProductionLotResponse;
import vn.nguongocso.farm.entity.FarmLog;
import vn.nguongocso.farm.entity.ProductCategory;
import vn.nguongocso.farm.entity.ProductionLot;
import vn.nguongocso.farm.enums.FarmActivityType;
import vn.nguongocso.farm.enums.ProductionLotStatus;
import vn.nguongocso.farm.event.PackagingValidationFailedEvent;
import vn.nguongocso.farm.repository.FarmLogRepository;
import vn.nguongocso.farm.repository.ProductionLotRepository;
import vn.nguongocso.farm.service.impl.ProductionLotServiceImpl;
import vn.nguongocso.organization.entity.Organization;

@ExtendWith(MockitoExtension.class)
class ProductionLotServiceTest {

    @Mock
    private ProductionLotRepository productionLotRepository;

    @Mock
    private FarmLogRepository farmLogRepository;

    @Mock
    private ApplicationEventPublisher eventPublisher;

    @InjectMocks
    private ProductionLotServiceImpl productionLotService;

    private UUID lotId;
    private UUID orgId;
    private CustomUserDetails userDetails;
    private ProductionLot productionLot;

    @BeforeEach
    void setUp() {
        lotId = UUID.randomUUID();
        orgId = UUID.randomUUID();

        Organization organization = new Organization();
        organization.setOrganizationId(orgId);
        organization.setName("HTX Nông Nghiệp Xanh");

        ProductCategory productCategory = new ProductCategory();
        productCategory.setName("Cải Ngọt");

        productionLot = new ProductionLot();
        productionLot.setId(lotId);
        productionLot.setName("Lô Cải Ngọt hữu cơ");
        productionLot.setOrganization(organization);
        productionLot.setProductCategory(productCategory);
        productionLot.setStatus(ProductionLotStatus.HARVESTED);

        userDetails = mock(CustomUserDetails.class);
        lenient().when(userDetails.getOrganizationId()).thenReturn(orgId);
    }
}
