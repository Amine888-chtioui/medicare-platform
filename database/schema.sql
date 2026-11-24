-- =============================================================================
-- MediCare Platform — Schéma de base de données MySQL 8.0+
-- Compatible : MySQL 8.0+, MariaDB 10.5+, TiDB Cloud Serverless
-- Encodage : UTF-8 (utf8mb4_unicode_ci)
-- =============================================================================
--
-- NOTE SUR LA CONTRAINTE CHECK ET TIDB CLOUD SERVERLESS :
-- La contrainte CHECK sur la colonne `status` ci-dessous est syntaxiquement
-- acceptée par TiDB (v7.2+), MySQL 8.0.16+ et MariaDB 10.5+.
-- Cependant, sur TiDB Cloud Serverless, son application (enforcement) n'est
-- PAS garantie par défaut :
--   - La variable système tidb_enable_check_constraint est désactivée (OFF)
--     dans les versions antérieures à TiDB v7.2.
--   - Sur TiDB Cloud Serverless, SET GLOBAL tidb_enable_check_constraint = ON
--     nécessite des privilèges SUPER qui ne sont PAS accordés aux utilisateurs
--     de la tier gratuite.
--
-- La validation des valeurs de statut est donc assurée au niveau applicatif
-- par l'enum Java AppointmentStatus et la validation Bean Validation côté
-- Spring Boot, ce qui constitue la couche de protection primaire.
-- La contrainte CHECK reste présente dans le schéma pour MySQL/MariaDB locaux
-- et pour documenter l'intention métier.
-- =============================================================================

CREATE DATABASE IF NOT EXISTS medicare_db
  DEFAULT CHARACTER SET utf8mb4
  DEFAULT COLLATE utf8mb4_unicode_ci;

USE medicare_db;

-- -----------------------------------------------------------------------------
-- 1. Table : admins
-- Stocke les comptes d'administration avec mot de passe haché BCrypt.
-- -----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS admins (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    username VARCHAR(50) NOT NULL UNIQUE,
    email VARCHAR(100) UNIQUE,
    password VARCHAR(255) NOT NULL,
    created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- -----------------------------------------------------------------------------
-- 2. Table : patients
-- Répertoire des patientes identifiées par leur numéro de téléphone unique.
-- -----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS patients (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    full_name VARCHAR(100) NOT NULL,
    phone_number VARCHAR(20) NOT NULL UNIQUE,
    email VARCHAR(150) NULL,
    notes TEXT NULL,
    created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    INDEX idx_patient_phone (phone_number),
    INDEX idx_patient_created (created_at)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- -----------------------------------------------------------------------------
-- 3. Table : appointment_requests
-- Demandes de rendez-vous avec statut, créneau horaire et liaison patiente.
-- -----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS appointment_requests (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    full_name VARCHAR(100) NOT NULL,
    phone_number VARCHAR(20) NOT NULL,
    description VARCHAR(500) NULL,
    status VARCHAR(20) NOT NULL DEFAULT 'EN_ATTENTE'
            CHECK (status IN ('EN_ATTENTE', 'CONFIRMEE', 'REFUSEE')),
    appointment_date DATE NULL,
    start_time VARCHAR(10) NULL,
    end_time VARCHAR(10) NULL,
    service_type VARCHAR(100) NULL,
    patient_id BIGINT NULL,
    created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    INDEX idx_appointment_status (status),
    INDEX idx_appointment_date (appointment_date),
    INDEX idx_appointment_created (created_at),
    CONSTRAINT fk_appointment_patient
        FOREIGN KEY (patient_id) REFERENCES patients(id)
        ON DELETE SET NULL
        ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- -----------------------------------------------------------------------------
-- 4. Table : admin_notifications
-- Notifications générées pour chaque nouvelle demande de rendez-vous.
-- -----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS admin_notifications (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    appointment_request_id BIGINT NOT NULL UNIQUE,
    dismissed BOOLEAN NOT NULL DEFAULT FALSE,
    created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    dismissed_at DATETIME NULL,
    INDEX idx_admin_notif_dismissed (dismissed),
    INDEX idx_admin_notif_created_at (created_at),
    CONSTRAINT fk_notif_appointment
        FOREIGN KEY (appointment_request_id) REFERENCES appointment_requests(id)
        ON DELETE CASCADE
        ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
