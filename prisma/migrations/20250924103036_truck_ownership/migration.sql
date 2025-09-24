-- DropForeignKey
ALTER TABLE `truckedit` DROP FOREIGN KEY `TruckEdit_truckId_fkey`;

-- DropIndex
DROP INDEX `TruckEdit_truckId_fkey` ON `truckedit`;

-- AddForeignKey
ALTER TABLE `TruckEdit` ADD CONSTRAINT `TruckEdit_truckId_fkey` FOREIGN KEY (`truckId`) REFERENCES `Truck`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;
