CREATE DATABASE IF NOT EXISTS nguon_goc_so
CHARACTER SET utf8mb4
COLLATE utf8mb4_unicode_ci;

USE nguon_goc_so;

CREATE TABLE Organization (
    organizationID INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    type VARCHAR(50) NOT NULL,
    status VARCHAR(20) NOT NULL
);

CREATE TABLE Role (
    roleID INT AUTO_INCREMENT PRIMARY KEY,
    role VARCHAR(50) NOT NULL UNIQUE
);

CREATE TABLE Users (
    userID INT AUTO_INCREMENT PRIMARY KEY,
    userName VARCHAR(50) NOT NULL UNIQUE,
    passwordHash VARCHAR(255) NOT NULL,
    name VARCHAR(100) NOT NULL,
    status VARCHAR(20) NOT NULL,
    organizationID INT,
    roleID INT NOT NULL,
    FOREIGN KEY (organizationID) REFERENCES Organization(organizationID),
    FOREIGN KEY (roleID) REFERENCES Role(roleID)
);



