-- DropForeignKey
ALTER TABLE `joborder` DROP FOREIGN KEY `JobOrder_truckId_fkey`;

-- DropIndex
DROP INDEX `JobOrder_truckId_fkey` ON `joborder`;

-- AddForeignKey
ALTER TABLE `JobOrder` ADD CONSTRAINT `JobOrder_truckId_fkey` FOREIGN KEY (`truckId`) REFERENCES `Truck`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;
