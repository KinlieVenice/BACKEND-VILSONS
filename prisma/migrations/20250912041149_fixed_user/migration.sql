/*
  Warnings:

  - You are about to drop the column `updatedById` on the `user` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE `user` DROP COLUMN `updatedById`,
    ADD COLUMN `updatedByUser` VARCHAR(191) NULL;

-- AddForeignKey
ALTER TABLE `User` ADD CONSTRAINT `User_updatedByUser_fkey` FOREIGN KEY (`updatedByUser`) REFERENCES `User`(`username`) ON DELETE NO ACTION ON UPDATE CASCADE;
