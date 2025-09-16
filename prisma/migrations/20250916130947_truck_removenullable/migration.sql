/*
  Warnings:

  - Made the column `updatedAt` on table `truck` required. This step will fail if there are existing NULL values in that column.
  - Made the column `updatedByUser` on table `truck` required. This step will fail if there are existing NULL values in that column.

*/
-- DropForeignKey
ALTER TABLE `truck` DROP FOREIGN KEY `Truck_updatedByUser_fkey`;

-- DropIndex
DROP INDEX `Truck_updatedByUser_fkey` ON `truck`;

-- AlterTable
ALTER TABLE `truck` MODIFY `updatedAt` DATETIME(3) NOT NULL,
    MODIFY `updatedByUser` VARCHAR(191) NOT NULL;

-- AddForeignKey
ALTER TABLE `Truck` ADD CONSTRAINT `Truck_updatedByUser_fkey` FOREIGN KEY (`updatedByUser`) REFERENCES `User`(`username`) ON DELETE NO ACTION ON UPDATE CASCADE;
