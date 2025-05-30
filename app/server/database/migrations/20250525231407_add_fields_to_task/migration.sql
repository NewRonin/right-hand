-- AlterTable
ALTER TABLE `task` ADD COLUMN `end_date` DATETIME(3) NULL,
    ADD COLUMN `extra_coefficient` DOUBLE NULL,
    ADD COLUMN `extra_coefficient_description` VARCHAR(191) NULL,
    ADD COLUMN `progress` INTEGER NULL,
    ADD COLUMN `start_date` DATETIME(3) NULL;
