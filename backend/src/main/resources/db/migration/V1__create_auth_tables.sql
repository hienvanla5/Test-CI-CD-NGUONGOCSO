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
