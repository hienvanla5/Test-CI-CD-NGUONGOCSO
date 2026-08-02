-- Sửa id từ CHAR(16) thành CHAR(36) để khớp với UUID
CREATE TABLE code_ranges (
    id CHAR(36) NOT NULL,   -- ← sửa thành CHAR(36)
    organization_id CHAR(36) NOT NULL,
    prefix VARCHAR(255) NOT NULL,
    from_number BIGINT,
    to_number BIGINT,
    total_limit BIGINT NOT NULL,
    used_count BIGINT NOT NULL DEFAULT 0,
    created_by CHAR(36),
    created_at DATETIME,
    updated_at DATETIME,
    PRIMARY KEY (id),
    UNIQUE KEY uk_code_ranges_prefix (prefix),
    CONSTRAINT fk_code_ranges_organization FOREIGN KEY (organization_id) REFERENCES organizations(organization_id)
);