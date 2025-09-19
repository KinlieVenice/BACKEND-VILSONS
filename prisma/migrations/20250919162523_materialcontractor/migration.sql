-- AlterTable
ALTER TABLE `joborderedit` ADD COLUMN `contractorId` VARCHAR(191) NULL;

-- AddForeignKey
ALTER TABLE `JobOrderEdit` ADD CONSTRAINT `JobOrderEdit_contractorId_fkey` FOREIGN KEY (`contractorId`) REFERENCES `Contractor`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;
