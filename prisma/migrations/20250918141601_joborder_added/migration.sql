/*
  Warnings:

  - Added the required column `customerId` to the `JobOrder` table without a default value. This is not possible if the table is not empty.
  - Added the required column `customerId` to the `JobOrderEdit` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE `joborder` ADD COLUMN `customerId` VARCHAR(191) NOT NULL;

-- AlterTable
ALTER TABLE `joborderedit` ADD COLUMN `customerId` VARCHAR(191) NOT NULL;

-- AddForeignKey
ALTER TABLE `JobOrder` ADD CONSTRAINT `JobOrder_customerId_fkey` FOREIGN KEY (`customerId`) REFERENCES `User`(`id`) ON DELETE NO ACTION ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `JobOrderEdit` ADD CONSTRAINT `JobOrderEdit_customerId_fkey` FOREIGN KEY (`customerId`) REFERENCES `User`(`id`) ON DELETE NO ACTION ON UPDATE CASCADE;
