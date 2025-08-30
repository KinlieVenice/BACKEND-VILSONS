-- DropForeignKey
ALTER TABLE `role` DROP FOREIGN KEY `Role_createdById_fkey`;

-- DropIndex
DROP INDEX `Role_createdById_fkey` ON `role`;

-- AlterTable
ALTER TABLE `role` MODIFY `createdById` VARCHAR(191) NULL;

-- AddForeignKey
ALTER TABLE `Role` ADD CONSTRAINT `Role_createdById_fkey` FOREIGN KEY (`createdById`) REFERENCES `User`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;
