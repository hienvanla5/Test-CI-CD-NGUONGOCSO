package vn.nguongocso.event.service;

import org.springframework.data.domain.Pageable;
import vn.nguongocso.auth.service.CustomUserDetails;
import vn.nguongocso.common.PageResponse;
import vn.nguongocso.event.dto.response.FailedEventLogResponse;
import vn.nguongocso.event.dto.response.LotValidationResponse;
import vn.nguongocso.event.enums.ChainEventType;

import java.util.UUID;

public interface EventValidationService {
    LotValidationResponse validateLot(UUID lotId, ChainEventType eventType, CustomUserDetails currentUser);
    void deleteDraft(UUID draftId, CustomUserDetails currentUser);
    PageResponse<FailedEventLogResponse> getFailedLogs(Pageable pageable);
    void logFailedAttempt(UUID lotId, String lotCode, ChainEventType eventType, String reason, CustomUserDetails currentUser);
}
