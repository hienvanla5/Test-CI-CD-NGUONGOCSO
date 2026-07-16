CREATE TABLE product_category
(
    id            BINARY(16)   NOT NULL,
    name          VARCHAR(255) NOT NULL,
    product_group VARCHAR(255) NULL,
    `description` VARCHAR(255) NULL,
    is_active     BIT(1)       NULL,
    CONSTRAINT pk_product_category PRIMARY KEY (id)
);

CREATE TABLE farm_area
(
    id              BINARY(16)   NOT NULL,
    organization_id CHAR(36)     NOT NULL, -- must be CHAR(36) because organizations.organization_id is CHAR(36)
    name            VARCHAR(255) NOT NULL,
    latitude        DOUBLE       NULL,
    longitude       DOUBLE       NULL,
    area            FLOAT        NOT NULL,
    crop_type_id    BINARY(16)   NULL,
    created_at      datetime     NULL,
    updated_at      datetime     NULL,
    CONSTRAINT pk_farm_area PRIMARY KEY (id)
);

CREATE TABLE production_lot
(
    id                  BINARY(16)   NOT NULL,
    organization_id     CHAR(36)     NOT NULL, -- must be CHAR(36) because organizations.organization_id is CHAR(36)
    farm_area_id        BINARY(16)   NULL,
    product_category_id BINARY(16)   NOT NULL,
    name                VARCHAR(255) NOT NULL,
    expected_quantity   DOUBLE       NOT NULL,
    actual_quantity     DOUBLE       NULL,
    planting_date       date         NULL,
    harvest_date        date         NULL,
    status              VARCHAR(255) NOT NULL,
    approval_notes      VARCHAR(255) NULL,
    created_by          CHAR(36)     NULL, -- must be CHAR(36) because users.user_id is CHAR(36)
    approved_by         CHAR(36)     NULL, -- must be CHAR(36) because users.user_id is CHAR(36)
    created_at          datetime     NULL,
    updated_at          datetime     NULL,
    CONSTRAINT pk_production_lot PRIMARY KEY (id)
);

ALTER TABLE farm_area
    ADD CONSTRAINT FK_FARM_AREA_ON_CROP_TYPE FOREIGN KEY (crop_type_id) REFERENCES product_category (id);

ALTER TABLE farm_area
    ADD CONSTRAINT FK_FARM_AREA_ON_ORGANIZATION FOREIGN KEY (organization_id) REFERENCES organizations (organization_id);

ALTER TABLE production_lot
    ADD CONSTRAINT FK_PRODUCTION_LOT_ON_APPROVED_BY FOREIGN KEY (approved_by) REFERENCES users (user_id);

ALTER TABLE production_lot
    ADD CONSTRAINT FK_PRODUCTION_LOT_ON_CREATED_BY FOREIGN KEY (created_by) REFERENCES users (user_id);

ALTER TABLE production_lot
    ADD CONSTRAINT FK_PRODUCTION_LOT_ON_FARM_AREA FOREIGN KEY (farm_area_id) REFERENCES farm_area (id);

ALTER TABLE production_lot
    ADD CONSTRAINT FK_PRODUCTION_LOT_ON_ORGANIZATION FOREIGN KEY (organization_id) REFERENCES organizations (organization_id);

ALTER TABLE production_lot
    ADD CONSTRAINT FK_PRODUCTION_LOT_ON_PRODUCT_CATEGORY FOREIGN KEY (product_category_id) REFERENCES product_category (id);
