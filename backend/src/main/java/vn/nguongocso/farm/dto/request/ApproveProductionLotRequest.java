package vn.nguongocso.farm.dto.request;

import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;
import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
public class ApproveProductionLotRequest {

    @NotNull(message = "Vui lòng truyền trạng thái phê duyệt (approved)")
    private Boolean approved;

    @Size(max = 1000, message = "Ý kiến kiểm duyệt không được vượt quá 1000 ký tự")
    private String approvalNotes;
}
