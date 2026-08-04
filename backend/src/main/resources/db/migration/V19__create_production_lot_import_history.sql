CREATE TABLE production_lot_import_history
(
    id CHAR(36) PRIMARY KEY,

    organization_id CHAR(36) NOT NULL,

    imported_by CHAR(36) NOT NULL,

    file_name VARCHAR(255) NOT NULL,

    total_rows INT NOT NULL,

    success_count INT NOT NULL,

    failed_count INT NOT NULL,

    status VARCHAR(30) NOT NULL,

    imported_at DATETIME NOT NULL,

    CONSTRAINT fk_import_history_organization
        FOREIGN KEY (organization_id)
        REFERENCES organizations (organization_id),

    CONSTRAINT fk_import_history_user
        FOREIGN KEY (imported_by)
        REFERENCES users (user_id)
);