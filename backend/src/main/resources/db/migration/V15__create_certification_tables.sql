-- Bảng chứng nhận / tiêu chuẩn
CREATE TABLE IF NOT EXISTS certifications (
    id CHAR(36) NOT NULL PRIMARY KEY,

    organization_id CHAR(36) NOT NULL,
    standard_id CHAR(36) NOT NULL,

    code VARCHAR(100) NOT NULL UNIQUE,

    issued_by VARCHAR(255),
    issue_date DATE,
    expiry_date DATE NOT NULL,

    created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT NULL,

    CONSTRAINT fk_certification_org
        FOREIGN KEY (organization_id)
        REFERENCES organizations(organization_id),

    CONSTRAINT fk_certification_standard
        FOREIGN KEY (standard_id)
        REFERENCES standards(id)
);

CREATE INDEX idx_certification_org
ON certifications(organization_id);

CREATE INDEX idx_certification_standard
ON certifications(standard_id);

-- Bảng liên kết lô sản xuất – chứng nhận
CREATE TABLE IF NOT EXISTS production_lot_certifications (
                                                             id CHAR(36) NOT NULL PRIMARY KEY,
    production_lot_id CHAR(36) NOT NULL,
    certification_id CHAR(36) NOT NULL,
    attached_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    attached_by CHAR(36) NOT NULL,
    note TEXT,
    CONSTRAINT fk_plc_lot FOREIGN KEY (production_lot_id) REFERENCES production_lot(id),
    CONSTRAINT fk_plc_cert FOREIGN KEY (certification_id) REFERENCES certifications(id),
    CONSTRAINT fk_plc_user FOREIGN KEY (attached_by) REFERENCES users(user_id),
    UNIQUE KEY uk_plc_lot_cert (production_lot_id, certification_id)
    );

CREATE INDEX idx_cert_org ON certifications(organization_id);
CREATE INDEX idx_cert_expiry ON certifications(expiry_date);
CREATE INDEX idx_plc_lot ON production_lot_certifications(production_lot_id);
CREATE INDEX idx_plc_cert ON production_lot_certifications(certification_id);