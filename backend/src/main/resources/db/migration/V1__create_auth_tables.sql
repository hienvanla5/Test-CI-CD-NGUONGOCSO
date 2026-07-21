CREATE TABLE roles (
                       role_id INT AUTO_INCREMENT PRIMARY KEY,
                       code VARCHAR(100) NOT NULL UNIQUE,
                       name VARCHAR(100) NOT NULL UNIQUE
);

CREATE TABLE permissions (
                             permission_id INT AUTO_INCREMENT PRIMARY KEY,
                             resource VARCHAR(100) NOT NULL,
                             action VARCHAR(100) NOT NULL,
                             description VARCHAR(255)
);

CREATE TABLE organizations (
                               organization_id CHAR(36) NOT NULL,
                               name VARCHAR(255) NOT NULL,
                               code VARCHAR(100) NOT NULL UNIQUE,
                               type VARCHAR(50) NOT NULL,
                               status VARCHAR(50) NOT NULL,
                               address VARCHAR(255),
                               phone VARCHAR(30),
                               email VARCHAR(255),
                               created_at DATETIME NOT NULL,
                               updated_at DATETIME NOT NULL,

                               CONSTRAINT pk_organizations PRIMARY KEY (organization_id)
);

CREATE TABLE users (
                       user_id CHAR(36) NOT NULL,
                       user_name VARCHAR(100) NOT NULL UNIQUE,
                       password_hash VARCHAR(255) NOT NULL,
                       full_name VARCHAR(255) NOT NULL,
                       phone VARCHAR(30),
                       email VARCHAR(255),
                       status VARCHAR(50) NOT NULL,
                       created_at DATETIME NOT NULL,
                       updated_at DATETIME NOT NULL,

                       CONSTRAINT pk_users PRIMARY KEY (user_id)
);

CREATE TABLE organization_users (
                                    id CHAR(36) NOT NULL,

                                    organization_id CHAR(36) NOT NULL,
                                    user_id CHAR(36) NOT NULL,
                                    role_id INT NOT NULL,

                                    custom_permissions TEXT,

                                    joined_at DATETIME NOT NULL,

                                    status VARCHAR(50) NOT NULL,

                                    CONSTRAINT pk_organization_users
                                        PRIMARY KEY (id),

                                    CONSTRAINT fk_org_user_org
                                        FOREIGN KEY (organization_id)
                                            REFERENCES organizations (organization_id),

                                    CONSTRAINT fk_org_user_user
                                        FOREIGN KEY (user_id)
                                            REFERENCES users (user_id),

                                    CONSTRAINT fk_org_user_role
                                        FOREIGN KEY (role_id)
                                            REFERENCES roles (role_id),

                                    CONSTRAINT uk_org_user
                                        UNIQUE (organization_id, user_id)
);

CREATE TABLE product_categories (
    id CHAR(36) NOT NULL,

    name VARCHAR(255) NOT NULL,

    category_group VARCHAR(100),

    description TEXT,

    is_active BOOLEAN NOT NULL DEFAULT TRUE,

    CONSTRAINT pk_product_categories
        PRIMARY KEY (id)
);

CREATE TABLE farm_areas (
    id CHAR(36) NOT NULL,

    organization_id CHAR(36) NOT NULL,

    crop_type CHAR(36) NOT NULL,

    name VARCHAR(255) NOT NULL,

    location POINT NOT NULL,

    area DECIMAL(10,2) NOT NULL,

    created_at DATETIME NOT NULL,

    updated_at DATETIME NOT NULL,

    CONSTRAINT pk_farm_areas
        PRIMARY KEY (id),

    CONSTRAINT fk_farm_area_organization
        FOREIGN KEY (organization_id)
        REFERENCES organizations (organization_id),

    CONSTRAINT fk_farm_area_product_category
        FOREIGN KEY (crop_type)
        REFERENCES product_categories (id)
);

CREATE INDEX idx_farm_area_organization
ON farm_areas (organization_id);

CREATE INDEX idx_farm_area_crop_type
ON farm_areas (crop_type);

CREATE SPATIAL INDEX idx_farm_area_location
ON farm_areas (location);


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


CREATE TABLE farm_logs (
    id CHAR(36) PRIMARY KEY,

    production_lot_id CHAR(36) NOT NULL,

    activity_type ENUM(
        'PLANTING',
        'WATERING',
        'FERTILIZING',
        'PESTICIDE',
        'WEEDING',
        'HARVESTING',
        'OTHER'
    ) NOT NULL,

    material VARCHAR(255),

    quantity DOUBLE,

    unit VARCHAR(50),

    executed_date DATE NOT NULL,

    notes TEXT,

    created_by CHAR(36) NOT NULL,

    created_at DATETIME NOT NULL,

    CONSTRAINT fk_farm_logs_production_lot
        FOREIGN KEY (production_lot_id)
        REFERENCES production_lot(id),

    CONSTRAINT fk_farm_logs_created_by
        FOREIGN KEY (created_by)
        REFERENCES users(user_id)
);

CREATE INDEX idx_farm_logs_production_lot
ON farm_logs(production_lot_id);

CREATE INDEX idx_farm_logs_created_by
ON farm_logs(created_by);

CREATE INDEX idx_farm_logs_executed_date
ON farm_logs(executed_date);

CREATE TABLE farm_log_attachments (
                                      id CHAR(36) PRIMARY KEY,
                                      farm_log_id CHAR(36) NOT NULL,
                                      file_name VARCHAR(255) NOT NULL,
                                      file_size BIGINT NOT NULL,
                                      file_type VARCHAR(100) NOT NULL,
                                      file_path VARCHAR(500) NOT NULL,
                                      description TEXT,
                                      uploaded_by CHAR(36) NOT NULL,
                                      uploaded_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                                      FOREIGN KEY (farm_log_id) REFERENCES farm_logs(id),
                                      FOREIGN KEY (uploaded_by) REFERENCES users(user_id)
);