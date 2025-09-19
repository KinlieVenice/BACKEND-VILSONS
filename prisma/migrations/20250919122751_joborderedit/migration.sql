/*
  Warnings:

  - Added the required column `truckId` to the `JobOrderEdit` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE `joborderedit` ADD COLUMN `truckId` VARCHAR(191) NOT NULL;
