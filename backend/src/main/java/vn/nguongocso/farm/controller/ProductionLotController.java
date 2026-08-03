package vn.nguongocso.farm.controller;

import jakarta.servlet.http.HttpServletRequest;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;
import vn.nguongocso.auth.security.SecurityUtils;
import vn.nguongocso.farm.dto.request.ApproveProductionLotRequest;
import vn.nguongocso.farm.dto.request.CreateProductionLotRequest;
import vn.nguongocso.farm.dto.request.UpdateProductionLotRequest;
import vn.nguongocso.farm.dto.response.CreateProductionLotResponse;
import vn.nguongocso.auth.service.CustomUserDetails;
import vn.nguongocso.farm.dto.response.UpdateProductionLotResponse;
import vn.nguongocso.farm.service.ProductionLotService;
import vn.nguongocso.common.ApiResult;
import vn.nguongocso.permission.service.PermissionChecker;
import vn.nguongocso.report.dto.response.ProductionLotDashboardResponse;

import java.time.LocalDate;
import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/api/v1/production-lots")
@RequiredArgsConstructor
public class ProductionLotController {

    private final ProductionLotService productionLotService;
    private final PermissionChecker permissionChecker;

    /**
     * API tạo mới lô sản xuất.
     * Yêu cầu người dùng đã đăng nhập.
     * Bạn cũng có thể giới hạn quyền cụ thể như Quản lý tổ chức (VT-02) hoặc Người ghi nhận sự kiện (VT-03):
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
     * API lấy thông tin chi tiết lô sản xuất.
     * Yêu cầu người dùng đã đăng nhập.
     * Trả về đầy đủ thông tin cần thiết cho trang chỉnh sửa.
     */
    @GetMapping("/{id}")
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<ApiResult<CreateProductionLotResponse>> getById(@PathVariable UUID id) {
//        permissionChecker.check("PRODUCTION_LOT", "READ");
        CreateProductionLotResponse response = productionLotService.getProductionLotById(id);
        return ResponseEntity.ok(ApiResult.success(response));
    }

    @PutMapping("/{id}")
    @PreAuthorize("hasAnyRole('VT-02', 'VT-03')")
    public ResponseEntity<ApiResult<UpdateProductionLotResponse>> update(
            @PathVariable UUID id,
            @Valid @RequestBody UpdateProductionLotRequest request,
            @AuthenticationPrincipal CustomUserDetails userDetails) {
//        permissionChecker.check("PRODUCTION_LOT", "UPDATE");
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

//        permissionChecker.check("PRODUCTION_LOT", "READ");
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
        ProductionLotDashboardResponse response =
                productionLotService.getDashboard(startDate, endDate, organizationId, groupBy, userDetails, ipAddress);
        return ResponseEntity.ok(ApiResult.success(response));
    }
    private String getClientIp(HttpServletRequest request) {
        String xfHeader = request.getHeader("X-Forwarded-For");
        if (xfHeader == null || xfHeader.isEmpty() || "unknown".equalsIgnoreCase(xfHeader)) {
            return request.getRemoteAddr();
        }
        return xfHeader.split(",")[0].trim();
    }
}
