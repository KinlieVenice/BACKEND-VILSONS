-- DropForeignKey
ALTER TABLE `contractorpayedit` DROP FOREIGN KEY `ContractorPayEdit_contractorPayId_fkey`;

-- DropIndex
DROP INDEX `ContractorPayEdit_contractorPayId_fkey` ON `contractorpayedit`;

-- AlterTable
ALTER TABLE `contractorpayedit` MODIFY `contractorPayId` VARCHAR(191) NULL;

-- AddForeignKey
ALTER TABLE `ContractorPayEdit` ADD CONSTRAINT `ContractorPayEdit_contractorPayId_fkey` FOREIGN KEY (`contractorPayId`) REFERENCES `ContractorPay`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;
