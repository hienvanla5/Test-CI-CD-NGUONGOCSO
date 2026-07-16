package vn.nguongocso.auth.entity;


import jakarta.persistence.*;
import lombok.*;
import java.util.UUID;

@Entity
@Table(name = "product_category")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class ProductCategory {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private UUID id;

    @Column(nullable = false)
    private String name;

    @Column(name = "product_group")
    private String group;

    private String description;

    @Column(name = "is_active")
    @Builder.Default
    private Boolean isActive = true;
}
