package vn.nguongocso.trace.entity;

import jakarta.persistence.*;
import lombok.*;
import vn.nguongocso.organization.entity.Organization;

import java.time.LocalDateTime;
import java.util.UUID;

@Entity
@Table(name = "code_ranges")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class CodeRange {

    @Id
    private UUID id;

    @ManyToOne
    @JoinColumn(name = "organization_id", nullable = false)
    private Organization organization;

    @Column(nullable = false, unique = true)
    private String prefix;

    @Column(name = "from_number")
    private Long fromNumber;

    @Column(name = "to_number")
    private Long toNumber;

    @Column(name = "total_limit", nullable = false)
    private Long totalLimit;

    @Column(name = "used_count", nullable = false)
    private Long usedCount;

    @Column(name = "created_by")
    private UUID createdBy;

    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;

    @PrePersist
    protected void onCreate() {
        if (id == null) id = UUID.randomUUID();
        if (usedCount == null) usedCount = 0L;
        createdAt = LocalDateTime.now();
        updatedAt = createdAt;
    }

    @PreUpdate
    protected void onUpdate() {
        updatedAt = LocalDateTime.now();
    }

}
