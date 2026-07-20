package vn.nguongocso.farm.controller;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import vn.nguongocso.common.ApiResult;
import vn.nguongocso.farm.dto.request.CreateFarmAreaRequest;
import vn.nguongocso.farm.dto.response.FarmAreaResponse;
import vn.nguongocso.farm.service.FarmAreaService;

/**
 * REST Controller quản lý các API liên quan đến vùng trồng.
 */
@RestController
@RequestMapping("/api/v1/farm-areas")
@RequiredArgsConstructor
public class FarmAreaController {

    private static final Logger log = LoggerFactory.getLogger(FarmAreaController.class);

    private final FarmAreaService farmAreaService;

    /**
     * Tạo mới vùng trồng.
     *
     * @param request thông tin vùng trồng cần tạo
     * @return thông tin vùng trồng sau khi tạo thành công
     */
    @PostMapping
    public ResponseEntity<ApiResult<FarmAreaResponse>> create(
            @Valid @RequestBody CreateFarmAreaRequest request) {

        log.info("Nhận yêu cầu tạo vùng trồng với tên: {}", request.getName());

        FarmAreaResponse response = farmAreaService.create(request);

        log.info("Tạo vùng trồng thành công, id={}", response.getId());

        return ResponseEntity.status(HttpStatus.CREATED)
                .body(ApiResult.success(
                        HttpStatus.CREATED.value(),
                        response));
    }
}