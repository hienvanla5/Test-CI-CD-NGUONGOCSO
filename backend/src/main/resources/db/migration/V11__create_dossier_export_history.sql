CREATE TABLE dossier_export_history (
    id CHAR(36) NOT NULL,
    shipment_id CHAR(36) NOT NULL,
    exporter_id CHAR(36) NOT NULL,
    organization_id CHAR(36) NOT NULL,
    exported_at DATETIME NOT NULL,
    file_name VARCHAR(255) NOT NULL,
    file_size BIGINT NULL,
    status VARCHAR(50) NOT NULL,
    ip_address VARCHAR(45) NULL,
    PRIMARY KEY (id),
    CONSTRAINT fk_dossier_export_shipment FOREIGN KEY (shipment_id) REFERENCES shipments(id),
    CONSTRAINT fk_dossier_export_exporter FOREIGN KEY (exporter_id) REFERENCES users(user_id),
    CONSTRAINT fk_dossier_export_org FOREIGN KEY (organization_id) REFERENCES organizations(organization_id)
);

CREATE INDEX idx_dossier_export_shipment ON dossier_export_history(shipment_id);
CREATE INDEX idx_dossier_export_exporter ON dossier_export_history(exporter_id);
