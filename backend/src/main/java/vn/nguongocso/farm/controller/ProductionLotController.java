package vn.nguongocso.farm.controller;

import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;
import vn.nguongocso.farm.dto.request.ApproveProductionLotRequest;
import vn.nguongocso.farm.dto.request.CreateProductionLotRequest;
import vn.nguongocso.farm.dto.response.CreateProductionLotResponse;
import vn.nguongocso.auth.service.CustomUserDetails;
import vn.nguongocso.farm.service.ProductionLotService;
import vn.nguongocso.common.ApiResult;

import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/api/v1/production-lots")
@RequiredArgsConstructor
public class ProductionLotController {

    private final ProductionLotService productionLotService;

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

        CreateProductionLotResponse response = productionLotService.createProductionLot(request, userDetails);
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

        List<CreateProductionLotResponse> response = productionLotService.getAllProductionLots(userDetails);
        return ResponseEntity.ok(ApiResult.success(response));
    }
    // Thêm import:
    /**
     * API gửi duyệt nhật ký lô sản xuất.
     * Chuyển trạng thái: DRAFT -> PENDING.
     */
    @PutMapping("/{id}/submit")
    @PreAuthorize("hasAnyRole('VT-02', 'VT-03')")
    public ResponseEntity<ApiResult<CreateProductionLotResponse>> submit(
            @PathVariable UUID id,
            @AuthenticationPrincipal CustomUserDetails userDetails) {
        CreateProductionLotResponse response = productionLotService.submitProductionLot(id, userDetails);
        return ResponseEntity.ok(ApiResult.success(response));
    }

    /**
     * API phê duyệt hoặc từ chối nhật ký lô sản xuất.
     * Chuyển trạng thái: PENDING -> APPROVED hoặc trả về DRAFT.
     */
    @PutMapping("/{id}/approve")
    @PreAuthorize("hasAnyRole('VT-02', 'VT-05')")
    public ResponseEntity<ApiResult<CreateProductionLotResponse>> approve(
            @PathVariable UUID id,
            @Valid @RequestBody ApproveProductionLotRequest request,
            @AuthenticationPrincipal CustomUserDetails userDetails) {
        CreateProductionLotResponse response = productionLotService.approveProductionLot(id, request, userDetails);
        return ResponseEntity.ok(ApiResult.success(response));
    }

}
