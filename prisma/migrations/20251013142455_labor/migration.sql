-- AlterTable
ALTER TABLE `contractorpay` ADD COLUMN `branchId` VARCHAR(191) NULL;

-- AlterTable
ALTER TABLE `employeepay` ADD COLUMN `branchId` VARCHAR(191) NULL;

-- AddForeignKey
ALTER TABLE `contractorpay` ADD CONSTRAINT `contractorpay_branchId_fkey` FOREIGN KEY (`branchId`) REFERENCES `branch`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `employeepay` ADD CONSTRAINT `employeepay_branchId_fkey` FOREIGN KEY (`branchId`) REFERENCES `branch`(`id`) ON DELETE NO ACTION ON UPDATE CASCADE;
