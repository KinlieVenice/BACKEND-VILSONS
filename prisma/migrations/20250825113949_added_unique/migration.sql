/*
  Warnings:

  - A unique constraint covering the columns `[username]` on the table `UserVersion` will be added. If there are existing duplicate values, this will fail.

*/
-- CreateIndex
CREATE UNIQUE INDEX `UserVersion_username_key` ON `UserVersion`(`username`);
