package vn.nguongocso.event.dto.response;

import lombok.Builder;
import lombok.Data;
import java.util.UUID;

@Data
@Builder
public class LotValidationResponse {
    private UUID lotId;
    private String eventType;
    private boolean valid;
    private String message;
    private LotDetails details;

    @Data
    @Builder
    public static class LotDetails {
        private String lotType; // "PRODUCTION_LOT" hoặc "SHIPMENT"
        private String currentStatus;
        private UUID organizationId;
    }
}
