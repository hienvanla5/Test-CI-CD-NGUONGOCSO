CREATE TABLE report_access_log (
    id CHAR(36) NOT NULL,
    user_id CHAR(36) NOT NULL,
    organization_id CHAR(36) NOT NULL,
    target_organization_id CHAR(36) NOT NULL,
    report_name VARCHAR(255) NOT NULL,
    accessed_at DATETIME NOT NULL,
    success TINYINT(1) NOT NULL,
    ip_address VARCHAR(45) NULL,
    CONSTRAINT pk_report_access_log PRIMARY KEY (id),
    CONSTRAINT fk_report_access_log_user FOREIGN KEY (user_id) REFERENCES users (user_id),
    CONSTRAINT fk_report_access_log_org FOREIGN KEY (organization_id) REFERENCES organizations (organization_id),
    CONSTRAINT fk_report_access_log_target_org FOREIGN KEY (target_organization_id) REFERENCES organizations (organization_id)
)
