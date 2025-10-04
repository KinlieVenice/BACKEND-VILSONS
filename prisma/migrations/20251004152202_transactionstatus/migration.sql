/*
  Warnings:

  - You are about to alter the column `status` on the `transaction` table. The data in that column could be lost. The data in that column will be cast from `VarChar(191)` to `Enum(EnumId(22))`.

*/
-- AlterTable
ALTER TABLE `transaction` MODIFY `status` ENUM('pending', 'successful', 'failed') NOT NULL DEFAULT 'pending';
