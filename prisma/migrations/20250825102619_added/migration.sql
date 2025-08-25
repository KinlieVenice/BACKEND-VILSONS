/*
  Warnings:

  - Added the required column `username` to the `UserVersion` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE `userversion` ADD COLUMN `username` VARCHAR(100) NOT NULL,
    MODIFY `description` VARCHAR(191) NULL;
