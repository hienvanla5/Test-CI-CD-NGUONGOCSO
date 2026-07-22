package vn.nguongocso.farm.controller;

import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import vn.nguongocso.common.ApiResult;
import vn.nguongocso.farm.dto.request.CreateFarmLogRequest;
import vn.nguongocso.farm.dto.response.FarmLogResponse;
import vn.nguongocso.farm.service.FarmLogService;

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
}