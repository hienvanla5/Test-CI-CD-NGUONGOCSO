-- Tạo bảng lưu trữ vết đồng bộ ngoại tuyến duy nhất
CREATE TABLE offline_sync_logs (
                                   id CHAR(36) NOT NULL,
                                   sync_id CHAR(36) NOT NULL,
                                   user_id CHAR(36) NOT NULL,
                                   offline_event_id CHAR(36) NOT NULL,
                                   production_lot_id CHAR(36) NULL,
                                   shipment_id CHAR(36) NULL,
                                   event_type VARCHAR(50) NOT NULL,
                                   status VARCHAR(20) NOT NULL, -- 'SUCCESS', 'DUPLICATE', 'FAILED'
                                   failure_reason TEXT NULL,
                                   synced_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,

                                   CONSTRAINT pk_offline_sync_logs PRIMARY KEY (id),
                                   CONSTRAINT uk_offline_sync_logs_offline_event UNIQUE (offline_event_id),
                                   CONSTRAINT fk_offline_sync_logs_user FOREIGN KEY (user_id) REFERENCES users(user_id)
);

-- Chỉ mục để tối ưu hóa việc tìm kiếm và thống kê
CREATE INDEX idx_offline_sync_logs_sync_id ON offline_sync_logs(sync_id);
CREATE INDEX idx_offline_sync_logs_user_id ON offline_sync_logs(user_id);
