package vn.nguongocso.farm.dto.request;

import jakarta.validation.constraints.NotNull;
import lombok.Data;

@Data
public class ApproveProductionLotRequest {

    @NotNull
    private Boolean approved;

    private String reason;
}
