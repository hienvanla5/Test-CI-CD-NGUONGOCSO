package vn.nguongocso.auth.entity;

import jakarta.persistence.*;
import lombok.*;

import java.time.LocalDateTime;
import java.util.UUID;

@Entity
@Table(name = "farm_area")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class FarmArea {

        @Id
        @GeneratedValue(strategy = GenerationType.UUID)
        private UUID id;

        @ManyToOne(fetch = FetchType.LAZY)
        @JoinColumn(name = "organization_id", nullable = false)
        private Organization organization;

        @Column(nullable = false)
        private String name;

        private Double latitude;

        private Double longitude;

        @Column(nullable = false)
        private Float area;

        @ManyToOne(fetch = FetchType.LAZY)
        @JoinColumn(name = "crop_type_id")
        private ProductCategory cropType;

        @Column(name = "created_at")
        private LocalDateTime createdAt;

        @Column(name = "updated_at")
        private LocalDateTime updatedAt;

        @PrePersist
        public void prePersist() {
            this.createdAt = LocalDateTime.now();
            this.updatedAt = this.createdAt;
        }

        @PreUpdate
        public void preUpdate() {
            this.updatedAt = LocalDateTime.now();
        }

}
