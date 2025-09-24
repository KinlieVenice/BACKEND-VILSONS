/*
  Warnings:

  - You are about to drop the column `approvalStatus` on the `user` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE `user` DROP COLUMN `approvalStatus`;

-- CreateTable
CREATE TABLE `TruckOwnershipEdit` (
    `id` VARCHAR(191) NOT NULL,
    `truckId` VARCHAR(191) NOT NULL,
    `customerId` VARCHAR(191) NOT NULL,
    `requestType` ENUM('edit', 'delete', 'create') NOT NULL,
    `transferredByUser` VARCHAR(191) NOT NULL,
    `startDate` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `endDate` DATETIME(3) NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- AddForeignKey
ALTER TABLE `TruckOwnershipEdit` ADD CONSTRAINT `TruckOwnershipEdit_truckId_fkey` FOREIGN KEY (`truckId`) REFERENCES `Truck`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `TruckOwnershipEdit` ADD CONSTRAINT `TruckOwnershipEdit_customerId_fkey` FOREIGN KEY (`customerId`) REFERENCES `Customer`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `TruckOwnershipEdit` ADD CONSTRAINT `TruckOwnershipEdit_transferredByUser_fkey` FOREIGN KEY (`transferredByUser`) REFERENCES `User`(`username`) ON DELETE NO ACTION ON UPDATE CASCADE;
