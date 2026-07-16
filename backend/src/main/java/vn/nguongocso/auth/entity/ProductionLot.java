package vn.nguongocso.auth.entity;

import jakarta.persistence.*;
import lombok.*;
import vn.nguongocso.auth.enums.ProductionLotStatus;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.UUID;


@Entity
@Table(name = "production_lot")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class ProductionLot {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private UUID id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "organization_id", nullable = false)
    private Organization organization;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "farm_area_id")
    private FarmArea farmArea;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "product_category_id", nullable = false)
    private ProductCategory productCategory;

    @Column(nullable = false)
    private String name;

    @Column(name = "expected_quantity", nullable = false)
    private Double expectedQuantity;

    @Column(name = "actual_quantity")
    private Double actualQuantity;

    @Column(name = "planting_date")
    private LocalDate plantingDate;

    @Column(name = "harvest_date")
    private LocalDate harvestDate;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private ProductionLotStatus status;

    @Column(name = "approval_notes")
    private String approvalNotes;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "created_by")
    private User createdBy;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "approved_by")
    private User approvedBy;

    @Column(name = "created_at")
    private LocalDateTime createdAt;

    @Column(name = "updated_at")
    private LocalDateTime updatedAt;

    @PrePersist
    public void prePersist() {
        this.createdAt = LocalDateTime.now();
        this.updatedAt = this.createdAt;
        if (this.status == null) {
            this.status = ProductionLotStatus.DRAFT;
        }
    }

    @PreUpdate
    public void preUpdate() {
        this.updatedAt = LocalDateTime.now();
    }
}
