package vn.nguongocso.trace.controller;

import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.*;

import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import vn.nguongocso.common.ApiResult;
import vn.nguongocso.trace.dto.request.CreateShipmentRequest;
import vn.nguongocso.trace.dto.response.ShipmentResponse;
import vn.nguongocso.trace.service.ShipmentService;

import java.util.UUID;

/**
 * API quản lý lô hàng.
 */
@RestController
@RequestMapping("/api/v1/shipments")
@RequiredArgsConstructor
public class ShipmentController {

	private final ShipmentService shipmentService;

    /**
     * Tạo lô hàng và sinh mã truy xuất.
     *
     * @param request thông tin tạo lô hàng
     * @return thông tin lô hàng
     */
	@PostMapping
	@ResponseStatus(HttpStatus.CREATED)
	public ApiResult<ShipmentResponse> createShipment(@Valid @RequestBody CreateShipmentRequest request) {

		return ApiResult.success(shipmentService.createShipment(request));
	}
	@PostMapping("/{id}/activate")
	public ApiResult<ShipmentResponse> activateStamps(@PathVariable UUID id) {
		return ApiResult.success(shipmentService.activateShipmentStamps(id));
	}

}

