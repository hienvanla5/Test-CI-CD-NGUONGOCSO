package vn.nguongocso.farm.dto.request;

import jakarta.validation.constraints.NotNull;

import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
public class ApproveProductionLotRequest {

    @NotNull(message = "Trạng thái duyệt không được để trống")
    private Boolean approved;

    private String reason;
}
