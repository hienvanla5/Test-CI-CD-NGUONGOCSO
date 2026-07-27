package vn.nguongocso.event.dto.request;

import java.time.LocalDateTime;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
public class RecordTransportEventRequest {

    @NotBlank(message = "Vui lòng nhập đầy đủ thông tin sự kiện vận chuyển.")
    private String codeValue;

    @NotBlank(message = "Vui lòng nhập đầy đủ thông tin sự kiện vận chuyển.")
    private String fromLocation;

    @NotBlank(message = "Vui lòng nhập đầy đủ thông tin sự kiện vận chuyển.")
    private String toLocation;

    @NotNull(message = "Vui lòng nhập đầy đủ thông tin sự kiện vận chuyển.")
    private LocalDateTime transportTime;
}