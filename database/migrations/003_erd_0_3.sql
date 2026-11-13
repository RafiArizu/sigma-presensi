USE `sigma_presensi`;

-- PRD-SIGMA revision 0.3.
-- Preconditions checked before execution: legacy face_recognation is empty.
SET @OLD_FOREIGN_KEY_CHECKS = @@FOREIGN_KEY_CHECKS;
SET FOREIGN_KEY_CHECKS = 0;

-- The revised ERD stores private photo metadata, not face templates in MySQL.
ALTER TABLE `verification`
    DROP FOREIGN KEY `fk_challenge_template`,
    DROP INDEX `fk_challenge_template`,
    DROP COLUMN `face_recognation_id`,
    DROP COLUMN `trusted_result`,
    DROP COLUMN `verified_at`,
    MODIFY COLUMN `user_id` BIGINT UNSIGNED NOT NULL,
    MODIFY COLUMN `work_session_id` BIGINT UNSIGNED NOT NULL,
    ADD COLUMN `latitude` DECIMAL(10,7) NULL AFTER `status`,
    ADD COLUMN `longitude` DECIMAL(10,7) NULL AFTER `latitude`,
    ADD COLUMN `accuracy_meters` DECIMAL(10,2) NULL AFTER `longitude`,
    ADD COLUMN `location_captured_at` DATETIME(6) NULL AFTER `accuracy_meters`,
    ADD COLUMN `distance_meters` DECIMAL(10,2) NULL AFTER `location_captured_at`,
    ADD COLUMN `location_validated_at` DATETIME(6) NULL AFTER `distance_meters`;

DROP TABLE `face_recognation`;

CREATE TABLE `attendance_photos` (
  `id` BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
  `user_id` BIGINT UNSIGNED NOT NULL,
  `verification_id` BIGINT UNSIGNED NOT NULL,
  `private_storage_key` VARCHAR(255) CHARACTER SET 'ascii' COLLATE 'ascii_bin' NOT NULL,
  `mime_type` VARCHAR(100) NOT NULL,
  `size_bytes` BIGINT UNSIGNED NOT NULL,
  `sha256` CHAR(64) CHARACTER SET 'ascii' COLLATE 'ascii_bin' NOT NULL,
  `captured_at_client` DATETIME(6) NULL DEFAULT NULL,
  `received_at_server` DATETIME(6) NOT NULL,
  `status` ENUM('temporary', 'available', 'deleted') NOT NULL DEFAULT 'temporary',
  `retention_until` DATETIME(6) NOT NULL,
  `deleted_at` DATETIME(6) NULL DEFAULT NULL,
  PRIMARY KEY (`id`),
  UNIQUE INDEX `uq_attendance_photo_verification` (`verification_id` ASC) VISIBLE,
  UNIQUE INDEX `uq_attendance_photo_storage` (`private_storage_key` ASC) VISIBLE,
  INDEX `idx_attendance_photo_user_retention` (`user_id` ASC, `retention_until` ASC) VISIBLE,
  CONSTRAINT `fk_attendance_photo_user`
    FOREIGN KEY (`user_id`)
    REFERENCES `users` (`id`),
  CONSTRAINT `fk_attendance_photo_verification`
    FOREIGN KEY (`verification_id`)
    REFERENCES `verification` (`id`)
) ENGINE = InnoDB
DEFAULT CHARACTER SET = utf8mb4
COLLATE = utf8mb4_unicode_ci;



SET FOREIGN_KEY_CHECKS = @OLD_FOREIGN_KEY_CHECKS;