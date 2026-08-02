CREATE TABLE role_permissions
(
    id CHAR(36) NOT NULL,

    role_id INT NOT NULL,

    permission_id INT NOT NULL,

    is_enabled BOOLEAN NOT NULL DEFAULT FALSE,

    created_at DATETIME NOT NULL,

    PRIMARY KEY (id),

    CONSTRAINT fk_role_permission_role
        FOREIGN KEY (role_id)
        REFERENCES roles (role_id),

    CONSTRAINT fk_role_permission_permission
        FOREIGN KEY (permission_id)
        REFERENCES permissions (permission_id),

    CONSTRAINT uk_role_permission
        UNIQUE (role_id, permission_id)
);

CREATE INDEX idx_role_permission_role
    ON role_permissions(role_id);

CREATE INDEX idx_role_permission_permission
    ON role_permissions(permission_id);