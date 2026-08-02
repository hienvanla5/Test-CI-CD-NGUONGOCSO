CREATE TABLE organization_role_permissions (
    id CHAR(36) NOT NULL,

    organization_id CHAR(36) NOT NULL,

    role_id INT NOT NULL,

    permission_id INT NOT NULL,

    is_enabled BOOLEAN NOT NULL DEFAULT FALSE,

    updated_by CHAR(36),

    updated_at DATETIME NOT NULL,

    PRIMARY KEY (id),

    CONSTRAINT fk_orp_organization
        FOREIGN KEY (organization_id)
        REFERENCES organizations (organization_id),

    CONSTRAINT fk_orp_role
        FOREIGN KEY (role_id)
        REFERENCES roles (role_id),

    CONSTRAINT fk_orp_permission
        FOREIGN KEY (permission_id)
        REFERENCES permissions (permission_id),

    CONSTRAINT fk_orp_updated_by
        FOREIGN KEY (updated_by)
        REFERENCES users (user_id),

    CONSTRAINT uk_org_role_permission
        UNIQUE (
            organization_id,
            role_id,
            permission_id
        )
);

CREATE INDEX idx_orp_org
    ON organization_role_permissions (organization_id);

CREATE INDEX idx_orp_role
    ON organization_role_permissions (role_id);

CREATE INDEX idx_orp_permission
    ON organization_role_permissions (permission_id);

CREATE INDEX idx_orp_updated_by
    ON organization_role_permissions (updated_by);