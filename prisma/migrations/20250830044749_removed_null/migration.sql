/*
  Warnings:

  - Made the column `phone` on table `useredit` required. This step will fail if there are existing NULL values in that column.
  - Made the column `email` on table `useredit` required. This step will fail if there are existing NULL values in that column.
  - Made the column `hashPwd` on table `useredit` required. This step will fail if there are existing NULL values in that column.

*/
-- AlterTable
ALTER TABLE `useredit` MODIFY `phone` VARCHAR(13) NOT NULL,
    MODIFY `email` VARCHAR(100) NOT NULL,
    MODIFY `hashPwd` VARCHAR(255) NOT NULL;
