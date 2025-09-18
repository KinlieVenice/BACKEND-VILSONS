/*
  Warnings:

  - You are about to drop the column `approvalStatus` on the `joborder` table. All the data in the column will be lost.

*/
-- DropForeignKey
ALTER TABLE `joborder` DROP FOREIGN KEY `JobOrder_contractorId_fkey`;

-- DropIndex
DROP INDEX `JobOrder_contractorId_fkey` ON `joborder`;

-- AlterTable
ALTER TABLE `joborder` DROP COLUMN `approvalStatus`,
    MODIFY `contractorId` VARCHAR(191) NULL,
    MODIFY `labor` DECIMAL(13, 2) NULL;

-- AddForeignKey
ALTER TABLE `JobOrder` ADD CONSTRAINT `JobOrder_contractorId_fkey` FOREIGN KEY (`contractorId`) REFERENCES `Contractor`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;
