-- CreateTable
CREATE TABLE `TruckEdit` (
    `id` VARCHAR(191) NOT NULL,
    `truckId` VARCHAR(191) NULL,
    `plate` VARCHAR(10) NOT NULL,
    `make` VARCHAR(20) NOT NULL,
    `model` VARCHAR(20) NOT NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `createdByUser` VARCHAR(191) NOT NULL,
    `updatedAt` DATETIME(3) NOT NULL,
    `updatedByUser` VARCHAR(191) NOT NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- AddForeignKey
ALTER TABLE `TruckEdit` ADD CONSTRAINT `TruckEdit_truckId_fkey` FOREIGN KEY (`truckId`) REFERENCES `Truck`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `TruckEdit` ADD CONSTRAINT `TruckEdit_createdByUser_fkey` FOREIGN KEY (`createdByUser`) REFERENCES `User`(`username`) ON DELETE NO ACTION ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `TruckEdit` ADD CONSTRAINT `TruckEdit_updatedByUser_fkey` FOREIGN KEY (`updatedByUser`) REFERENCES `User`(`username`) ON DELETE NO ACTION ON UPDATE CASCADE;
