/*
  Warnings:

  - Added the required column `requestType` to the `MaterialEdit` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE `materialedit` ADD COLUMN `requestType` ENUM('edit', 'delete', 'create') NOT NULL;
