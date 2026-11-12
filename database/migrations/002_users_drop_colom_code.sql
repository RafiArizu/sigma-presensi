USE `sigma_presensi`;

ALTER TABLE `users`
    MODIFY COLUMN `email` VARCHAR(254) NOT NULL,
    DROP INDEX `uq_users_code`,
    DROP COLUMN `code`;