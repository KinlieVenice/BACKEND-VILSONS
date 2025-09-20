-- DropForeignKey
ALTER TABLE `equipmentedit` DROP FOREIGN KEY `EquipmentEdit_equipmentId_fkey`;

-- DropIndex
DROP INDEX `EquipmentEdit_equipmentId_fkey` ON `equipmentedit`;

-- AlterTable
ALTER TABLE `equipmentedit` MODIFY `equipmentId` VARCHAR(191) NULL;

-- AddForeignKey
ALTER TABLE `EquipmentEdit` ADD CONSTRAINT `EquipmentEdit_equipmentId_fkey` FOREIGN KEY (`equipmentId`) REFERENCES `Equipment`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;
