-- DropForeignKey
ALTER TABLE `joborder` DROP FOREIGN KEY `JobOrder_customerId_fkey`;

-- DropForeignKey
ALTER TABLE `joborderedit` DROP FOREIGN KEY `JobOrderEdit_customerId_fkey`;

-- DropIndex
DROP INDEX `JobOrder_customerId_fkey` ON `joborder`;

-- DropIndex
DROP INDEX `JobOrderEdit_customerId_fkey` ON `joborderedit`;

-- AddForeignKey
ALTER TABLE `JobOrder` ADD CONSTRAINT `JobOrder_customerId_fkey` FOREIGN KEY (`customerId`) REFERENCES `Customer`(`id`) ON DELETE NO ACTION ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `JobOrderEdit` ADD CONSTRAINT `JobOrderEdit_customerId_fkey` FOREIGN KEY (`customerId`) REFERENCES `Customer`(`id`) ON DELETE NO ACTION ON UPDATE CASCADE;
