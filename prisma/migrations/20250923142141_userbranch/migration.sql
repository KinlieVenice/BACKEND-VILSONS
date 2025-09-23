/*
  Warnings:

  - You are about to drop the column `userEditId` on the `userroleedit` table. All the data in the column will be lost.
  - A unique constraint covering the columns `[userId,roleId]` on the table `UserRoleEdit` will be added. If there are existing duplicate values, this will fail.

*/
-- DropForeignKey
ALTER TABLE `userroleedit` DROP FOREIGN KEY `UserRoleEdit_userEditId_fkey`;

-- DropIndex
DROP INDEX `UserRoleEdit_userEditId_roleId_key` ON `userroleedit`;

-- AlterTable
ALTER TABLE `userroleedit` DROP COLUMN `userEditId`,
    ADD COLUMN `userId` VARCHAR(191) NULL;

-- CreateTable
CREATE TABLE `UserBranch` (
    `id` VARCHAR(191) NOT NULL,
    `userId` VARCHAR(191) NOT NULL,
    `branchId` VARCHAR(191) NOT NULL,

    UNIQUE INDEX `UserBranch_userId_branchId_key`(`userId`, `branchId`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `UserBranchEdit` (
    `id` VARCHAR(191) NOT NULL,
    `userId` VARCHAR(191) NULL,
    `branchId` VARCHAR(191) NOT NULL,
    `approvalStatus` ENUM('pending', 'published', 'rejected') NOT NULL DEFAULT 'pending',

    UNIQUE INDEX `UserBranchEdit_userId_branchId_key`(`userId`, `branchId`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateIndex
CREATE UNIQUE INDEX `UserRoleEdit_userId_roleId_key` ON `UserRoleEdit`(`userId`, `roleId`);

-- AddForeignKey
ALTER TABLE `UserRoleEdit` ADD CONSTRAINT `UserRoleEdit_userId_fkey` FOREIGN KEY (`userId`) REFERENCES `User`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `UserBranch` ADD CONSTRAINT `UserBranch_userId_fkey` FOREIGN KEY (`userId`) REFERENCES `User`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `UserBranch` ADD CONSTRAINT `UserBranch_branchId_fkey` FOREIGN KEY (`branchId`) REFERENCES `Branch`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `UserBranchEdit` ADD CONSTRAINT `UserBranchEdit_userId_fkey` FOREIGN KEY (`userId`) REFERENCES `User`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `UserBranchEdit` ADD CONSTRAINT `UserBranchEdit_branchId_fkey` FOREIGN KEY (`branchId`) REFERENCES `Branch`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;
