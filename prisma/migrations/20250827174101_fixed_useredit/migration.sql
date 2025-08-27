/*
  Warnings:

  - You are about to drop the column `username` on the `useredit` table. All the data in the column will be lost.

*/
-- DropIndex
DROP INDEX `UserEdit_email_key` ON `useredit`;

-- DropIndex
DROP INDEX `UserEdit_username_key` ON `useredit`;

-- AlterTable
ALTER TABLE `useredit` DROP COLUMN `username`;
