/*
  Warnings:

  - Made the column `fullName` on table `user` required. This step will fail if there are existing NULL values in that column.
  - Made the column `fullName` on table `useredit` required. This step will fail if there are existing NULL values in that column.

*/
-- AlterTable
ALTER TABLE `user` MODIFY `fullName` VARCHAR(100) NOT NULL;

-- AlterTable
ALTER TABLE `useredit` MODIFY `fullName` VARCHAR(100) NOT NULL;
