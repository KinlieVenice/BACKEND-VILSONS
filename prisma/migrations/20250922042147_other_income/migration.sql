/*
  Warnings:

  - Added the required column `requestType` to the `OtherIncomeEdit` table without a default value. This is not possible if the table is not empty.

*/
-- DropForeignKey
ALTER TABLE `otherincomeedit` DROP FOREIGN KEY `OtherIncomeEdit_otherIncomeId_fkey`;

-- DropIndex
DROP INDEX `OtherIncomeEdit_otherIncomeId_fkey` ON `otherincomeedit`;

-- AlterTable
ALTER TABLE `otherincomeedit` ADD COLUMN `approvalStatus` ENUM('pending', 'published', 'rejected') NOT NULL DEFAULT 'pending',
    ADD COLUMN `requestType` ENUM('edit', 'delete', 'create') NOT NULL,
    MODIFY `otherIncomeId` VARCHAR(191) NULL;

-- AddForeignKey
ALTER TABLE `OtherIncomeEdit` ADD CONSTRAINT `OtherIncomeEdit_otherIncomeId_fkey` FOREIGN KEY (`otherIncomeId`) REFERENCES `OtherIncome`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;
