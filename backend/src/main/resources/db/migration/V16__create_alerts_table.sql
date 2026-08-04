CREATE TABLE IF NOT EXISTS alerts (
    id CHAR(36) NOT NULL,
    message TEXT NOT NULL,
    type VARCHAR(50) NOT NULL,
    organization_id CHAR(36) NOT NULL,
    is_read BOOLEAN DEFAULT FALSE,
    details TEXT,
    created_at DATETIME NOT NULL,
    PRIMARY KEY (id),
    CONSTRAINT fk_alert_org FOREIGN KEY (organization_id) REFERENCES organizations(organization_id)
);
