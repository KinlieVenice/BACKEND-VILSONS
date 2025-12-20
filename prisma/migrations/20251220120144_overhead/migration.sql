/*
  Warnings:

  - The `automated` column on the `overhead` table would be dropped and recreated. This will lead to data loss if there is data in the column.

*/
-- AlterTable
ALTER TABLE `overhead` DROP COLUMN `automated`,
    ADD COLUMN `automated` BOOLEAN NULL;
