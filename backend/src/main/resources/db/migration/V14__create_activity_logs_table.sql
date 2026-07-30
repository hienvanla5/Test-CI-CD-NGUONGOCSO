CREATE TABLE activity_logs (
                               id CHAR(36) NOT NULL,
                               organization_id CHAR(36) NOT NULL,
                               user_id CHAR(36) NOT NULL,
                               username VARCHAR(100) NOT NULL,
                               full_name VARCHAR(255) NOT NULL,
                               action VARCHAR(100) NOT NULL,
                               description TEXT NOT NULL,
                               entity_type VARCHAR(50) NULL,
                               entity_id VARCHAR(36) NULL,
                               ip_address VARCHAR(45) NULL,
                               created_at DATETIME NOT NULL,

                               CONSTRAINT pk_activity_logs PRIMARY KEY (id),
                               CONSTRAINT fk_activity_logs_org FOREIGN KEY (organization_id) REFERENCES organizations(organization_id),
                               CONSTRAINT fk_activity_logs_user FOREIGN KEY (user_id) REFERENCES users(user_id)
);

CREATE INDEX idx_activity_logs_org ON activity_logs(organization_id);
CREATE INDEX idx_activity_logs_created_at ON activity_logs(created_at);
