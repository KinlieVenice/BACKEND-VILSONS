/*
  Warnings:

  - You are about to drop the column `name` on the `user` table. All the data in the column will be lost.
  - You are about to drop the column `name` on the `useredit` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE `user` DROP COLUMN `name`,
    ADD COLUMN `fullName` VARCHAR(100) NULL;

-- AlterTable
ALTER TABLE `useredit` DROP COLUMN `name`,
    ADD COLUMN `fullName` VARCHAR(100) NULL;
