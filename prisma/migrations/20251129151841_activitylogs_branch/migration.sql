-- AlterTable
ALTER TABLE `activitylog` ADD COLUMN `branchId` VARCHAR(191) NULL;

-- AddForeignKey
ALTER TABLE `activitylog` ADD CONSTRAINT `activitylog_branchId_fkey` FOREIGN KEY (`branchId`) REFERENCES `branch`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;
