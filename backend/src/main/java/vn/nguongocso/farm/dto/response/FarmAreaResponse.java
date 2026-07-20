package vn.nguongocso.farm.dto.response;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.UUID;

import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

/**
 * DTO phản hồi sau khi tạo vùng trồng.
 */
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
public class FarmAreaResponse {

    private UUID id;

    private String name;

    private UUID organizationId;

    private String organizationName;

    private UUID cropTypeId;

    private String cropTypeName;

    private Double latitude;

    private Double longitude;

    private BigDecimal area;

    private LocalDateTime createdAt;

    private LocalDateTime updatedAt;
}