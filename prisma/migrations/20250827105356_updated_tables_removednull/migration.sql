/*
  Warnings:

  - Made the column `email` on table `user` required. This step will fail if there are existing NULL values in that column.
  - Made the column `hashPwd` on table `user` required. This step will fail if there are existing NULL values in that column.
  - Made the column `name` on table `user` required. This step will fail if there are existing NULL values in that column.
  - Made the column `updatedAt` on table `user` required. This step will fail if there are existing NULL values in that column.
  - Made the column `username` on table `user` required. This step will fail if there are existing NULL values in that column.

*/
-- AlterTable
ALTER TABLE `user` MODIFY `email` VARCHAR(100) NOT NULL,
    MODIFY `hashPwd` VARCHAR(255) NOT NULL,
    MODIFY `name` VARCHAR(100) NOT NULL,
    MODIFY `updatedAt` DATETIME(3) NOT NULL,
    MODIFY `username` VARCHAR(100) NOT NULL;
