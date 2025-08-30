/*
  Warnings:

  - You are about to drop the column `name` on the `branch` table. All the data in the column will be lost.
  - You are about to drop the column `name` on the `branchedit` table. All the data in the column will be lost.
  - You are about to drop the column `name` on the `equipment` table. All the data in the column will be lost.
  - You are about to drop the column `name` on the `equipmentedit` table. All the data in the column will be lost.
  - You are about to drop the column `name` on the `material` table. All the data in the column will be lost.
  - You are about to drop the column `name` on the `paycomponent` table. All the data in the column will be lost.
  - You are about to drop the column `name` on the `role` table. All the data in the column will be lost.
  - You are about to drop the column `name` on the `transaction` table. All the data in the column will be lost.
  - You are about to drop the column `name` on the `transactionedit` table. All the data in the column will be lost.
  - Added the required column `branchName` to the `Branch` table without a default value. This is not possible if the table is not empty.
  - Added the required column `branchName` to the `BranchEdit` table without a default value. This is not possible if the table is not empty.
  - Added the required column `equipmentName` to the `Equipment` table without a default value. This is not possible if the table is not empty.
  - Added the required column `equipmentName` to the `EquipmentEdit` table without a default value. This is not possible if the table is not empty.
  - Added the required column `materialName` to the `Material` table without a default value. This is not possible if the table is not empty.
  - Added the required column `payComponentName` to the `PayComponent` table without a default value. This is not possible if the table is not empty.
  - Added the required column `roleName` to the `Role` table without a default value. This is not possible if the table is not empty.
  - Added the required column `transactionName` to the `Transaction` table without a default value. This is not possible if the table is not empty.
  - Added the required column `transactionName` to the `TransactionEdit` table without a default value. This is not possible if the table is not empty.
  - Made the column `phone` on table `user` required. This step will fail if there are existing NULL values in that column.
  - Made the column `fullName` on table `useredit` required. This step will fail if there are existing NULL values in that column.

*/
-- AlterTable
ALTER TABLE `branch` DROP COLUMN `name`,
    ADD COLUMN `branchName` VARCHAR(100) NOT NULL;

-- AlterTable
ALTER TABLE `branchedit` DROP COLUMN `name`,
    ADD COLUMN `branchName` VARCHAR(100) NOT NULL;

-- AlterTable
ALTER TABLE `equipment` DROP COLUMN `name`,
    ADD COLUMN `equipmentName` VARCHAR(100) NOT NULL;

-- AlterTable
ALTER TABLE `equipmentedit` DROP COLUMN `name`,
    ADD COLUMN `equipmentName` VARCHAR(100) NOT NULL;

-- AlterTable
ALTER TABLE `material` DROP COLUMN `name`,
    ADD COLUMN `materialName` VARCHAR(100) NOT NULL;

-- AlterTable
ALTER TABLE `paycomponent` DROP COLUMN `name`,
    ADD COLUMN `payComponentName` VARCHAR(20) NOT NULL;

-- AlterTable
ALTER TABLE `role` DROP COLUMN `name`,
    ADD COLUMN `roleName` VARCHAR(100) NOT NULL;

-- AlterTable
ALTER TABLE `transaction` DROP COLUMN `name`,
    ADD COLUMN `transactionName` VARCHAR(100) NOT NULL;

-- AlterTable
ALTER TABLE `transactionedit` DROP COLUMN `name`,
    ADD COLUMN `transactionName` VARCHAR(100) NOT NULL;

-- AlterTable
ALTER TABLE `user` MODIFY `phone` VARCHAR(13) NOT NULL;

-- AlterTable
ALTER TABLE `useredit` MODIFY `fullName` VARCHAR(100) NOT NULL;
