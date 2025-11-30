-- AlterTable
ALTER TABLE `approvallog` ADD COLUMN `branchId` VARCHAR(191) NULL;

-- AddForeignKey
ALTER TABLE `approvallog` ADD CONSTRAINT `approvallog_branchId_fkey` FOREIGN KEY (`branchId`) REFERENCES `branch`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;
