/*
  Warnings:

  - Added the required column `requestType` to the `UserBranchEdit` table without a default value. This is not possible if the table is not empty.
  - Made the column `userId` on table `userbranchedit` required. This step will fail if there are existing NULL values in that column.
  - Added the required column `requestType` to the `UserRoleEdit` table without a default value. This is not possible if the table is not empty.
  - Made the column `userId` on table `userroleedit` required. This step will fail if there are existing NULL values in that column.

*/
-- DropForeignKey
ALTER TABLE `userbranchedit` DROP FOREIGN KEY `UserBranchEdit_userId_fkey`;

-- DropForeignKey
ALTER TABLE `userroleedit` DROP FOREIGN KEY `UserRoleEdit_userId_fkey`;

-- AlterTable
ALTER TABLE `userbranchedit` ADD COLUMN `requestType` ENUM('edit', 'delete', 'create') NOT NULL,
    MODIFY `userId` VARCHAR(191) NOT NULL;

-- AlterTable
ALTER TABLE `userroleedit` ADD COLUMN `requestType` ENUM('edit', 'delete', 'create') NOT NULL,
    MODIFY `userId` VARCHAR(191) NOT NULL;

-- AddForeignKey
ALTER TABLE `UserRoleEdit` ADD CONSTRAINT `UserRoleEdit_userId_fkey` FOREIGN KEY (`userId`) REFERENCES `User`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `UserBranchEdit` ADD CONSTRAINT `UserBranchEdit_userId_fkey` FOREIGN KEY (`userId`) REFERENCES `User`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;
