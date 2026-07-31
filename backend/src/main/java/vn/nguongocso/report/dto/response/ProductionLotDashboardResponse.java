package vn.nguongocso.report.dto.response;

import lombok.*;
import java.util.List;
import java.util.Map;

/**
 * DTO đại diện cho dữ liệu trả về của bảng điều khiển.
 */
@Getter
@Setter
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class ProductionLotDashboardResponse {

    private SummaryDto summary;
    private Map<String, Long> byStatus;
    private List<TimeSeriesDto> timeSeries;

    @Getter
    @Setter
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class SummaryDto {
        private Long totalLots;
        private Double totalExpectedYield;
        private Double totalActualYield;
    }

    @Getter
    @Setter
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class TimeSeriesDto {
        private String period;
        private Long lotCount;
        private Double expectedYield;
        private Double actualYield;
    }
}
