/*
  Warnings:

  - You are about to drop the column `approvalStatus` on the `contractorpay` table. All the data in the column will be lost.
  - Added the required column `contractorId` to the `ContractorPayEdit` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE `contractorpay` DROP COLUMN `approvalStatus`;

-- AlterTable
ALTER TABLE `contractorpayedit` ADD COLUMN `contractorId` VARCHAR(191) NOT NULL;

-- AddForeignKey
ALTER TABLE `ContractorPayEdit` ADD CONSTRAINT `ContractorPayEdit_contractorId_fkey` FOREIGN KEY (`contractorId`) REFERENCES `Contractor`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;
