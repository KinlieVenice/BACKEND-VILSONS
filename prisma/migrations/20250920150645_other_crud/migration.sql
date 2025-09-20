/*
  Warnings:

  - You are about to drop the column `approvalStatus` on the `equipment` table. All the data in the column will be lost.
  - You are about to drop the column `approvalStatus` on the `otherincome` table. All the data in the column will be lost.
  - You are about to drop the column `approvalStatus` on the `overhead` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE `equipment` DROP COLUMN `approvalStatus`;

-- AlterTable
ALTER TABLE `otherincome` DROP COLUMN `approvalStatus`;

-- AlterTable
ALTER TABLE `overhead` DROP COLUMN `approvalStatus`;
