-- DropForeignKey
ALTER TABLE `truckownership` DROP FOREIGN KEY `TruckOwnership_truckId_fkey`;

-- DropIndex
DROP INDEX `TruckOwnership_truckId_fkey` ON `truckownership`;

-- AddForeignKey
ALTER TABLE `TruckOwnership` ADD CONSTRAINT `TruckOwnership_truckId_fkey` FOREIGN KEY (`truckId`) REFERENCES `Truck`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;
