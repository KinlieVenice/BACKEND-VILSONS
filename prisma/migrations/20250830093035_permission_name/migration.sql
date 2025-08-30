/*
  Warnings:

  - You are about to drop the column `action` on the `permission` table. All the data in the column will be lost.
  - A unique constraint covering the columns `[permissionName]` on the table `Permission` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `permissionName` to the `Permission` table without a default value. This is not possible if the table is not empty.

*/
-- DropIndex
DROP INDEX `Permission_action_key` ON `permission`;

-- AlterTable
ALTER TABLE `permission` DROP COLUMN `action`,
    ADD COLUMN `permissionName` VARCHAR(100) NOT NULL;

-- CreateIndex
CREATE UNIQUE INDEX `Permission_permissionName_key` ON `Permission`(`permissionName`);
