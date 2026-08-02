package vn.nguongocso.event.dto.response;

import lombok.Builder;
import lombok.Getter;
import java.util.List;
import java.util.UUID;

@Getter
@Builder
public class OfflineEventSyncResponse {
    private UUID syncId;
    private int totalEvents;
    private int successCount;
    private int duplicateCount;
    private int failedCount;
    private List<OfflineEventSyncResultDto> results;
}
