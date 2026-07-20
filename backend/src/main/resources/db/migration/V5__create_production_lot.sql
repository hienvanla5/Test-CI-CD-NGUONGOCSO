CREATE TABLE production_lot
(
    id                  CHAR(36)     NOT NULL,
    organization_id     CHAR(36)     NOT NULL,
    farm_area_id        CHAR(36)     NULL,
    product_category_id CHAR(36)     NOT NULL,
    name                VARCHAR(255) NOT NULL,
    expected_quantity   DOUBLE       NOT NULL,
    actual_quantity     DOUBLE       NULL,
    planting_date       date         NULL,
    harvest_date        date         NULL,
    status              VARCHAR(255) NOT NULL,
    approval_notes      VARCHAR(255) NULL,
    created_by          CHAR(36)     NULL,
    approved_by         CHAR(36)     NULL,
    created_at          datetime     NULL,
    updated_at          datetime     NULL,
    CONSTRAINT pk_production_lot PRIMARY KEY (id)
);

ALTER TABLE production_lot
    ADD CONSTRAINT FK_PRODUCTION_LOT_ON_APPROVED_BY FOREIGN KEY (approved_by) REFERENCES users (user_id);

ALTER TABLE production_lot
    ADD CONSTRAINT FK_PRODUCTION_LOT_ON_CREATED_BY FOREIGN KEY (created_by) REFERENCES users (user_id);

ALTER TABLE production_lot
    ADD CONSTRAINT FK_PRODUCTION_LOT_ON_FARM_AREA FOREIGN KEY (farm_area_id) REFERENCES farm_areas (id);

ALTER TABLE production_lot
    ADD CONSTRAINT FK_PRODUCTION_LOT_ON_ORGANIZATION FOREIGN KEY (organization_id) REFERENCES organizations (organization_id);

ALTER TABLE production_lot
    ADD CONSTRAINT FK_PRODUCTION_LOT_ON_PRODUCT_CATEGORY FOREIGN KEY (product_category_id) REFERENCES product_categories (id);
