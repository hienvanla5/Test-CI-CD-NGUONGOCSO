package vn.nguongocso.event.entity;


import jakarta.persistence.*;
import lombok.*;
import org.hibernate.annotations.JdbcTypeCode;
import org.hibernate.type.SqlTypes;
import org.locationtech.jts.geom.Point;
import vn.nguongocso.auth.entity.User;
import vn.nguongocso.event.enums.ChainEventType;
import vn.nguongocso.trace.entity.Shipment;

import java.time.LocalDateTime;
import java.util.UUID;

/**
 * Thực thể đại diện cho một sự kiện trong chuỗi cung ứng.
 * <p>
 * Mỗi sự kiện ghi lại một hoạt động cụ thể trong vòng đời của một lô hàng,
 * bao gồm thông tin về loại sự kiện, dữ liệu chi tiết, vị trí, thời gian và
 * người ghi nhận. Sự kiện có thể liên kết với nhau thông qua {@code parentEvent}
 * để tạo thành một chuỗi các hoạt động.</p>
 *
 * <p>Các loại sự kiện bao gồm:
 * <ul>
 *   <li>THU HOẠCH - Ghi nhận quá trình thu hoạch</li>
 *   <li>ĐÓNG GÓI - Ghi nhận quá trình đóng gói</li>
 *   <li>VẬN CHUYỂN - Ghi nhận quá trình vận chuyển</li>
 *   <li>THU MUA - Ghi nhận quá trình thu mua</li>
 *   <li>SỬA LỖI - Điều chỉnh dữ liệu sự kiện trước đó</li>
 * </ul>
 * </p>
 *
 * @author Triệu Văn Đại
 */


@Entity
@Table(name = "chain_events")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class ChainEvent {

    @Id
    @JdbcTypeCode(SqlTypes.CHAR)
    @Column(name = "id", nullable = false, updatable = false)
    private UUID id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "shipment_id")
    private Shipment shipment;

    @Enumerated(EnumType.STRING)
    @Column(name = "event_type", nullable = false)
    private ChainEventType eventType;

    @Column(name = "event_data", columnDefinition = "json")
    private String eventData;


    @Column(name = "location", columnDefinition = "geometry")
    private Point location;

    @Column(name = "recorded_at", nullable = false)
    private LocalDateTime recordedAt;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "recorded_by", nullable = false)
    private User recordedBy;

    @Column(name = "created_at", nullable = false, updatable = false)
    private LocalDateTime createdAt;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "parent_event_id")
    private ChainEvent parentEvent;

    @Column(name = "is_correction", nullable = false)
    private boolean isCorrection;

    @PrePersist
    protected void onCreate() {
        if (id == null) {
            id = UUID.randomUUID();
        }
        createdAt = LocalDateTime.now();
    }
}

