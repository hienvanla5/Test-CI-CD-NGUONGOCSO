package vn.nguongocso.farm.service.impl;

import lombok.RequiredArgsConstructor;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import vn.nguongocso.farm.dto.request.CreateProductionLotRequest;
import vn.nguongocso.farm.dto.response.CreateProductionLotResponse;
import vn.nguongocso.auth.entity.User;
import vn.nguongocso.farm.enums.ProductionLotStatus;
import vn.nguongocso.auth.repository.UserRepository;
import vn.nguongocso.auth.service.CustomUserDetails;
import vn.nguongocso.farm.repository.FarmAreaRepository;
import vn.nguongocso.farm.repository.ProductCategoryRepository;
import vn.nguongocso.farm.service.ProductionLotService;
import vn.nguongocso.exception.BusinessException;
import vn.nguongocso.farm.entity.FarmArea;
import vn.nguongocso.farm.entity.ProductCategory;
import vn.nguongocso.farm.entity.ProductionLot;
import vn.nguongocso.farm.repository.ProductionLotRepository;
import vn.nguongocso.organization.entity.Organization;
import vn.nguongocso.organization.repository.OrganizationRepository;

import java.util.List;
import java.util.UUID;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class ProductionLotServiceImpl implements ProductionLotService {

    private static final Logger log = LoggerFactory.getLogger(ProductionLotServiceImpl.class);

    private final ProductionLotRepository productionLotRepository;
    private final FarmAreaRepository farmAreaRepository;
    private final ProductCategoryRepository productCategoryRepository;
    private final UserRepository userRepository;
    private final OrganizationRepository organizationRepository;

    @Override
    @Transactional
    public CreateProductionLotResponse createProductionLot(CreateProductionLotRequest request, CustomUserDetails userDetails) {
        log.info("Bắt đầu xử lý tạo lô sản xuất với tên={}", request.getName());

        UUID userId = userDetails.getUserId();
        UUID orgId = userDetails.getOrganizationId();

        User user = userRepository.findById(userId)
                .orElseThrow(() -> new BusinessException("Không tìm thấy thông tin tài khoản"));
        Organization organization = organizationRepository.findById(orgId)
                .orElseThrow(() -> new BusinessException("Không tìm thấy thông tin tổ chức tương ứng"));

        ProductCategory productCategory = productCategoryRepository.findById(request.getProductCategoryId())
                .orElseThrow(() -> new BusinessException("Không tìm thấy loại nông sản đã chọn"));
        if (Boolean.FALSE.equals(productCategory.getIsActive())) {
            throw new BusinessException("Loại nông sản này hiện đang ngưng hoạt động");
        }

        FarmArea farmArea = null;
        if (request.getFarmAreaId() != null) {
            farmArea = farmAreaRepository.findById(request.getFarmAreaId())
                    .orElseThrow(() -> new BusinessException("Không tìm thấy khu vực canh tác đã chọn"));

            if (!farmArea.getOrganization().getOrganizationId().equals(orgId)) {
                throw new BusinessException("Khu vực canh tác này không thuộc tổ chức của bạn");
            }
        }

        ProductionLot productionLot = ProductionLot.builder()
                .organization(organization)
                .farmArea(farmArea)
                .productCategory(productCategory)
                .name(request.getName())
                .expectedQuantity(request.getExpectedQuantity())
                .plantingDate(request.getPlantingDate())
                .status(ProductionLotStatus.DRAFT)
                .createdBy(user)
                .build();

        ProductionLot savedLot = productionLotRepository.save(productionLot);
        log.info("Đã tạo thành công lô sản xuất với id={}", savedLot.getId());

        return mapToResponse(savedLot);
    }

    @Override
    @Transactional(readOnly = true)
    public List<CreateProductionLotResponse> getAllProductionLots(CustomUserDetails userDetails) {
        UUID orgId = userDetails.getOrganizationId();

        log.info("Lấy danh sách lô sản xuất cho tổ chức id={}", orgId);

        List<ProductionLot> lots = productionLotRepository.findByOrganization_OrganizationId(orgId);

        return lots.stream()
                .map(this::mapToResponse)
                .collect(Collectors.toList());
    }

    private CreateProductionLotResponse mapToResponse(ProductionLot lot) {
        return CreateProductionLotResponse.builder()
                .id(lot.getId())
                .organizationName(lot.getOrganization().getName())
                .farmAreaName(lot.getFarmArea() != null ? lot.getFarmArea().getName() : null)
                .productCategoryName(lot.getProductCategory().getName())
                .name(lot.getName())
                .expectedQuantity(lot.getExpectedQuantity())
                .actualQuantity(lot.getActualQuantity())
                .plantingDate(lot.getPlantingDate())
                .harvestDate(lot.getHarvestDate())
                .status(lot.getStatus().name())
                .approvalNotes(lot.getApprovalNotes())
                .createdByName(lot.getCreatedBy() != null ? lot.getCreatedBy().getFullName() : null)
                .approvedByName(lot.getApprovedBy() != null ? lot.getApprovedBy().getFullName() : null)
                .createdAt(lot.getCreatedAt())
                .updatedAt(lot.getUpdatedAt())
                .build();
    }
}
