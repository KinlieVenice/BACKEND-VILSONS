-- DropForeignKey
ALTER TABLE `role` DROP FOREIGN KEY `Role_baseRoleId_fkey`;

-- DropIndex
DROP INDEX `Role_baseRoleId_fkey` ON `role`;

-- AlterTable
ALTER TABLE `role` MODIFY `baseRoleId` VARCHAR(191) NULL,
    MODIFY `isCustom` BOOLEAN NULL;

-- AddForeignKey
ALTER TABLE `Role` ADD CONSTRAINT `Role_baseRoleId_fkey` FOREIGN KEY (`baseRoleId`) REFERENCES `Role`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;
