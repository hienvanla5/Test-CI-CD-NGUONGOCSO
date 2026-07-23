package vn.nguongocso.trace.dto.response;

import java.time.LocalDateTime;
import java.util.List;
import java.util.UUID;

import lombok.Builder;
import lombok.Data;
import vn.nguongocso.trace.enums.ShipmentStatus;

@Data
@Builder
public class ShipmentResponse {

    private UUID id;

    private UUID productionLotId;

    private String productionLotName;

    private String name;

    private Double totalQuantity;

    private String packagingInfo;

    private ShipmentStatus status;

    private List<TraceCodeResponse> traceCodes;

    private String createdByName;

    private LocalDateTime createdAt;

}