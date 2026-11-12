-- SIGMA foundation migration
-- Source: sigma_presensi_import.sql
-- Target schema: sigma_presensi
-- Run with a MySQL client connected to Laragon.
-- Do not commit production credentials or execute this file against production without backup.

SET NAMES utf8mb4 COLLATE utf8mb4_unicode_ci;
SET SESSION time_zone = '+00:00';
SET SESSION sql_mode = 'STRICT_TRANS_TABLES,NO_ZERO_IN_DATE,NO_ZERO_DATE,ERROR_FOR_DIVISION_BY_ZERO,NO_ENGINE_SUBSTITUTION';

CREATE DATABASE IF NOT EXISTS `sigma_presensi`
    CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
USE `sigma_presensi`;

CREATE TABLE IF NOT EXISTS `sigma_presensi`.`users` (
    id BIGINT UNSIGNED NOT NULL AUTO_INCREMENT PRIMARY KEY,
    code VARCHAR(50) NOT NULL,
    name VARCHAR(150) NOT NULL,
    email VARCHAR(254) NULL,
    password_hash VARCHAR(255) NULL,
    role ENUM('peserta','staff_presensi','super_admin') NOT NULL,
    status ENUM('invited','active','inactive') NOT NULL DEFAULT 'invited',
    created_at DATETIME(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6),
    updated_at DATETIME(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6) ON UPDATE CURRENT_TIMESTAMP(6),
    UNIQUE KEY uq_users_code (code),
    UNIQUE KEY uq_users_email (email),
    KEY idx_users_role_status (role, status),
    CONSTRAINT `chk_users_active_password` CHECK (status <> 'active' OR password_hash IS NOT NULL)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS `sigma_presensi`.`placements` (
    id BIGINT UNSIGNED NOT NULL AUTO_INCREMENT PRIMARY KEY,
    participant_user_id BIGINT UNSIGNED NOT NULL,
    staff_user_id BIGINT UNSIGNED NOT NULL,
    program_type ENUM('pkl','magang') NOT NULL,
    institution_name VARCHAR(200) NULL,
    start_date DATE NOT NULL,
    end_date DATE NOT NULL,
    status ENUM('invited','active','inactive','ended') NOT NULL DEFAULT 'invited',
    created_at DATETIME(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6),
    updated_at DATETIME(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6) ON UPDATE CURRENT_TIMESTAMP(6),
    KEY idx_placements_participant_status (participant_user_id, status),
    KEY idx_placements_staff (staff_user_id),
    CONSTRAINT `fk_placements_participant` FOREIGN KEY (participant_user_id) REFERENCES `sigma_presensi`.`users` (id),
    CONSTRAINT `fk_placements_staff` FOREIGN KEY (staff_user_id) REFERENCES `sigma_presensi`.`users` (id),
    CONSTRAINT `chk_placements_dates` CHECK (end_date >= start_date)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS `sigma_presensi`.`policy_versions` (
    id BIGINT UNSIGNED NOT NULL AUTO_INCREMENT PRIMARY KEY,
    policy_code VARCHAR(60) NOT NULL,
    version INT UNSIGNED NOT NULL,
    parameters JSON NOT NULL,
    valid_from DATETIME(6) NOT NULL,
    valid_to DATETIME(6) NULL,
    created_by BIGINT UNSIGNED NOT NULL,
    created_at DATETIME(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6),
    UNIQUE KEY uq_policy_code_version (policy_code, version),
    CONSTRAINT `fk_policy_creator` FOREIGN KEY (created_by) REFERENCES `sigma_presensi`.`users` (id),
    CONSTRAINT `chk_policy_version` CHECK (version > 0),
    CONSTRAINT `chk_policy_dates` CHECK (valid_to IS NULL OR valid_to > valid_from)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS `sigma_presensi`.`location_versions` (
    id BIGINT UNSIGNED NOT NULL AUTO_INCREMENT PRIMARY KEY,
    location_code VARCHAR(60) NOT NULL,
    version INT UNSIGNED NOT NULL,
    name VARCHAR(150) NOT NULL,
    latitude DECIMAL(10,7) NOT NULL,
    longitude DECIMAL(10,7) NOT NULL,
    radius_meters DECIMAL(10,2) NOT NULL,
    valid_from DATETIME(6) NOT NULL,
    valid_to DATETIME(6) NULL,
    created_by BIGINT UNSIGNED NOT NULL,
    created_at DATETIME(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6),
    UNIQUE KEY uq_location_code_version (location_code, version),
    CONSTRAINT `fk_location_creator` FOREIGN KEY (created_by) REFERENCES `sigma_presensi`.`users` (id),
    CONSTRAINT `chk_location_version` CHECK (version > 0),
    CONSTRAINT `chk_location_lat` CHECK (latitude BETWEEN -90 AND 90),
    CONSTRAINT `chk_location_lng` CHECK (longitude BETWEEN -180 AND 180),
    CONSTRAINT `chk_location_radius` CHECK (radius_meters > 0),
    CONSTRAINT `chk_location_dates` CHECK (valid_to IS NULL OR valid_to > valid_from)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS `sigma_presensi`.`work_sessions` (
    id BIGINT UNSIGNED NOT NULL AUTO_INCREMENT PRIMARY KEY,
    placement_id BIGINT UNSIGNED NOT NULL,
    policy_version_id BIGINT UNSIGNED NOT NULL,
    location_version_id BIGINT UNSIGNED NOT NULL,
    work_date DATE NOT NULL,
    start_at_utc DATETIME(6) NOT NULL,
    end_at_utc DATETIME(6) NOT NULL,
    timezone VARCHAR(64) NOT NULL,
    status ENUM('planned','open','closed','reconciled') NOT NULL DEFAULT 'planned',
    created_at DATETIME(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6),
    updated_at DATETIME(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6) ON UPDATE CURRENT_TIMESTAMP(6),
    KEY idx_work_sessions_placement_date (placement_id, work_date),
    CONSTRAINT `fk_work_placement` FOREIGN KEY (placement_id) REFERENCES `sigma_presensi`.`placements` (id),
    CONSTRAINT `fk_work_policy` FOREIGN KEY (policy_version_id) REFERENCES `sigma_presensi`.`policy_versions` (id),
    CONSTRAINT `fk_work_location` FOREIGN KEY (location_version_id) REFERENCES `sigma_presensi`.`location_versions` (id),
    CONSTRAINT `chk_work_times` CHECK (end_at_utc > start_at_utc)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS `sigma_presensi`.`face_templates` (
    id BIGINT UNSIGNED NOT NULL AUTO_INCREMENT PRIMARY KEY,
    user_id BIGINT UNSIGNED NOT NULL,
    model_version VARCHAR(100) NOT NULL,
    template_version INT UNSIGNED NOT NULL,
    encrypted_payload MEDIUMBLOB NULL,
    encryption_key_id VARCHAR(100) NULL,
    status ENUM('pending','active','rejected','superseded','deleted') NOT NULL DEFAULT 'pending',
    enrolled_at DATETIME(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6),
    activated_by BIGINT UNSIGNED NULL,
    activated_at DATETIME(6) NULL,
    deleted_at DATETIME(6) NULL,
    active_slot TINYINT GENERATED ALWAYS AS (CASE WHEN status = 'active' THEN 1 ELSE NULL END) STORED,
    UNIQUE KEY uq_face_user_version (user_id, template_version),
    UNIQUE KEY uq_face_one_active (user_id, active_slot),
    CONSTRAINT `fk_face_user` FOREIGN KEY (user_id) REFERENCES `sigma_presensi`.`users` (id),
    CONSTRAINT `fk_face_activator` FOREIGN KEY (activated_by) REFERENCES `sigma_presensi`.`users` (id),
    CONSTRAINT `chk_face_version` CHECK (template_version > 0),
    CONSTRAINT `chk_face_activation` CHECK (status <> 'active' OR (activated_by IS NOT NULL AND activated_at IS NOT NULL)),
    CONSTRAINT `chk_face_payload` CHECK ((status = 'deleted' AND encrypted_payload IS NULL AND deleted_at IS NOT NULL) OR (status <> 'deleted' AND encrypted_payload IS NOT NULL AND encryption_key_id IS NOT NULL AND deleted_at IS NULL))
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS `sigma_presensi`.`consent_records` (
    id BIGINT UNSIGNED NOT NULL AUTO_INCREMENT PRIMARY KEY,
    user_id BIGINT UNSIGNED NOT NULL,
    policy_version_id BIGINT UNSIGNED NOT NULL,
    mechanism VARCHAR(100) NOT NULL,
    status ENUM('acknowledged','granted','withdrawn') NOT NULL,
    recorded_at DATETIME(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6),
    KEY idx_consent_user_policy (user_id, policy_version_id, recorded_at),
    CONSTRAINT `fk_consent_user` FOREIGN KEY (user_id) REFERENCES `sigma_presensi`.`users` (id),
    CONSTRAINT `fk_consent_policy` FOREIGN KEY (policy_version_id) REFERENCES `sigma_presensi`.`policy_versions` (id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS `sigma_presensi`.`verification_challenges` (
    id BIGINT UNSIGNED NOT NULL AUTO_INCREMENT PRIMARY KEY,
    token_hash CHAR(64) CHARACTER SET ascii COLLATE ascii_bin NOT NULL,
    user_id BIGINT UNSIGNED NULL,
    work_session_id BIGINT UNSIGNED NULL,
    face_template_id BIGINT UNSIGNED NULL,
    action ENUM('enrollment','check_in','check_out') NOT NULL,
    status ENUM('issued','verified','failed','consumed','expired','revoked') NOT NULL DEFAULT 'issued',
    trusted_result JSON NULL,
    verified_at DATETIME(6) NULL,
    expires_at DATETIME(6) NOT NULL,
    consumed_at DATETIME(6) NULL,
    created_at DATETIME(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6),
    UNIQUE KEY uq_challenge_token (token_hash),
    KEY idx_challenge_expiry (expires_at),
    KEY idx_challenge_user_status (user_id, status),
    CONSTRAINT `fk_challenge_user` FOREIGN KEY (user_id) REFERENCES `sigma_presensi`.`users` (id),
    CONSTRAINT `fk_challenge_work` FOREIGN KEY (work_session_id) REFERENCES `sigma_presensi`.`work_sessions` (id),
    CONSTRAINT `fk_challenge_template` FOREIGN KEY (face_template_id) REFERENCES `sigma_presensi`.`face_templates` (id),
    CONSTRAINT `chk_challenge_expiry` CHECK (expires_at > created_at),
    CONSTRAINT `chk_challenge_consumed` CHECK ((status = 'consumed' AND consumed_at IS NOT NULL) OR (status <> 'consumed' AND consumed_at IS NULL)),
    CONSTRAINT `chk_challenge_success` CHECK (status NOT IN ('verified','consumed') OR (user_id IS NOT NULL AND trusted_result IS NOT NULL AND verified_at IS NOT NULL AND (action = 'enrollment' OR (work_session_id IS NOT NULL AND face_template_id IS NOT NULL))))
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS `sigma_presensi`.`attendance_records` (
    id BIGINT UNSIGNED NOT NULL AUTO_INCREMENT PRIMARY KEY,
    work_session_id BIGINT UNSIGNED NOT NULL,
    effective_check_in_at DATETIME(6) NULL,
    effective_check_out_at DATETIME(6) NULL,
    status ENUM('not_started','open','complete','incomplete') NOT NULL DEFAULT 'not_started',
    version INT UNSIGNED NOT NULL DEFAULT 1,
    created_at DATETIME(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6),
    updated_at DATETIME(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6) ON UPDATE CURRENT_TIMESTAMP(6),
    UNIQUE KEY uq_attendance_work_session (work_session_id),
    CONSTRAINT `fk_attendance_work` FOREIGN KEY (work_session_id) REFERENCES `sigma_presensi`.`work_sessions` (id),
    CONSTRAINT `chk_attendance_version` CHECK (version > 0),
    CONSTRAINT `chk_attendance_times` CHECK (effective_check_out_at IS NULL OR (effective_check_in_at IS NOT NULL AND effective_check_out_at >= effective_check_in_at)),
    CONSTRAINT `chk_attendance_status` CHECK ((status = 'not_started' AND effective_check_in_at IS NULL AND effective_check_out_at IS NULL) OR (status IN ('open','incomplete') AND effective_check_in_at IS NOT NULL AND effective_check_out_at IS NULL) OR (status = 'complete' AND effective_check_in_at IS NOT NULL AND effective_check_out_at IS NOT NULL))
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS `sigma_presensi`.`attendance_events` (
    id BIGINT UNSIGNED NOT NULL AUTO_INCREMENT PRIMARY KEY,
    attendance_record_id BIGINT UNSIGNED NOT NULL,
    verification_id BIGINT UNSIGNED NOT NULL,
    policy_version_id BIGINT UNSIGNED NOT NULL,
    type ENUM('check_in','check_out') NOT NULL,
    source ENUM('authenticated','quick_attendance') NOT NULL,
    occurred_at_server DATETIME(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6),
    created_at DATETIME(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6),
    UNIQUE KEY uq_event_record_type (attendance_record_id, type),
    UNIQUE KEY uq_event_verification (verification_id),
    CONSTRAINT `fk_event_record` FOREIGN KEY (attendance_record_id) REFERENCES `sigma_presensi`.`attendance_records` (id),
    CONSTRAINT `fk_event_verification` FOREIGN KEY (verification_id) REFERENCES `sigma_presensi`.`verification_challenges` (id),
    CONSTRAINT `fk_event_policy` FOREIGN KEY (policy_version_id) REFERENCES `sigma_presensi`.`policy_versions` (id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS `sigma_presensi`.`idempotency_records` (
    id BIGINT UNSIGNED NOT NULL AUTO_INCREMENT PRIMARY KEY,
    challenge_id BIGINT UNSIGNED NULL,
    authority_scope VARCHAR(128) CHARACTER SET ascii COLLATE ascii_bin NOT NULL,
    idempotency_key VARCHAR(128) CHARACTER SET ascii COLLATE ascii_bin NOT NULL,
    request_fingerprint CHAR(64) CHARACTER SET ascii COLLATE ascii_bin NOT NULL,
    operation_status ENUM('processing','succeeded','failed') NOT NULL DEFAULT 'processing',
    result_reference VARCHAR(255) NULL,
    response_status SMALLINT UNSIGNED NULL,
    expires_at DATETIME(6) NOT NULL,
    created_at DATETIME(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6),
    updated_at DATETIME(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6) ON UPDATE CURRENT_TIMESTAMP(6),
    UNIQUE KEY uq_idempotency_scope_key (authority_scope, idempotency_key),
    KEY idx_idempotency_expiry (expires_at),
    CONSTRAINT `fk_idempotency_challenge` FOREIGN KEY (challenge_id) REFERENCES `sigma_presensi`.`verification_challenges` (id),
    CONSTRAINT `chk_idempotency_expiry` CHECK (expires_at > created_at),
    CONSTRAINT `chk_idempotency_response` CHECK (response_status IS NULL OR response_status BETWEEN 100 AND 599)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS `sigma_presensi`.`leave_requests` (
    id BIGINT UNSIGNED NOT NULL AUTO_INCREMENT PRIMARY KEY,
    placement_id BIGINT UNSIGNED NOT NULL,
    requested_by BIGINT UNSIGNED NOT NULL,
    start_date DATE NOT NULL,
    end_date DATE NOT NULL,
    type ENUM('izin','sakit','cuti') NOT NULL,
    reason TEXT NOT NULL,
    status ENUM('pending','approved','rejected','cancelled') NOT NULL DEFAULT 'pending',
    version INT UNSIGNED NOT NULL DEFAULT 1,
    created_at DATETIME(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6),
    updated_at DATETIME(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6) ON UPDATE CURRENT_TIMESTAMP(6),
    KEY idx_leave_placement_status_date (placement_id, status, start_date),
    CONSTRAINT `fk_leave_placement` FOREIGN KEY (placement_id) REFERENCES `sigma_presensi`.`placements` (id),
    CONSTRAINT `fk_leave_requester` FOREIGN KEY (requested_by) REFERENCES `sigma_presensi`.`users` (id),
    CONSTRAINT `chk_leave_dates` CHECK (end_date >= start_date),
    CONSTRAINT `chk_leave_version` CHECK (version > 0)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS `sigma_presensi`.`leave_decisions` (
    id BIGINT UNSIGNED NOT NULL AUTO_INCREMENT PRIMARY KEY,
    leave_request_id BIGINT UNSIGNED NOT NULL,
    decided_by BIGINT UNSIGNED NOT NULL,
    request_version INT UNSIGNED NOT NULL,
    decision ENUM('approved','rejected') NOT NULL,
    reason TEXT NOT NULL,
    decided_at DATETIME(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6),
    UNIQUE KEY uq_leave_decision_version (leave_request_id, request_version),
    CONSTRAINT `fk_leave_decision_request` FOREIGN KEY (leave_request_id) REFERENCES `sigma_presensi`.`leave_requests` (id),
    CONSTRAINT `fk_leave_decision_staff` FOREIGN KEY (decided_by) REFERENCES `sigma_presensi`.`users` (id),
    CONSTRAINT `chk_leave_decision_version` CHECK (request_version > 0)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS `sigma_presensi`.`correction_requests` (
    id BIGINT UNSIGNED NOT NULL AUTO_INCREMENT PRIMARY KEY,
    work_session_id BIGINT UNSIGNED NOT NULL,
    requested_by BIGINT UNSIGNED NOT NULL,
    reason TEXT NOT NULL,
    status ENUM('pending','approved','rejected','cancelled') NOT NULL DEFAULT 'pending',
    version INT UNSIGNED NOT NULL DEFAULT 1,
    created_at DATETIME(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6),
    updated_at DATETIME(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6) ON UPDATE CURRENT_TIMESTAMP(6),
    KEY idx_correction_work_status (work_session_id, status),
    CONSTRAINT `fk_correction_work` FOREIGN KEY (work_session_id) REFERENCES `sigma_presensi`.`work_sessions` (id),
    CONSTRAINT `fk_correction_requester` FOREIGN KEY (requested_by) REFERENCES `sigma_presensi`.`users` (id),
    CONSTRAINT `chk_correction_version` CHECK (version > 0)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS `sigma_presensi`.`correction_revisions` (
    id BIGINT UNSIGNED NOT NULL AUTO_INCREMENT PRIMARY KEY,
    correction_request_id BIGINT UNSIGNED NOT NULL,
    decided_by BIGINT UNSIGNED NOT NULL,
    request_version INT UNSIGNED NOT NULL,
    decision ENUM('approved','rejected') NOT NULL,
    before_values JSON NULL,
    after_values JSON NULL,
    source ENUM('manual_correction') NOT NULL DEFAULT 'manual_correction',
    reason TEXT NOT NULL,
    decided_at DATETIME(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6),
    UNIQUE KEY uq_correction_revision_version (correction_request_id, request_version),
    CONSTRAINT `fk_revision_request` FOREIGN KEY (correction_request_id) REFERENCES `sigma_presensi`.`correction_requests` (id),
    CONSTRAINT `fk_revision_staff` FOREIGN KEY (decided_by) REFERENCES `sigma_presensi`.`users` (id),
    CONSTRAINT `chk_revision_version` CHECK (request_version > 0),
    CONSTRAINT `chk_revision_after` CHECK (decision <> 'approved' OR after_values IS NOT NULL)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS `sigma_presensi`.`attachments` (
    id BIGINT UNSIGNED NOT NULL AUTO_INCREMENT PRIMARY KEY,
    owner_user_id BIGINT UNSIGNED NOT NULL,
    leave_request_id BIGINT UNSIGNED NULL,
    correction_request_id BIGINT UNSIGNED NULL,
    mime_type VARCHAR(100) NOT NULL,
    size_bytes BIGINT UNSIGNED NOT NULL,
    private_storage_key VARCHAR(255) CHARACTER SET ascii COLLATE ascii_bin NOT NULL,
    retention_until DATETIME(6) NOT NULL,
    created_at DATETIME(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6),
    UNIQUE KEY uq_attachment_storage (private_storage_key),
    KEY idx_attachment_retention (retention_until),
    CONSTRAINT `fk_attachment_owner` FOREIGN KEY (owner_user_id) REFERENCES `sigma_presensi`.`users` (id),
    CONSTRAINT `fk_attachment_leave` FOREIGN KEY (leave_request_id) REFERENCES `sigma_presensi`.`leave_requests` (id),
    CONSTRAINT `fk_attachment_correction` FOREIGN KEY (correction_request_id) REFERENCES `sigma_presensi`.`correction_requests` (id),
    CONSTRAINT `chk_attachment_one_parent` CHECK ((leave_request_id IS NOT NULL AND correction_request_id IS NULL) OR (leave_request_id IS NULL AND correction_request_id IS NOT NULL)),
    CONSTRAINT `chk_attachment_size` CHECK (size_bytes > 0)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS `sigma_presensi`.`sessions` (
    id_hash CHAR(64) CHARACTER SET ascii COLLATE ascii_bin NOT NULL PRIMARY KEY,
    user_id BIGINT UNSIGNED NOT NULL,
    expires_at DATETIME(6) NOT NULL,
    revoked_at DATETIME(6) NULL,
    created_at DATETIME(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6),
    KEY idx_sessions_user (user_id),
    KEY idx_sessions_expiry (expires_at),
    CONSTRAINT `fk_session_user` FOREIGN KEY (user_id) REFERENCES `sigma_presensi`.`users` (id),
    CONSTRAINT `chk_session_expiry` CHECK (expires_at > created_at)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS `sigma_presensi`.`audit_events` (
    id BIGINT UNSIGNED NOT NULL AUTO_INCREMENT PRIMARY KEY,
    actor_user_id BIGINT UNSIGNED NULL,
    authority_scope VARCHAR(128) CHARACTER SET ascii COLLATE ascii_bin NOT NULL,
    action VARCHAR(100) NOT NULL,
    entity_type VARCHAR(80) NOT NULL,
    entity_id VARCHAR(100) NULL,
    request_id VARCHAR(100) CHARACTER SET ascii COLLATE ascii_bin NOT NULL,
    safe_changes JSON NULL,
    occurred_at DATETIME(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6),
    KEY idx_audit_entity_time (entity_type, entity_id, occurred_at),
    KEY idx_audit_actor_time (actor_user_id, occurred_at),
    KEY idx_audit_request (request_id),
    CONSTRAINT `fk_audit_actor` FOREIGN KEY (actor_user_id) REFERENCES `sigma_presensi`.`users` (id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS `sigma_presensi`.`account_tokens` (
    id BIGINT UNSIGNED NOT NULL AUTO_INCREMENT PRIMARY KEY,
    user_id BIGINT UNSIGNED NOT NULL,
    issued_by BIGINT UNSIGNED NOT NULL,
    token_hash CHAR(64) CHARACTER SET ascii COLLATE ascii_bin NOT NULL,
    purpose ENUM('activation','password_reset') NOT NULL,
    expires_at DATETIME(6) NOT NULL,
    consumed_at DATETIME(6) NULL,
    revoked_at DATETIME(6) NULL,
    created_at DATETIME(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6),
    UNIQUE KEY uq_account_token_hash (token_hash),
    KEY idx_account_token_user_purpose (user_id, purpose),
    KEY idx_account_token_expiry (expires_at),
    CONSTRAINT `fk_account_token_user` FOREIGN KEY (user_id) REFERENCES `sigma_presensi`.`users` (id),
    CONSTRAINT `fk_account_token_issuer` FOREIGN KEY (issued_by) REFERENCES `sigma_presensi`.`users` (id),
    CONSTRAINT `chk_account_token_expiry` CHECK (expires_at > created_at)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
