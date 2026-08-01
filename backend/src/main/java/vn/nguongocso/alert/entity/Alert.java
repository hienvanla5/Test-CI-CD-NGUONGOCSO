package vn.nguongocso.alert.entity;

import java.time.LocalDateTime;
import java.util.UUID;

import org.hibernate.annotations.JdbcTypeCode;
import org.hibernate.type.SqlTypes;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.EnumType;
import jakarta.persistence.Enumerated;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.Id;
import jakarta.persistence.Table;
import lombok.Getter;
import lombok.Setter;
import vn.nguongocso.alert.enums.AlertSeverity;
import vn.nguongocso.alert.enums.AlertStatus;
import vn.nguongocso.alert.enums.AlertType;

/** Bảng lưu thông tin cảnh báo. */
@Getter
@Setter
@Entity
@Table(name = "alerts")
public class Alert {

    @Id
    @Column(name = "id", nullable = false, updatable = false)
    @JdbcTypeCode(SqlTypes.CHAR)
    private UUID id;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private AlertType type;

    @Column(nullable = false)
    private String relatedEntityType;

    @Column(nullable = false)
    private UUID relatedEntityId;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private AlertSeverity severity;

    @JdbcTypeCode(SqlTypes.JSON)
    @Column(columnDefinition = "json", nullable = false)
    private AlertDetails details;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private AlertStatus status;

    @Column(nullable = false)
    private LocalDateTime createdAt;

    private LocalDateTime resolvedAt;

    private UUID resolvedBy;
}