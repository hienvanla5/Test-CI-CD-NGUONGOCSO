package vn.nguongocso.farm.controller;

import org.springframework.web.bind.annotation.*;

import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import vn.nguongocso.common.ApiResult;
import vn.nguongocso.farm.dto.request.CreateFarmLogRequest;
import vn.nguongocso.farm.dto.response.FarmLogResponse;
import vn.nguongocso.farm.service.FarmLogService;

import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/api/v1/farm-logs")
@RequiredArgsConstructor
public class FarmLogController {

    private final FarmLogService farmLogService;

    /**
     * Ghi nhật ký canh tác.
     *
     * @param request thông tin nhật ký canh tác
     * @return thông tin nhật ký vừa tạo
     */
    @PostMapping
    public ApiResult<FarmLogResponse> create(
            @Valid @RequestBody CreateFarmLogRequest request) {

        return ApiResult.success(farmLogService.create(request));
    }
    /**
     * Lấy danh sách nhật ký canh tác của lô sản xuất.
     *
     * @param lotId ID của lô sản xuất
     * @return danh sách nhật ký canh tác
     */
    @GetMapping("/production-lot/{lotId}")
    public ApiResult<List<FarmLogResponse>> getLogsByProductionLot(@PathVariable UUID lotId) {
        return ApiResult.success(farmLogService.getLogsByProductionLot(lotId));
    }

}