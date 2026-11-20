USE `sigma_presensi`;

-- PRD-SIGMA revision 0.3 cleanup.
-- Precondition checked before execution: face_recognation contains zero rows.
SET @OLD_FOREIGN_KEY_CHECKS = @@FOREIGN_KEY_CHECKS;
SET FOREIGN_KEY_CHECKS = 0;

ALTER TABLE `verification`
    DROP FOREIGN KEY `fk_challenge_template`,
    DROP INDEX `fk_challenge_template`,
    DROP COLUMN `face_recognation_id`,
    DROP COLUMN `trusted_result`,
    DROP COLUMN `verified_at`;

DROP TABLE `face_recognation`;

SET FOREIGN_KEY_CHECKS = @OLD_FOREIGN_KEY_CHECKS;