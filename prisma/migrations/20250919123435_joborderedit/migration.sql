-- DropForeignKey
ALTER TABLE `joborderedit` DROP FOREIGN KEY `JobOrderEdit_jobOrderId_fkey`;

-- DropIndex
DROP INDEX `JobOrderEdit_jobOrderId_fkey` ON `joborderedit`;

-- AlterTable
ALTER TABLE `joborderedit` MODIFY `jobOrderId` VARCHAR(191) NULL;

-- AddForeignKey
ALTER TABLE `JobOrderEdit` ADD CONSTRAINT `JobOrderEdit_jobOrderId_fkey` FOREIGN KEY (`jobOrderId`) REFERENCES `JobOrder`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;
