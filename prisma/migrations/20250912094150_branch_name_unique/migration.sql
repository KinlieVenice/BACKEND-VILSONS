/*
  Warnings:

  - A unique constraint covering the columns `[branchName]` on the table `Branch` will be added. If there are existing duplicate values, this will fail.

*/
-- CreateIndex
CREATE UNIQUE INDEX `Branch_branchName_key` ON `Branch`(`branchName`);
