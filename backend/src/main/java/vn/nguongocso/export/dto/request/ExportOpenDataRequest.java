package vn.nguongocso.export.dto.request;

import jakarta.validation.constraints.Pattern;
import lombok.Getter;
import lombok.Setter;
import java.time.LocalDateTime;
import java.util.List;
import java.util.UUID;

@Getter
@Setter
public class ExportOpenDataRequest {
    private UUID organizationId;
    private LocalDateTime fromDate;
    private LocalDateTime toDate;
    private List<UUID> productCategoryIds;
    private List<UUID> shipmentIds; // Nếu có thì ưu tiên lọc theo danh sách này

    @Pattern(regexp = "^(JSON|XML|CSV)$", message = "Định dạng chỉ hỗ trợ JSON, XML hoặc CSV")
    private String format = "JSON"; // Mặc định JSON
}