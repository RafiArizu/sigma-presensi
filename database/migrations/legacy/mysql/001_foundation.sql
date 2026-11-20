SET @OLD_UNIQUE_CHECKS=@@UNIQUE_CHECKS, UNIQUE_CHECKS=0;
SET @OLD_FOREIGN_KEY_CHECKS=@@FOREIGN_KEY_CHECKS, FOREIGN_KEY_CHECKS=0;
SET @OLD_SQL_MODE=@@SQL_MODE, SQL_MODE='ONLY_FULL_GROUP_BY,STRICT_TRANS_TABLES,NO_ZERO_IN_DATE,NO_ZERO_DATE,ERROR_FOR_DIVISION_BY_ZERO,NO_ENGINE_SUBSTITUTION';

CREATE SCHEMA IF NOT EXISTS `sigma_presensi` DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci ;
USE `sigma_presensi` ;

CREATE TABLE IF NOT EXISTS `sigma_presensi`.`users` (
  `id` BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
  `code` VARCHAR(50) NOT NULL,
  `name` VARCHAR(150) NOT NULL,
  `email` VARCHAR(254) NULL DEFAULT NULL,
  `password_hash` VARCHAR(255) NULL DEFAULT NULL,
  `role` ENUM('peserta', 'staff_presensi', 'super_admin') NOT NULL,
  `status` ENUM('invited', 'active', 'inactive') NOT NULL DEFAULT 'invited',
  `created_at` DATETIME(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6),
  `updated_at` DATETIME(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6) ON UPDATE CURRENT_TIMESTAMP(6),
  PRIMARY KEY (`id`),
  UNIQUE INDEX `uq_users_code` (`code` ASC) VISIBLE,
  UNIQUE INDEX `uq_users_email` (`email` ASC) VISIBLE,
  INDEX `idx_users_role_status` (`role` ASC, `status` ASC) VISIBLE)
ENGINE = InnoDB
DEFAULT CHARACTER SET = utf8mb4
COLLATE = utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS `sigma_presensi`.`placements` (
  `id` BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
  `participant_user_id` BIGINT UNSIGNED NOT NULL,
  `staff_user_id` BIGINT UNSIGNED NOT NULL,
  `program_type` ENUM('pkl', 'magang') NOT NULL,
  `institution_name` VARCHAR(200) NULL DEFAULT NULL,
  `start_date` DATE NOT NULL,
  `end_date` DATE NOT NULL,
  `status` ENUM('invited', 'active', 'inactive', 'ended') NOT NULL DEFAULT 'invited',
  `created_at` DATETIME(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6),
  `updated_at` DATETIME(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6) ON UPDATE CURRENT_TIMESTAMP(6),
  PRIMARY KEY (`id`),
  INDEX `idx_placements_participant_status` (`participant_user_id` ASC, `status` ASC) VISIBLE,
  INDEX `idx_placements_staff` (`staff_user_id` ASC) VISIBLE,
  CONSTRAINT `fk_placements_participant`
    FOREIGN KEY (`participant_user_id`)
    REFERENCES `sigma_presensi`.`users` (`id`),
  CONSTRAINT `fk_placements_staff`
    FOREIGN KEY (`staff_user_id`)
    REFERENCES `sigma_presensi`.`users` (`id`))
ENGINE = InnoDB
DEFAULT CHARACTER SET = utf8mb4
COLLATE = utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS `sigma_presensi`.`location` (
  `id` BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
  `location_code` VARCHAR(60) NOT NULL,
  `version` INT UNSIGNED NOT NULL,
  `name` VARCHAR(150) NOT NULL,
  `latitude` DECIMAL(10,7) NOT NULL,
  `longitude` DECIMAL(10,7) NOT NULL,
  `radius_meters` DECIMAL(10,2) NOT NULL,
  `valid_from` DATETIME(6) NOT NULL,
  `valid_to` DATETIME(6) NULL DEFAULT NULL,
  `created_by` BIGINT UNSIGNED NOT NULL,
  `created_at` DATETIME(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6),
  PRIMARY KEY (`id`),
  UNIQUE INDEX `uq_location_code_version` (`location_code` ASC, `version` ASC) VISIBLE,
  INDEX `fk_location_creator` (`created_by` ASC) VISIBLE,
  CONSTRAINT `fk_location_creator`
    FOREIGN KEY (`created_by`)
    REFERENCES `sigma_presensi`.`users` (`id`))
ENGINE = InnoDB
DEFAULT CHARACTER SET = utf8mb4
COLLATE = utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS `sigma_presensi`.`work_sessions` (
  `id` BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
  `placement_id` BIGINT UNSIGNED NOT NULL,
  `policy_snapshot` JSON NOT NULL,
  `location_version_id` BIGINT UNSIGNED NOT NULL,
  `work_date` DATE NOT NULL,
  `start_at_utc` DATETIME(6) NOT NULL,
  `end_at_utc` DATETIME(6) NOT NULL,
  `timezone` VARCHAR(64) NOT NULL,
  `status` ENUM('planned', 'open', 'closed', 'reconciled') NOT NULL DEFAULT 'planned',
  `created_at` DATETIME(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6),
  `updated_at` DATETIME(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6) ON UPDATE CURRENT_TIMESTAMP(6),
  PRIMARY KEY (`id`),
  INDEX `idx_work_sessions_placement_date` (`placement_id` ASC, `work_date` ASC) VISIBLE,
  INDEX `fk_work_location` (`location_version_id` ASC) VISIBLE,
  CONSTRAINT `fk_work_placement`
    FOREIGN KEY (`placement_id`)
    REFERENCES `sigma_presensi`.`placements` (`id`),
  CONSTRAINT `fk_work_location`
    FOREIGN KEY (`location_version_id`)
    REFERENCES `sigma_presensi`.`location` (`id`))
ENGINE = InnoDB
DEFAULT CHARACTER SET = utf8mb4
COLLATE = utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS `sigma_presensi`.`face_recognation` (
  `id` BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
  `user_id` BIGINT UNSIGNED NOT NULL,
  `model_version` VARCHAR(100) NOT NULL,
  `template_version` INT UNSIGNED NOT NULL,
  `encrypted_payload` MEDIUMBLOB NULL DEFAULT NULL,
  `encryption_key_id` VARCHAR(100) NULL DEFAULT NULL,
  `status` ENUM('pending', 'active', 'rejected', 'superseded', 'deleted') NOT NULL DEFAULT 'pending',
  `enrolled_at` DATETIME(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6),
  `activated_by` BIGINT UNSIGNED NULL DEFAULT NULL,
  `activated_at` DATETIME(6) NULL DEFAULT NULL,
  `deleted_at` DATETIME(6) NULL DEFAULT NULL,
  `active_slot` TINYINT GENERATED ALWAYS AS (CASE WHEN status = 'active' THEN 1 ELSE NULL END) STORED,
  PRIMARY KEY (`id`),
  UNIQUE INDEX `uq_face_user_version` (`user_id` ASC, `template_version` ASC) VISIBLE,
  UNIQUE INDEX `uq_face_one_active` (`user_id` ASC, `active_slot` ASC) VISIBLE,
  INDEX `fk_face_activator` (`activated_by` ASC) VISIBLE,
  CONSTRAINT `fk_face_user`
    FOREIGN KEY (`user_id`)
    REFERENCES `sigma_presensi`.`users` (`id`),
  CONSTRAINT `fk_face_activator`
    FOREIGN KEY (`activated_by`)
    REFERENCES `sigma_presensi`.`users` (`id`))
ENGINE = InnoDB
DEFAULT CHARACTER SET = utf8mb4
COLLATE = utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS `sigma_presensi`.`consent_records` (
  `id` BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
  `user_id` BIGINT UNSIGNED NOT NULL,
  `notice_code` VARCHAR(60) NOT NULL,
  `notice_version` INT UNSIGNED NOT NULL,
  `notice_text` LONGTEXT NOT NULL,
  `mechanism` VARCHAR(100) NOT NULL,
  `status` ENUM('acknowledged', 'granted', 'withdrawn') NOT NULL,
  `recorded_at` DATETIME(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6),
  PRIMARY KEY (`id`),
  INDEX `idx_consent_user_notice` (`user_id` ASC, `notice_code` ASC, `notice_version` ASC, `recorded_at` ASC) VISIBLE,
  CONSTRAINT `fk_consent_user`
    FOREIGN KEY (`user_id`)
    REFERENCES `sigma_presensi`.`users` (`id`))
ENGINE = InnoDB
DEFAULT CHARACTER SET = utf8mb4
COLLATE = utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS `sigma_presensi`.`verification` (
  `id` BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
  `token_hash` CHAR(64) CHARACTER SET 'ascii' COLLATE 'ascii_bin' NOT NULL,
  `user_id` BIGINT UNSIGNED NULL DEFAULT NULL,
  `work_session_id` BIGINT UNSIGNED NULL DEFAULT NULL,
  `face_recognation_id` BIGINT UNSIGNED NULL DEFAULT NULL,
  `action` ENUM('enrollment', 'check_in', 'check_out') NOT NULL,
  `status` ENUM('issued', 'verified', 'failed', 'consumed', 'expired', 'revoked') NOT NULL DEFAULT 'issued',
  `trusted_result` JSON NULL DEFAULT NULL,
  `verified_at` DATETIME(6) NULL DEFAULT NULL,
  `expires_at` DATETIME(6) NOT NULL,
  `consumed_at` DATETIME(6) NULL DEFAULT NULL,
  `created_at` DATETIME(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6),
  PRIMARY KEY (`id`),
  UNIQUE INDEX `uq_challenge_token` (`token_hash` ASC) VISIBLE,
  INDEX `idx_challenge_expiry` (`expires_at` ASC) VISIBLE,
  INDEX `idx_challenge_user_status` (`user_id` ASC, `status` ASC) VISIBLE,
  INDEX `fk_challenge_work` (`work_session_id` ASC) VISIBLE,
  INDEX `fk_challenge_template` (`face_recognation_id` ASC) VISIBLE,
  CONSTRAINT `fk_challenge_user`
    FOREIGN KEY (`user_id`)
    REFERENCES `sigma_presensi`.`users` (`id`),
  CONSTRAINT `fk_challenge_work`
    FOREIGN KEY (`work_session_id`)
    REFERENCES `sigma_presensi`.`work_sessions` (`id`),
  CONSTRAINT `fk_challenge_template`
    FOREIGN KEY (`face_recognation_id`)
    REFERENCES `sigma_presensi`.`face_recognation` (`id`))
ENGINE = InnoDB
DEFAULT CHARACTER SET = utf8mb4
COLLATE = utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS `sigma_presensi`.`attendance_records` (
  `id` BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
  `work_session_id` BIGINT UNSIGNED NOT NULL,
  `effective_check_in_at` DATETIME(6) NULL DEFAULT NULL,
  `effective_check_out_at` DATETIME(6) NULL DEFAULT NULL,
  `status` ENUM('not_started', 'open', 'complete', 'incomplete') NOT NULL DEFAULT 'not_started',
  `version` INT UNSIGNED NOT NULL DEFAULT 1,
  `created_at` DATETIME(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6),
  `updated_at` DATETIME(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6) ON UPDATE CURRENT_TIMESTAMP(6),
  PRIMARY KEY (`id`),
  UNIQUE INDEX `uq_attendance_work_session` (`work_session_id` ASC) VISIBLE,
  CONSTRAINT `fk_attendance_work`
    FOREIGN KEY (`work_session_id`)
    REFERENCES `sigma_presensi`.`work_sessions` (`id`))
ENGINE = InnoDB
DEFAULT CHARACTER SET = utf8mb4
COLLATE = utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS `sigma_presensi`.`attandance` (
  `id` BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
  `attendance_record_id` BIGINT UNSIGNED NOT NULL,
  `verification_id` BIGINT UNSIGNED NOT NULL,
  `type` ENUM('check_in', 'check_out') NOT NULL,
  `source` ENUM('authenticated', 'quick_attendance') NOT NULL,
  `occurred_at_server` DATETIME(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6),
  `created_at` DATETIME(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6),
  PRIMARY KEY (`id`),
  UNIQUE INDEX `uq_event_record_type` (`attendance_record_id` ASC, `type` ASC) VISIBLE,
  UNIQUE INDEX `uq_event_verification` (`verification_id` ASC) VISIBLE,
  CONSTRAINT `fk_event_record`
    FOREIGN KEY (`attendance_record_id`)
    REFERENCES `sigma_presensi`.`attendance_records` (`id`),
  CONSTRAINT `fk_event_verification`
    FOREIGN KEY (`verification_id`)
    REFERENCES `sigma_presensi`.`verification` (`id`))
ENGINE = InnoDB
DEFAULT CHARACTER SET = utf8mb4
COLLATE = utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS `sigma_presensi`.`idempotency_records` (
  `id` BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
  `challenge_id` BIGINT UNSIGNED NULL DEFAULT NULL,
  `authority_scope` VARCHAR(128) CHARACTER SET 'ascii' COLLATE 'ascii_bin' NOT NULL,
  `idempotency_key` VARCHAR(128) CHARACTER SET 'ascii' COLLATE 'ascii_bin' NOT NULL,
  `request_fingerprint` CHAR(64) CHARACTER SET 'ascii' COLLATE 'ascii_bin' NOT NULL,
  `operation_status` ENUM('processing', 'succeeded', 'failed') NOT NULL DEFAULT 'processing',
  `result_reference` VARCHAR(255) NULL DEFAULT NULL,
  `response_status` SMALLINT UNSIGNED NULL DEFAULT NULL,
  `expires_at` DATETIME(6) NOT NULL,
  `created_at` DATETIME(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6),
  `updated_at` DATETIME(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6) ON UPDATE CURRENT_TIMESTAMP(6),
  PRIMARY KEY (`id`),
  UNIQUE INDEX `uq_idempotency_scope_key` (`authority_scope` ASC, `idempotency_key` ASC) VISIBLE,
  INDEX `idx_idempotency_expiry` (`expires_at` ASC) VISIBLE,
  INDEX `fk_idempotency_challenge` (`challenge_id` ASC) VISIBLE,
  CONSTRAINT `fk_idempotency_challenge`
    FOREIGN KEY (`challenge_id`)
    REFERENCES `sigma_presensi`.`verification` (`id`))
ENGINE = InnoDB
DEFAULT CHARACTER SET = utf8mb4
COLLATE = utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS `sigma_presensi`.`absense_request` (
  `id` BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
  `placement_id` BIGINT UNSIGNED NOT NULL,
  `requested_by` BIGINT UNSIGNED NOT NULL,
  `start_date` DATE NOT NULL,
  `end_date` DATE NOT NULL,
  `type` ENUM('izin', 'sakit', 'cuti') NOT NULL,
  `reason` TEXT NOT NULL,
  `status` ENUM('pending', 'approved', 'rejected', 'cancelled') NOT NULL DEFAULT 'pending',
  `version` INT UNSIGNED NOT NULL DEFAULT 1,
  `created_at` DATETIME(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6),
  `updated_at` DATETIME(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6) ON UPDATE CURRENT_TIMESTAMP(6),
  PRIMARY KEY (`id`),
  INDEX `idx_leave_placement_status_date` (`placement_id` ASC, `status` ASC, `start_date` ASC) VISIBLE,
  INDEX `fk_leave_requester` (`requested_by` ASC) VISIBLE,
  CONSTRAINT `fk_leave_placement`
    FOREIGN KEY (`placement_id`)
    REFERENCES `sigma_presensi`.`placements` (`id`),
  CONSTRAINT `fk_leave_requester`
    FOREIGN KEY (`requested_by`)
    REFERENCES `sigma_presensi`.`users` (`id`))
ENGINE = InnoDB
DEFAULT CHARACTER SET = utf8mb4
COLLATE = utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS `sigma_presensi`.`absense_decisions` (
  `id` BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
  `absense_request_id` BIGINT UNSIGNED NOT NULL,
  `decided_by` BIGINT UNSIGNED NOT NULL,
  `request_version` INT UNSIGNED NOT NULL,
  `decision` ENUM('approved', 'rejected') NOT NULL,
  `reason` TEXT NOT NULL,
  `decided_at` DATETIME(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6),
  PRIMARY KEY (`id`),
  UNIQUE INDEX `uq_leave_decision_version` (`absense_request_id` ASC, `request_version` ASC) VISIBLE,
  INDEX `fk_leave_decision_staff` (`decided_by` ASC) VISIBLE,
  CONSTRAINT `fk_leave_decision_request`
    FOREIGN KEY (`absense_request_id`)
    REFERENCES `sigma_presensi`.`absense_request` (`id`),
  CONSTRAINT `fk_leave_decision_staff`
    FOREIGN KEY (`decided_by`)
    REFERENCES `sigma_presensi`.`users` (`id`))
ENGINE = InnoDB
DEFAULT CHARACTER SET = utf8mb4
COLLATE = utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS `sigma_presensi`.`correction_request` (
  `id` BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
  `work_session_id` BIGINT UNSIGNED NOT NULL,
  `requested_by` BIGINT UNSIGNED NOT NULL,
  `reason` TEXT NOT NULL,
  `status` ENUM('pending', 'approved', 'rejected', 'cancelled') NOT NULL DEFAULT 'pending',
  `version` INT UNSIGNED NOT NULL DEFAULT 1,
  `proposed_check_in_at` DATETIME(6) NULL DEFAULT NULL,
  `proposed_check_out_at` DATETIME(6) NULL DEFAULT NULL,
  `decided_by` BIGINT UNSIGNED NULL DEFAULT NULL,
  `decision_reason` TEXT NULL DEFAULT NULL,
  `decided_at` DATETIME(6) NULL DEFAULT NULL,
  `before_values` JSON NULL DEFAULT NULL,
  `after_values` JSON NULL DEFAULT NULL,
  `record_version_before` INT UNSIGNED NULL DEFAULT NULL,
  `record_version_after` INT UNSIGNED NULL DEFAULT NULL,
  `created_at` DATETIME(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6),
  `updated_at` DATETIME(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6) ON UPDATE CURRENT_TIMESTAMP(6),
  PRIMARY KEY (`id`),
  INDEX `idx_correction_work_status` (`work_session_id` ASC, `status` ASC) VISIBLE,
  INDEX `fk_correction_requester` (`requested_by` ASC) VISIBLE,
  INDEX `fk_correction_decider` (`decided_by` ASC) VISIBLE,
  CONSTRAINT `fk_correction_work`
    FOREIGN KEY (`work_session_id`)
    REFERENCES `sigma_presensi`.`work_sessions` (`id`),
  CONSTRAINT `fk_correction_requester`
    FOREIGN KEY (`requested_by`)
    REFERENCES `sigma_presensi`.`users` (`id`),
  CONSTRAINT `fk_correction_decider`
    FOREIGN KEY (`decided_by`)
    REFERENCES `sigma_presensi`.`users` (`id`))
ENGINE = InnoDB
DEFAULT CHARACTER SET = utf8mb4
COLLATE = utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS `sigma_presensi`.`attandance_document` (
  `id` BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
  `owner_user_id` BIGINT UNSIGNED NOT NULL,
  `absense_request_id` BIGINT UNSIGNED NULL DEFAULT NULL,
  `correction_request_id` BIGINT UNSIGNED NULL DEFAULT NULL,
  `mime_type` VARCHAR(100) NOT NULL,
  `size_bytes` BIGINT UNSIGNED NOT NULL,
  `private_storage_key` VARCHAR(255) CHARACTER SET 'ascii' COLLATE 'ascii_bin' NOT NULL,
  `retention_until` DATETIME(6) NOT NULL,
  `created_at` DATETIME(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6),
  PRIMARY KEY (`id`),
  UNIQUE INDEX `uq_attachment_storage` (`private_storage_key` ASC) VISIBLE,
  INDEX `idx_attachment_retention` (`retention_until` ASC) VISIBLE,
  INDEX `fk_attachment_owner` (`owner_user_id` ASC) VISIBLE,
  INDEX `fk_attachment_leave` (`absense_request_id` ASC) VISIBLE,
  INDEX `fk_attachment_correction` (`correction_request_id` ASC) VISIBLE,
  CONSTRAINT `fk_attachment_owner`
    FOREIGN KEY (`owner_user_id`)
    REFERENCES `sigma_presensi`.`users` (`id`),
  CONSTRAINT `fk_attachment_leave`
    FOREIGN KEY (`absense_request_id`)
    REFERENCES `sigma_presensi`.`absense_request` (`id`),
  CONSTRAINT `fk_attachment_correction`
    FOREIGN KEY (`correction_request_id`)
    REFERENCES `sigma_presensi`.`correction_request` (`id`))
ENGINE = InnoDB
DEFAULT CHARACTER SET = utf8mb4
COLLATE = utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS `sigma_presensi`.`sessions` (
  `id_hash` CHAR(64) CHARACTER SET 'ascii' COLLATE 'ascii_bin' NOT NULL,
  `user_id` BIGINT UNSIGNED NOT NULL,
  `expires_at` DATETIME(6) NOT NULL,
  `revoked_at` DATETIME(6) NULL DEFAULT NULL,
  `created_at` DATETIME(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6),
  PRIMARY KEY (`id_hash`),
  INDEX `idx_sessions_user` (`user_id` ASC) VISIBLE,
  INDEX `idx_sessions_expiry` (`expires_at` ASC) VISIBLE,
  CONSTRAINT `fk_session_user`
    FOREIGN KEY (`user_id`)
    REFERENCES `sigma_presensi`.`users` (`id`))
ENGINE = InnoDB
DEFAULT CHARACTER SET = utf8mb4
COLLATE = utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS `sigma_presensi`.`audit_events` (
  `id` BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
  `actor_user_id` BIGINT UNSIGNED NULL DEFAULT NULL,
  `authority_scope` VARCHAR(128) CHARACTER SET 'ascii' COLLATE 'ascii_bin' NOT NULL,
  `action` VARCHAR(100) NOT NULL,
  `entity_type` VARCHAR(80) NOT NULL,
  `entity_id` VARCHAR(100) NULL DEFAULT NULL,
  `request_id` VARCHAR(100) CHARACTER SET 'ascii' COLLATE 'ascii_bin' NOT NULL,
  `safe_changes` JSON NULL DEFAULT NULL,
  `occurred_at` DATETIME(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6),
  PRIMARY KEY (`id`),
  INDEX `idx_audit_entity_time` (`entity_type` ASC, `entity_id` ASC, `occurred_at` ASC) VISIBLE,
  INDEX `idx_audit_actor_time` (`actor_user_id` ASC, `occurred_at` ASC) VISIBLE,
  INDEX `idx_audit_request` (`request_id` ASC) VISIBLE,
  CONSTRAINT `fk_audit_actor`
    FOREIGN KEY (`actor_user_id`)
    REFERENCES `sigma_presensi`.`users` (`id`))
ENGINE = InnoDB
DEFAULT CHARACTER SET = utf8mb4
COLLATE = utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS `sigma_presensi`.`account_tokens` (
  `id` BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
  `user_id` BIGINT UNSIGNED NOT NULL,
  `issued_by` BIGINT UNSIGNED NOT NULL,
  `token_hash` CHAR(64) CHARACTER SET 'ascii' COLLATE 'ascii_bin' NOT NULL,
  `purpose` ENUM('activation', 'password_reset') NOT NULL,
  `expires_at` DATETIME(6) NOT NULL,
  `consumed_at` DATETIME(6) NULL DEFAULT NULL,
  `revoked_at` DATETIME(6) NULL DEFAULT NULL,
  `created_at` DATETIME(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6),
  PRIMARY KEY (`id`),
  UNIQUE INDEX `uq_account_token_hash` (`token_hash` ASC) VISIBLE,
  INDEX `idx_account_token_user_purpose` (`user_id` ASC, `purpose` ASC) VISIBLE,
  INDEX `idx_account_token_expiry` (`expires_at` ASC) VISIBLE,
  INDEX `fk_account_token_issuer` (`issued_by` ASC) VISIBLE,
  CONSTRAINT `fk_account_token_user`
    FOREIGN KEY (`user_id`)
    REFERENCES `sigma_presensi`.`users` (`id`),
  CONSTRAINT `fk_account_token_issuer`
    FOREIGN KEY (`issued_by`)
    REFERENCES `sigma_presensi`.`users` (`id`))
ENGINE = InnoDB
DEFAULT CHARACTER SET = utf8mb4
COLLATE = utf8mb4_unicode_ci;

SET SQL_MODE=@OLD_SQL_MODE;
SET FOREIGN_KEY_CHECKS=@OLD_FOREIGN_KEY_CHECKS;
SET UNIQUE_CHECKS=@OLD_UNIQUE_CHECKS;
