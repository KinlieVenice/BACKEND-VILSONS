-- AddForeignKey
ALTER TABLE `JobOrderEdit` ADD CONSTRAINT `JobOrderEdit_truckId_fkey` FOREIGN KEY (`truckId`) REFERENCES `TruckEdit`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;
