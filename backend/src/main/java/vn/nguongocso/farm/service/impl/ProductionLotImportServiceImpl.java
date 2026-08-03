package vn.nguongocso.farm.service.impl;

import java.util.ArrayList;
import java.util.List;
import java.util.UUID;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import lombok.RequiredArgsConstructor;
import vn.nguongocso.alert.dto.request.ActivityLogRequest;
import vn.nguongocso.alert.service.ActivityLogService;
import vn.nguongocso.auth.service.CustomUserDetails;
import vn.nguongocso.exception.BusinessException;
import vn.nguongocso.farm.dto.request.ProductionLotImportRequest;
import vn.nguongocso.farm.dto.response.ProductionLotImportResultResponse;
import vn.nguongocso.farm.dto.response.ProductionLotImportRowError;
import vn.nguongocso.farm.entity.FarmArea;
import vn.nguongocso.farm.entity.FarmLog;
import vn.nguongocso.farm.entity.ProductCategory;
import vn.nguongocso.farm.entity.ProductionLot;
import vn.nguongocso.farm.entity.ProductionLotImportHistory;
import vn.nguongocso.farm.enums.ProductionLotImportStatus;
import vn.nguongocso.farm.enums.ProductionLotStatus;
import vn.nguongocso.farm.repository.FarmAreaRepository;
import vn.nguongocso.farm.repository.FarmLogRepository;
import vn.nguongocso.farm.repository.ProductCategoryRepository;
import vn.nguongocso.farm.repository.ProductionLotImportHistoryRepository;
import vn.nguongocso.farm.repository.ProductionLotRepository;
import vn.nguongocso.farm.service.ProductionLotImportService;
import vn.nguongocso.farm.util.ProductionLotImportFileParser;
import vn.nguongocso.farm.util.ProductionLotImportRow;
import vn.nguongocso.farm.util.ValidImportRow;
import vn.nguongocso.organization.entity.Organization;
import vn.nguongocso.organization.repository.OrganizationRepository;
import vn.nguongocso.permission.service.PermissionChecker;

/**
 * Triển khai chức năng nhập dữ liệu lô sản xuất từ tệp CSV.
 */
@Service
@RequiredArgsConstructor
@Transactional
public class ProductionLotImportServiceImpl implements ProductionLotImportService {

    private static final String RESOURCE = "production_lot";
    private static final String ACTION_CREATE = "CREATE";

    private final PermissionChecker permissionChecker;
    private final ProductionLotImportFileParser fileParser;
    private final ProductionLotRepository productionLotRepository;
    private final ProductionLotImportHistoryRepository importHistoryRepository;
    private final ProductCategoryRepository productCategoryRepository;
    private final FarmAreaRepository farmAreaRepository;
    private final FarmLogRepository farmLogRepository;
    private final OrganizationRepository organizationRepository;
    private final ActivityLogService activityLogService;

    /**
     * Nhập dữ liệu lô sản xuất từ tệp CSV.
     */
    @Override
    public ProductionLotImportResultResponse importProductionLots(
            ProductionLotImportRequest request,
            CustomUserDetails userDetails) {

        permissionChecker.check(RESOURCE, ACTION_CREATE);

        Organization organization = resolveOrganization(
                request.getOrganizationId(),
                userDetails);

        List<ProductionLotImportRow> rows = fileParser.parse(request.getFile());

        List<ValidImportRow> validRows = new ArrayList<>();
        List<UUID> savedLotIds = new ArrayList<>();
        List<ProductionLotImportRowError> rowErrors = new ArrayList<>();

        validateRows(
                rows,
                organization,
                userDetails,
                validRows,
                rowErrors);

        saveProductionLots(
                validRows,
                savedLotIds);

        saveFarmLogs(
                validRows,
                userDetails);

        ProductionLotImportHistory history = saveImportHistory(
                request.getFile().getOriginalFilename(),
                organization,
                userDetails,
                rows.size(),
                savedLotIds.size(),
                rowErrors.size());

        writeActivityLog(
                organization,
                userDetails,
                history);

        return buildResponse(
                history,
                savedLotIds,
                rowErrors);
    }

    /**
     * Xác định tổ chức được phép nhập dữ liệu.
     */
    private Organization resolveOrganization(
            UUID organizationId,
            CustomUserDetails userDetails) {

        UUID targetOrganizationId = organizationId != null
                ? organizationId
                : userDetails.getOrganizationId();

        if (!targetOrganizationId.equals(userDetails.getOrganizationId())) {
            throw new BusinessException(
                    "Bạn không có quyền nhập dữ liệu cho tổ chức này.");
        }

        return organizationRepository.findById(targetOrganizationId)
                .orElseThrow(() -> new BusinessException("Không tìm thấy tổ chức."));
    }

    /**
     * Validate từng dòng và tạo danh sách ValidImportRow.
     */
    private void validateRows(
            List<ProductionLotImportRow> rows,
            Organization organization,
            CustomUserDetails userDetails,
            List<ValidImportRow> validRows,
            List<ProductionLotImportRowError> rowErrors) {

        for (ProductionLotImportRow row : rows) {
            try {
                validateBasicInformation(row);

                ProductCategory category = validateProductCategory(row);
                FarmArea farmArea = validateFarmArea(row, organization);

                // Tạo ProductionLot
                ProductionLot lot = buildProductionLot(
                        row,
                        organization,
                        userDetails,
                        category,
                        farmArea);

                // Gói vào ValidImportRow và thêm vào danh sách
                validRows.add(
                        ValidImportRow.builder()
                                .row(row)
                                .productionLot(lot)
                                .build());

            } catch (BusinessException ex) {
                rowErrors.add(
                        ProductionLotImportRowError.builder()
                                .rowNumber(row.getRowNumber())
                                .reason(ex.getMessage())
                                .build());
            }
        }
    }

    /**
     * Lưu danh sách lô sản xuất từ các ValidImportRow.
     */
    private void saveProductionLots(
            List<ValidImportRow> validRows,
            List<UUID> savedLotIds) {

        if (validRows.isEmpty()) {
            return;
        }

        // Trích xuất các ProductionLot từ ValidImportRow
        List<ProductionLot> lots = validRows.stream()
                .map(ValidImportRow::getProductionLot)
                .toList();

        List<ProductionLot> savedLots = productionLotRepository.saveAll(lots);

        // Các đối tượng ProductionLot trong validRows đã được gán ID tự động bởi JPA
        for (ProductionLot lot : savedLots) {
            savedLotIds.add(lot.getId());
        }
    }

    /**
     * Tạo nhật ký canh tác cho các dòng hợp lệ.
     */
    private void saveFarmLogs(
            List<ValidImportRow> validRows,
            CustomUserDetails userDetails) {

        List<FarmLog> farmLogs = new ArrayList<>();

        for (ValidImportRow item : validRows) {
            ProductionLotImportRow row = item.getRow();

            if (row.getActivityType() == null) {
                continue;
            }

            // item.getProductionLot() đã có ID sau khi saveProductionLots
            farmLogs.add(
                    FarmLog.builder()
                            .productionLotId(item.getProductionLot())
                            .activityType(row.getActivityType())
                            .material(row.getMaterial())
                            .quantity(row.getQuantity())
                            .unit(row.getUnit())
                            .executedDate(row.getExecutedDate())
                            .notes(row.getNote())
                            .createdBy(userDetails.getUser())
                            .build());
        }

        if (!farmLogs.isEmpty()) {
            farmLogRepository.saveAll(farmLogs);
        }
    }

    private void validateBasicInformation(ProductionLotImportRow row) {
        if (row.getLotName() == null || row.getLotName().isBlank()) {
            throw new BusinessException("Tên lô không được để trống.");
        }
        if (row.getExpectedQuantity() == null || row.getExpectedQuantity() <= 0) {
            throw new BusinessException("Sản lượng dự kiến phải lớn hơn 0.");
        }
        if (row.getActualQuantity() != null && row.getActualQuantity() < 0) {
            throw new BusinessException("Sản lượng thực thu không được nhỏ hơn 0.");
        }
        if (row.getPlantingDate() == null) {
            throw new BusinessException("Ngày gieo trồng không đúng định dạng dd/MM/yyyy.");
        }
        if (row.getHarvestDate() != null
                && row.getHarvestDate().isBefore(row.getPlantingDate())) {
            throw new BusinessException("Ngày thu hoạch phải sau ngày gieo trồng.");
        }
    }

    private ProductCategory validateProductCategory(ProductionLotImportRow row) {
        if (row.getProductCategoryId() == null || row.getProductCategoryId().isBlank()) {
            throw new BusinessException("Mã loại nông sản không được để trống.");
        }
        UUID id = parseUuid(row.getProductCategoryId());
        if (id == null) {
            throw new BusinessException("Mã loại nông sản không hợp lệ.");
        }
        ProductCategory category = productCategoryRepository.findById(id)
                .orElseThrow(() -> new BusinessException("Loại nông sản không tồn tại."));
        if (!Boolean.TRUE.equals(category.getIsActive())) {
            throw new BusinessException("Loại nông sản đã ngừng sử dụng.");
        }
        return category;
    }

    private FarmArea validateFarmArea(ProductionLotImportRow row, Organization organization) {
        if (row.getFarmAreaId() == null || row.getFarmAreaId().isBlank()) {
            return null;
        }
        UUID id = parseUuid(row.getFarmAreaId());
        if (id == null) {
            throw new BusinessException("Mã vùng trồng không hợp lệ.");
        }
        FarmArea farmArea = farmAreaRepository.findById(id)
                .orElseThrow(() -> new BusinessException("Vùng trồng không tồn tại."));
        if (!farmArea.getOrganization().getOrganizationId()
                .equals(organization.getOrganizationId())) {
            throw new BusinessException("Vùng trồng không thuộc tổ chức.");
        }
        return farmArea;
    }

    private ProductionLot buildProductionLot(
            ProductionLotImportRow row,
            Organization organization,
            CustomUserDetails userDetails,
            ProductCategory category,
            FarmArea farmArea) {

        return ProductionLot.builder()
                .organization(organization)
                .farmArea(farmArea)
                .productCategory(category)
                .name(row.getLotName())
                .expectedQuantity(row.getExpectedQuantity())
                .actualQuantity(row.getActualQuantity())
                .plantingDate(row.getPlantingDate())
                .harvestDate(row.getHarvestDate())
                .status(ProductionLotStatus.DRAFT)
                .createdBy(userDetails.getUser())
                .build();
    }

    private UUID parseUuid(String value) {
        if (value == null || value.isBlank()) {
            return null;
        }
        try {
            return UUID.fromString(value.trim());
        } catch (IllegalArgumentException ex) {
            return null;
        }
    }

    private ProductionLotImportHistory saveImportHistory(
            String fileName,
            Organization organization,
            CustomUserDetails userDetails,
            Integer totalRows,
            Integer successCount,
            Integer failedCount) {

        ProductionLotImportStatus status;
        if (failedCount == 0) {
            status = ProductionLotImportStatus.SUCCESS;
        } else if (successCount == 0) {
            status = ProductionLotImportStatus.FAILED;
        } else {
            status = ProductionLotImportStatus.PARTIAL_SUCCESS;
        }

        ProductionLotImportHistory history = ProductionLotImportHistory.builder()
                .organization(organization)
                .importedBy(userDetails.getUser())
                .fileName(fileName)
                .totalRows(totalRows)
                .successCount(successCount)
                .failedCount(failedCount)
                .status(status)
                .build();

        return importHistoryRepository.save(history);
    }

    /**
     * Ghi nhật ký hoạt động sau khi import lô sản xuất.
     */
    private void writeActivityLog(
            Organization organization,
            CustomUserDetails userDetails,
            ProductionLotImportHistory history) {

        activityLogService.logActivity(
                ActivityLogRequest.builder()
                        .organizationId(organization.getOrganizationId())
                        .userId(userDetails.getUser().getUserId())
                        .username(userDetails.getUsername())
                        .fullName(userDetails.getUser().getFullName())
                        .action("IMPORT_PRODUCTION_LOT")
                        .description(String.format(
                                "Nhập dữ liệu lô sản xuất từ tệp '%s'. Kết quả: %d thành công, %d thất bại.",
                                history.getFileName(),
                                history.getSuccessCount(),
                                history.getFailedCount()))
                        .entityType("PRODUCTION_LOT_IMPORT_HISTORY")
                        .entityId(history.getId())
                        .ipAddress(null)
                        .build());
    }

    private ProductionLotImportResultResponse buildResponse(
            ProductionLotImportHistory history,
            List<UUID> savedLotIds,
            List<ProductionLotImportRowError> rowErrors) {

        return ProductionLotImportResultResponse.builder()
                .importHistoryId(history.getId())
                .status(history.getStatus().name())
                .fileName(history.getFileName())
                .totalRows(history.getTotalRows())
                .successCount(history.getSuccessCount())
                .failedCount(history.getFailedCount())
                .savedLotIds(savedLotIds)
                .errors(rowErrors)
                .importedAt(history.getImportedAt().toInstant(java.time.ZoneOffset.UTC))
                .build();
    }
}