/*
  Warnings:

  - You are about to drop the column `userId` on the `userroleedit` table. All the data in the column will be lost.
  - A unique constraint covering the columns `[userEditId,roleId]` on the table `UserRoleEdit` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `userEditId` to the `UserRoleEdit` table without a default value. This is not possible if the table is not empty.

*/
-- DropForeignKey
ALTER TABLE `userroleedit` DROP FOREIGN KEY `UserRoleEdit_userId_fkey`;

-- DropIndex
DROP INDEX `UserRoleEdit_userId_roleId_key` ON `userroleedit`;

-- AlterTable
ALTER TABLE `userroleedit` DROP COLUMN `userId`,
    ADD COLUMN `userEditId` VARCHAR(191) NOT NULL;

-- CreateIndex
CREATE UNIQUE INDEX `UserRoleEdit_userEditId_roleId_key` ON `UserRoleEdit`(`userEditId`, `roleId`);

-- AddForeignKey
ALTER TABLE `UserRoleEdit` ADD CONSTRAINT `UserRoleEdit_userEditId_fkey` FOREIGN KEY (`userEditId`) REFERENCES `UserEdit`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;
