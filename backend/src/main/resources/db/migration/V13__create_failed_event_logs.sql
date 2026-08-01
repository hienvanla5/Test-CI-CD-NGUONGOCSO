CREATE TABLE failed_event_logs (
    id CHAR(36) PRIMARY KEY,
    user_id CHAR(36) NOT NULL,
    event_type VARCHAR(50) NOT NULL,
    lot_id CHAR(36) NOT NULL,
    lot_code VARCHAR(255) NULL,
    failure_reason TEXT NOT NULL,
    attempted_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT fk_failed_event_log_user FOREIGN KEY (user_id) REFERENCES users(user_id)
);
