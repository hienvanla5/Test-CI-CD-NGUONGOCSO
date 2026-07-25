package vn.nguongocso.event.controller;

import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;
import vn.nguongocso.auth.service.CustomUserDetails;
import vn.nguongocso.common.ApiResult;
import vn.nguongocso.event.dto.request.CorrectPackagingEventRequest;
import vn.nguongocso.event.dto.request.RecordHarvestEventRequest;
import vn.nguongocso.event.dto.request.RecordPackagingEventRequest;
import vn.nguongocso.event.dto.response.ChainEventResponse;
import vn.nguongocso.event.service.ChainEventService;

import java.util.UUID;

@RestController
@RequestMapping("/api/v1/chain-events")
@RequiredArgsConstructor
public class ChainEventController {

    private final ChainEventService chainEventService;

    /**
     * API ghi nhận sự kiện thu hoạch cho lô sản xuất.
     * Chỉ chấp nhận vai trò VT-02 (Quản lý HTX) và VT-03 (Người ghi sự kiện).
     */
    @PostMapping("/harvest")
    @PreAuthorize("hasAnyRole('VT-02', 'VT-03')")
    public ResponseEntity<ApiResult<ChainEventResponse>> recordHarvest(
            @Valid @RequestBody RecordHarvestEventRequest request,
            @AuthenticationPrincipal CustomUserDetails currentUser) {

        ChainEventResponse response = chainEventService.recordHarvestEvent(request, currentUser);
        return ResponseEntity.status(HttpStatus.CREATED).body(ApiResult.success(response));
    }
    /**
     * API ghi nhận sự kiện đóng gói cho lô sản xuất.
     */
    @PostMapping("/packaging")
    @PreAuthorize("hasAnyRole('VT-02', 'VT-03')")
    public ResponseEntity<ApiResult<ChainEventResponse>> recordPackaging(
            @Valid @RequestBody RecordPackagingEventRequest request,
            @AuthenticationPrincipal CustomUserDetails currentUser) {

        ChainEventResponse response = chainEventService.recordPackagingEvent(request, currentUser);
        return ResponseEntity.status(HttpStatus.CREATED).body(ApiResult.success(HttpStatus.CREATED.value(), response));
    }

    /**
     * API tạo sự kiện đính chính thông tin đóng gói (giữ nguyên gốc).
     */
    @PostMapping("/packaging/{id}/correct")
    @PreAuthorize("hasAnyRole('VT-02', 'VT-03')")
    public ResponseEntity<ApiResult<ChainEventResponse>> correctPackaging(
            @PathVariable("id") UUID originalEventId,
            @Valid @RequestBody CorrectPackagingEventRequest request,
            @AuthenticationPrincipal CustomUserDetails currentUser) {

        ChainEventResponse response = chainEventService.correctPackagingEvent(originalEventId, request, currentUser);
        return ResponseEntity.status(HttpStatus.CREATED).body(ApiResult.success(HttpStatus.CREATED.value(), response));
    }

}

