-- DropForeignKey
ALTER TABLE `joborderedit` DROP FOREIGN KEY `JobOrderEdit_truckId_fkey`;

-- DropIndex
DROP INDEX `JobOrderEdit_truckId_fkey` ON `joborderedit`;

-- AddForeignKey
ALTER TABLE `JobOrderEdit` ADD CONSTRAINT `JobOrderEdit_truckId_fkey` FOREIGN KEY (`truckId`) REFERENCES `Truck`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;
