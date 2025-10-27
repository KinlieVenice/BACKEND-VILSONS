/*
  Warnings:

  - You are about to drop the column `userName` on the `activitylog` table. All the data in the column will be lost.
  - Added the required column `createdByUser` to the `activitylog` table without a default value. This is not possible if the table is not empty.

*/
-- DropForeignKey
ALTER TABLE `activitylog` DROP FOREIGN KEY `activitylog_userName_fkey`;

-- DropIndex
DROP INDEX `activitylog_userName_fkey` ON `activitylog`;

-- AlterTable
ALTER TABLE `activitylog` DROP COLUMN `userName`,
    ADD COLUMN `createdByUser` VARCHAR(191) NOT NULL;

-- AddForeignKey
ALTER TABLE `activitylog` ADD CONSTRAINT `activitylog_createdByUser_fkey` FOREIGN KEY (`createdByUser`) REFERENCES `user`(`username`) ON DELETE NO ACTION ON UPDATE CASCADE;
