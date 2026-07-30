package vn.nguongocso.alert_reclaimLot_history.dto.response;

import lombok.Builder;
import lombok.Getter;
import java.time.Instant;
import java.util.UUID;

@Getter
@Builder
public class ActivityLogResponse {
    private UUID id;
    private UUID userId;
    private String username;
    private String fullName;
    private String action;
    private String description;
    private String entityType;
    private UUID entityId;
    private String ipAddress;
    private Instant createdAt;
}
