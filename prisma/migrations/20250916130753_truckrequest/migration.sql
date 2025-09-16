-- AlterTable
ALTER TABLE `truck` ADD COLUMN `updatedAt` DATETIME(3) NULL,
    ADD COLUMN `updatedByUser` VARCHAR(191) NULL;

-- AlterTable
ALTER TABLE `truckedit` ADD COLUMN `requestType` ENUM('edit', 'delete', 'create') NOT NULL DEFAULT 'create';

-- AddForeignKey
ALTER TABLE `Truck` ADD CONSTRAINT `Truck_updatedByUser_fkey` FOREIGN KEY (`updatedByUser`) REFERENCES `User`(`username`) ON DELETE NO ACTION ON UPDATE CASCADE;
