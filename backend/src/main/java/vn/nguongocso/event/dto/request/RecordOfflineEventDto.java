package vn.nguongocso.event.dto.request;

import jakarta.validation.constraints.NotEmpty;
import jakarta.validation.constraints.NotNull;
import lombok.Getter;
import lombok.Setter;
import vn.nguongocso.event.enums.ChainEventType;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Map;
import java.util.UUID;

@Getter
@Setter
public class RecordOfflineEventDto {

    @NotNull(message = "ID sự kiện ngoại tuyến không được để trống")
    private UUID offlineEventId;

    @NotNull(message = "Vui lòng chọn lô sản xuất/lô hàng")
    private UUID productionLotId;

    @NotNull(message = "Loại sự kiện không được để trống")
    private ChainEventType eventType;

    @NotNull(message = "Thời điểm ghi nhận không được để trống")
    private LocalDateTime recordedAt;

    @NotNull(message = "Vĩ độ không được để trống")
    private Double latitude;

    @NotNull(message = "Kinh độ không được để trống")
    private Double longitude;

    @NotEmpty(message = "Sự kiện ngoại tuyến yêu cầu tối thiểu một hình ảnh thực địa")
    private List<String> images;

    private String deviceSource = "MOBILE";

    @NotNull(message = "Dữ liệu sự kiện không được để trống")
    private Map<String, Object> eventData;
}
