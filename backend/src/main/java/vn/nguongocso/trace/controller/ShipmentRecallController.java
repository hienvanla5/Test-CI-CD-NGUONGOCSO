package vn.nguongocso.trace.controller;

import java.util.UUID;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.validation.annotation.Validated;
import org.springframework.web.bind.annotation.*;

import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import vn.nguongocso.common.ApiResult;
import vn.nguongocso.permission.service.PermissionChecker;
import vn.nguongocso.trace.dto.request.RecallRequest;
import vn.nguongocso.trace.dto.response.RecallInfoResponse;
import vn.nguongocso.trace.dto.response.RecallResponse;
import vn.nguongocso.trace.service.ShipmentRecallService;

/**
 * Controller quản lý thu hồi lô hàng.
 */
@RestController
@RequestMapping("/api/v1/shipments")
@RequiredArgsConstructor
@Validated
public class ShipmentRecallController {
        private final ShipmentRecallService shipmentRecallService;
        private final PermissionChecker permissionChecker;

        /**
         * Thu hồi một lô hàng.
         *
         * POST /api/v1/shipments/{shipmentId}/recall
         */
        @PostMapping("/{shipmentId}/recall")
        public ResponseEntity<ApiResult<RecallResponse>> recallShipment(
                        @PathVariable UUID shipmentId,
                        @Valid @RequestBody RecallRequest request) {

                permissionChecker.check("SHIPMENT", "CREATE");
                RecallResponse response = shipmentRecallService.recallShipment(shipmentId, request);

                return ResponseEntity.status(HttpStatus.CREATED)
                                .body(ApiResult.success(
                                                HttpStatus.CREATED.value(),
                                                response));
        }

        /**
         * Lấy thông tin thu hồi của lô hàng.
         *
         * GET /api/v1/shipments/{shipmentId}/recall
         */
        @GetMapping("/{shipmentId}/recall")
        public ResponseEntity<ApiResult<RecallInfoResponse>> getRecallInfo(
                        @PathVariable UUID shipmentId) {

                permissionChecker.check("SHIPMENT", "READ");
                RecallInfoResponse response = shipmentRecallService.getRecallInfo(shipmentId);

                return ResponseEntity.ok(
                                ApiResult.success(
                                                HttpStatus.OK.value(),
                                                response));
        }
}