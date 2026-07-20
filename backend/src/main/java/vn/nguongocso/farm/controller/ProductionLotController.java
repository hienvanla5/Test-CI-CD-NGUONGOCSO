package vn.nguongocso.farm.controller;

import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;
import vn.nguongocso.farm.dto.request.CreateProductionLotRequest;
import vn.nguongocso.farm.dto.response.CreateProductionLotResponse;
import vn.nguongocso.auth.service.CustomUserDetails;
import vn.nguongocso.farm.service.ProductionLotService;
import vn.nguongocso.common.ApiResult;

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
}
