/*
  Warnings:

  - A unique constraint covering the columns `[roleId,permissionId]` on the table `RolePermission` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[userId,roleId]` on the table `UserRole` will be added. If there are existing duplicate values, this will fail.

*/
-- CreateIndex
CREATE UNIQUE INDEX `RolePermission_roleId_permissionId_key` ON `RolePermission`(`roleId`, `permissionId`);

-- CreateIndex
CREATE UNIQUE INDEX `UserRole_userId_roleId_key` ON `UserRole`(`userId`, `roleId`);
