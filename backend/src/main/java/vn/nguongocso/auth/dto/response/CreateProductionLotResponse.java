package vn.nguongocso.auth.dto.response;

import lombok.Builder;
import lombok.Getter;
import lombok.Setter;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.UUID;

@Getter
@Setter
@Builder
public class CreateProductionLotResponse {

        private UUID id;

        private String organizationName;

        private String farmAreaName;

        private String productCategoryName;

        private String name;

        private Double expectedQuantity;

        private Double actualQuantity;

        private LocalDate plantingDate;

        private LocalDate harvestDate;

        private String status;

        private String approvalNotes;

        private String createdByName;

        private String approvedByName;

        private LocalDateTime createdAt;

        private LocalDateTime updatedAt;
}
