package vn.nguongocso.farm.controller;

import jakarta.servlet.http.HttpServletRequest;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.core.io.ByteArrayResource;
import org.springframework.core.io.Resource;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;
import vn.nguongocso.auth.security.SecurityUtils;
import vn.nguongocso.farm.dto.request.ApproveProductionLotRequest;
import vn.nguongocso.farm.dto.request.CreateProductionLotRequest;
import vn.nguongocso.farm.dto.request.ProductionLotImportRequest;
import vn.nguongocso.farm.dto.request.UpdateProductionLotRequest;
import vn.nguongocso.farm.dto.response.CreateProductionLotResponse;
import vn.nguongocso.farm.dto.response.ProductionLotImportHistoryResponse;
import vn.nguongocso.farm.dto.response.ProductionLotImportResultResponse;
import vn.nguongocso.auth.service.CustomUserDetails;
import vn.nguongocso.farm.dto.response.UpdateProductionLotResponse;
import vn.nguongocso.farm.repository.ProductionLotImportHistoryRepository;
import vn.nguongocso.farm.service.ProductionLotImportService;
import vn.nguongocso.farm.service.ProductionLotService;
import vn.nguongocso.common.ApiResult;
import vn.nguongocso.permission.service.PermissionChecker;
import vn.nguongocso.report.dto.response.ProductionLotDashboardResponse;

import java.nio.charset.StandardCharsets;
import java.time.LocalDate;
import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/api/v1/production-lots")
@RequiredArgsConstructor
public class ProductionLotController {

    private final ProductionLotService productionLotService;
    private final PermissionChecker permissionChecker;
    private final ProductionLotImportService productionLotImportService;
    private final ProductionLotImportHistoryRepository importHistoryRepository;

    /**
     * API tạo mới lô sản xuất.
     * Yêu cầu người dùng đã đăng nhập.
     * Bạn cũng có thể giới hạn quyền cụ thể như Quản lý tổ chức (VT-02) hoặc Người
     * ghi nhận sự kiện (VT-03):
     * Ví dụ: @PreAuthorize("hasAnyRole('VT-02', 'VT-03')")
     */
    @PostMapping
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<ApiResult<CreateProductionLotResponse>> create(
            @Valid @RequestBody CreateProductionLotRequest request,
            @AuthenticationPrincipal CustomUserDetails userDetails) {

        permissionChecker.check("PRODUCTION_LOT", "CREATE");
        CreateProductionLotResponse response = productionLotService.createProductionLot(request, userDetails);
        return ResponseEntity.ok(ApiResult.success(response));
    }

    /**
     * API cập nhật lô sản xuất.
     * Thêm vào đây, gọi thông qua đối tượng productionLotService viết thường
     */
    /**
     * API tải mẫu file CSV nhập lô sản xuất.
     * PHẢI đặt TRƯỚC @GetMapping("/{id}") để Spring không nhầm "import-template" là UUID.
     */
    @GetMapping("/import-template")
    @PreAuthorize("hasAnyRole('VT-01', 'VT-02')")
    public ResponseEntity<Resource> downloadImportTemplate() {
        String csvContent = "ten_lo,ma_loai_nong_san,ma_vung_trong,san_luong_du_kien,san_luong_thuc_thu,ngay_gieo_trong,ngay_thu_hoach,hoat_dong_canh_tac,vat_tu,so_luong,don_vi,ngay_thuc_hien,ghi_chu\n"
                + "Lô cam xuân 2026,ca8c8c3b-1234-4567-89ab-cdef01234567,fa8c8c3b-5678-90ab-cdef-1234567890ab,1000,950,01/01/2026,15/02/2026,BON_PHAN,Phân NPK,20,kg,02/01/2026,Phân bón lót\n"
                + "Lô cam xuân 2026 (vùng 2),ca8c8c3b-1234-4567-89ab-cdef01234567,fa8c8c3b-5678-90ab-cdef-1234567890ab,800,,01/01/2026,15/02/2026,,,,,,\n"
                + "Lô vải thiều 2026,da9d9d4c-2345-5678-90bc-def012345678,,,,500,,01/02/2026,20/03/2026,,,,,,\n";
        ByteArrayResource resource = new ByteArrayResource(csvContent.getBytes(StandardCharsets.UTF_8));
        return ResponseEntity.ok()
                .header(HttpHeaders.CONTENT_DISPOSITION, "attachment; filename=\"mau_nhap_lo_san_xuat.csv\"")
                .contentType(MediaType.parseMediaType("text/csv; charset=UTF-8"))
                .body(resource);
    }

    /**
     * API lấy thông tin chi tiết lô sản xuất.
     * Yêu cầu người dùng đã đăng nhập.
     * Trả về đầy đủ thông tin cần thiết cho trang chỉnh sửa.
     */
    @GetMapping("/{id}")
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<ApiResult<CreateProductionLotResponse>> getById(@PathVariable UUID id) {
        // permissionChecker.check("PRODUCTION_LOT", "READ");
        CreateProductionLotResponse response = productionLotService.getProductionLotById(id);
        return ResponseEntity.ok(ApiResult.success(response));
    }

    @PutMapping("/{id}")
    @PreAuthorize("hasAnyRole('VT-02', 'VT-03')")
    public ResponseEntity<ApiResult<UpdateProductionLotResponse>> update(
            @PathVariable UUID id,
            @Valid @RequestBody UpdateProductionLotRequest request,
            @AuthenticationPrincipal CustomUserDetails userDetails) {
        // permissionChecker.check("PRODUCTION_LOT", "UPDATE");
        UpdateProductionLotResponse response = productionLotService.updateProductionLot(id, request, userDetails);
        return ResponseEntity.ok(ApiResult.success(response));
    }

    /**
     * API lấy danh sách lô sản xuất của tổ chức hiện tại.
     * Yêu cầu người dùng đã đăng nhập.
     * Chỉ trả về các lô sản xuất thuộc tổ chức của người dùng hiện tại.
     */
    @GetMapping
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<ApiResult<List<CreateProductionLotResponse>>> getAll(
            @AuthenticationPrincipal CustomUserDetails userDetails) {

        // permissionChecker.check("PRODUCTION_LOT", "READ");
        List<CreateProductionLotResponse> response = productionLotService.getAllProductionLots(userDetails);
        return ResponseEntity.ok(ApiResult.success(response));
    }

    @PostMapping("/{id}/submit")
    @PreAuthorize("hasRole('VT-02')")
    public ResponseEntity<ApiResult<CreateProductionLotResponse>> submitForApproval(
            @PathVariable UUID id,
            @AuthenticationPrincipal CustomUserDetails userDetails) {
        permissionChecker.check("PRODUCTION_LOT", "UPDATE");
        return ResponseEntity.ok(ApiResult.success(productionLotService.submitForApproval(id, userDetails)));
    }

    @PostMapping("/{id}/approve")
    @PreAuthorize("hasRole('VT-02')")
    public ResponseEntity<ApiResult<CreateProductionLotResponse>> approve(
            @PathVariable UUID id,
            @Valid @RequestBody ApproveProductionLotRequest request) {

        permissionChecker.check("PRODUCTION_LOT", "UPDATE");
        CustomUserDetails userDetails = SecurityUtils.getCurrentUserDetails();
        CreateProductionLotResponse response = productionLotService.approveProductionLot(id, request, userDetails);
        return ResponseEntity.ok(ApiResult.success(response));
    }

    @GetMapping("/dashboard")
    @PreAuthorize("hasAnyRole('VT-01', 'VT-02')")
    public ResponseEntity<ApiResult<ProductionLotDashboardResponse>> getDashboard(
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate startDate,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate endDate,
            @RequestParam(required = false) UUID organizationId,
            @RequestParam(required = false, defaultValue = "MONTH") String groupBy,
            @AuthenticationPrincipal CustomUserDetails userDetails,
            HttpServletRequest request) {
        String ipAddress = getClientIp(request);
        ProductionLotDashboardResponse response = productionLotService.getDashboard(startDate, endDate, organizationId,
                groupBy, userDetails, ipAddress);
        return ResponseEntity.ok(ApiResult.success(response));
    }

    private String getClientIp(HttpServletRequest request) {
        String xfHeader = request.getHeader("X-Forwarded-For");
        if (xfHeader == null || xfHeader.isEmpty() || "unknown".equalsIgnoreCase(xfHeader)) {
            return request.getRemoteAddr();
        }
        return xfHeader.split(",")[0].trim();
    }

    /**
     * API lấy lịch sử nhập dữ liệu lô sản xuất.
     * GET /api/v1/production-lots/import-history
     */
    @GetMapping("/import-history")
    @PreAuthorize("hasAnyRole('VT-01', 'VT-02')")
    public ResponseEntity<ApiResult<List<ProductionLotImportHistoryResponse>>> getImportHistory(
            @AuthenticationPrincipal CustomUserDetails userDetails) {

        UUID organizationId = userDetails.getOrganizationId();
        List<ProductionLotImportHistoryResponse> history = importHistoryRepository
                .findByOrganization_OrganizationIdOrderByImportedAtDesc(organizationId)
                .stream()
                .map(h -> ProductionLotImportHistoryResponse.builder()
                        .id(h.getId())
                        .fileName(h.getFileName())
                        .totalRows(h.getTotalRows())
                        .successCount(h.getSuccessCount())
                        .failedCount(h.getFailedCount())
                        .status(h.getStatus().name())
                        .importedAt(h.getImportedAt().toInstant(java.time.ZoneOffset.UTC))
                        .build())
                .toList();

        return ResponseEntity.ok(ApiResult.success(history));
    }

    /**
     * API nhập danh sách lô sản xuất từ tệp CSV.
     * Sử dụng @RequestParam để nhận file và organizationId (tùy chọn) riêng biệt,
     * tránh lỗi bind UUID từ chuỗi rỗng khi dùng @ModelAttribute.
     */
    @PostMapping(value = "/import", consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    @PreAuthorize("hasAnyRole('VT-01', 'VT-02')")
    public ResponseEntity<ApiResult<ProductionLotImportResultResponse>> importProductionLots(
            @RequestParam("file") MultipartFile file,
            @RequestParam(value = "organizationId", required = false) String organizationIdStr,
            @AuthenticationPrincipal CustomUserDetails userDetails) {

        ProductionLotImportRequest request = new ProductionLotImportRequest();
        request.setFile(file);
        if (organizationIdStr != null && !organizationIdStr.isBlank()) {
            try {
                request.setOrganizationId(UUID.fromString(organizationIdStr.trim()));
            } catch (IllegalArgumentException e) {
                throw new vn.nguongocso.exception.BusinessException("Mã tổ chức không hợp lệ.");
            }
        }

        ProductionLotImportResultResponse response = productionLotImportService.importProductionLots(
                request,
                userDetails);

        return ResponseEntity.ok(ApiResult.success(response));
    }
}
