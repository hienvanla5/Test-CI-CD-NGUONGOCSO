-- V18__create_backup_restore_tables.sql

-- 1. Bảng cấu hình lịch sao lưu
CREATE TABLE backup_schedules (
    id INT AUTO_INCREMENT PRIMARY KEY,
    cron_expression VARCHAR(100) NOT NULL COMMENT 'Cron expression xác định thời gian chạy',
    description VARCHAR(255) NULL COMMENT 'Mô tả lịch sao lưu',
    is_active TINYINT(1) NOT NULL DEFAULT 1 COMMENT 'Trạng thái kích hoạt (1: Active, 0: Inactive)',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    updated_by CHAR(36) NULL,
    CONSTRAINT fk_backup_schedules_user FOREIGN KEY (updated_by) REFERENCES users(user_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 2. Bảng gộp lịch sử sao lưu và phục hồi dữ liệu
CREATE TABLE backup_restore_history (
    id INT AUTO_INCREMENT PRIMARY KEY,
    operation_type VARCHAR(50) NOT NULL COMMENT 'Loại thao tác: BACKUP hoặc RESTORE',
    file_name VARCHAR(255) NULL COMMENT 'Tên file backup',
    file_path VARCHAR(512) NULL COMMENT 'Đường dẫn vật lý tới file backup trên server',
    file_size BIGINT NULL COMMENT 'Kích thước file backup tính bằng bytes',
    backup_type VARCHAR(50) NULL COMMENT 'Loại backup (SCHEDULED: Tự động, MANUAL: Thủ công)',
    status VARCHAR(50) NOT NULL COMMENT 'Trạng thái (IN_PROGRESS, SUCCESS, FAILED)',
    error_message TEXT NULL COMMENT 'Chi tiết lỗi nếu thao tác thất bại',
    reference_id INT NULL COMMENT 'ID bản ghi BACKUP gốc được dùng để khôi phục (chỉ cho RESTORE)',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    created_by CHAR(36) NULL COMMENT 'Người thực hiện (NULL nếu do hệ thống chạy tự động)',
    CONSTRAINT fk_br_history_user FOREIGN KEY (created_by) REFERENCES users(user_id),
    CONSTRAINT fk_br_history_ref FOREIGN KEY (reference_id) REFERENCES backup_restore_history(id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Thêm chỉ mục để tối ưu truy vấn lịch sử
CREATE INDEX idx_br_history_op_type ON backup_restore_history(operation_type);
CREATE INDEX idx_br_history_status ON backup_restore_history(status);

-- Seed cấu hình lịch mặc định (Hàng ngày lúc 02:00 sáng, trạng thái Active)
INSERT INTO backup_schedules (cron_expression, description, is_active, updated_by)
VALUES ('0 0 2 * * ?', 'Sao lưu dữ liệu tự động hằng ngày lúc 02:00 sáng', 1, NULL);
