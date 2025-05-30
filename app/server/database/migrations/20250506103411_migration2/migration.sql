/*
  Warnings:

  - You are about to drop the column `seniority_coefficient` on the `role` table. All the data in the column will be lost.
  - Added the required column `seniority_coefficient` to the `SeniorityLevel` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE `role` DROP COLUMN `seniority_coefficient`;

-- AlterTable
ALTER TABLE `senioritylevel` ADD COLUMN `seniority_coefficient` DOUBLE NOT NULL;
