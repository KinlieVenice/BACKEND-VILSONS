/*
  Warnings:

  - A unique constraint covering the columns `[action]` on the table `Permission` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[roleName]` on the table `Role` will be added. If there are existing duplicate values, this will fail.

*/
-- CreateIndex
CREATE UNIQUE INDEX `Permission_action_key` ON `Permission`(`action`);

-- CreateIndex
CREATE UNIQUE INDEX `Role_roleName_key` ON `Role`(`roleName`);
