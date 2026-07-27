package vn.nguongocso.event.controller;

import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;
import vn.nguongocso.auth.service.CustomUserDetails;
import vn.nguongocso.common.ApiResult;
import vn.nguongocso.event.dto.request.RecordHarvestEventRequest;
import vn.nguongocso.event.dto.request.RecordPackagingEventRequest;
import vn.nguongocso.event.dto.response.ChainEventResponse;
import vn.nguongocso.event.service.ChainEventService;

@RestController
@RequestMapping("/api/v1/chain-events")
@RequiredArgsConstructor
public class ChainEventController {

    private final ChainEventService chainEventService;

    @PostMapping("/harvest")
    @PreAuthorize("hasAnyRole('VT-02', 'VT-03')")
    public ResponseEntity<ApiResult<ChainEventResponse>> recordHarvest(
            @Valid @RequestBody RecordHarvestEventRequest request,
            @AuthenticationPrincipal CustomUserDetails currentUser
    ) {
        ChainEventResponse response =
                chainEventService.recordHarvestEvent(request, currentUser);

        return ResponseEntity
                .status(HttpStatus.CREATED)
                .body(ApiResult.success(HttpStatus.CREATED.value(), response));
    }

    @PostMapping("/packaging")
    @PreAuthorize("hasAnyRole('VT-02', 'VT-03')")
    public ResponseEntity<ApiResult<ChainEventResponse>> recordPackaging(
            @Valid @RequestBody RecordPackagingEventRequest request,
            @AuthenticationPrincipal CustomUserDetails currentUser
    ) {
        ChainEventResponse response =
                chainEventService.recordPackagingEvent(request, currentUser);

        return ResponseEntity
                .status(HttpStatus.CREATED)
                .body(ApiResult.success(HttpStatus.CREATED.value(), response));
    }
}
