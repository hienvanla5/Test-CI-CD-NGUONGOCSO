package vn.nguongocso.farm.controller;

import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import vn.nguongocso.common.ApiResult;
import vn.nguongocso.farm.dto.request.CreateFarmAreaRequest;
import vn.nguongocso.farm.dto.response.FarmAreaResponse;
import vn.nguongocso.farm.service.FarmAreaService;
import vn.nguongocso.permission.service.PermissionChecker;

import java.util.List;

@RestController
@RequestMapping("/api/v1/farm-areas")
@RequiredArgsConstructor
public class FarmAreaController {

    private final FarmAreaService farmAreaService;
    private final PermissionChecker permissionChecker;

    @GetMapping
    public ResponseEntity<ApiResult<List<FarmAreaResponse>>> getFarmAreas() {
        permissionChecker.check("FARM_AREA", "READ");
        return ResponseEntity.ok(ApiResult.success(farmAreaService.getFarmAreas()));
    }

    @PostMapping
    public ResponseEntity<ApiResult<FarmAreaResponse>> createFarmArea(
            @Valid @RequestBody CreateFarmAreaRequest request) {
        permissionChecker.check("FARM_AREA", "CREATE");
        return ResponseEntity.ok(ApiResult.success(farmAreaService.create(request)));
    }
}