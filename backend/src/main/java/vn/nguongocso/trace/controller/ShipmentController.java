package vn.nguongocso.trace.controller;

import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.ResponseStatus;
import org.springframework.web.bind.annotation.RestController;

import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import vn.nguongocso.common.ApiResult;
import vn.nguongocso.trace.dto.request.CreateShipmentRequest;
import vn.nguongocso.trace.dto.response.ShipmentResponse;
import vn.nguongocso.trace.service.ShipmentService;

@RestController
@RequestMapping("/api/v1/shipments")
@RequiredArgsConstructor
public class ShipmentController {

	private final ShipmentService shipmentService;

	@PostMapping
	@ResponseStatus(HttpStatus.CREATED)
	public ApiResult<ShipmentResponse> createShipment(@Valid @RequestBody CreateShipmentRequest request) {

		return ApiResult.success(shipmentService.createShipment(request));
	}

}
