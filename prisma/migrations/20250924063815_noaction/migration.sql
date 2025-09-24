-- DropForeignKey
ALTER TABLE `overhead` DROP FOREIGN KEY `Overhead_createdByUser_fkey`;

-- DropForeignKey
ALTER TABLE `overhead` DROP FOREIGN KEY `Overhead_updatedByUser_fkey`;

-- DropForeignKey
ALTER TABLE `overheadedit` DROP FOREIGN KEY `OverheadEdit_createdByUser_fkey`;

-- DropForeignKey
ALTER TABLE `overheadedit` DROP FOREIGN KEY `OverheadEdit_updatedByUser_fkey`;

-- DropIndex
DROP INDEX `Overhead_createdByUser_fkey` ON `overhead`;

-- DropIndex
DROP INDEX `Overhead_updatedByUser_fkey` ON `overhead`;

-- DropIndex
DROP INDEX `OverheadEdit_createdByUser_fkey` ON `overheadedit`;

-- DropIndex
DROP INDEX `OverheadEdit_updatedByUser_fkey` ON `overheadedit`;

-- AddForeignKey
ALTER TABLE `Overhead` ADD CONSTRAINT `Overhead_createdByUser_fkey` FOREIGN KEY (`createdByUser`) REFERENCES `User`(`username`) ON DELETE NO ACTION ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Overhead` ADD CONSTRAINT `Overhead_updatedByUser_fkey` FOREIGN KEY (`updatedByUser`) REFERENCES `User`(`username`) ON DELETE NO ACTION ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `OverheadEdit` ADD CONSTRAINT `OverheadEdit_createdByUser_fkey` FOREIGN KEY (`createdByUser`) REFERENCES `User`(`username`) ON DELETE NO ACTION ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `OverheadEdit` ADD CONSTRAINT `OverheadEdit_updatedByUser_fkey` FOREIGN KEY (`updatedByUser`) REFERENCES `User`(`username`) ON DELETE NO ACTION ON UPDATE CASCADE;
