/*
  Warnings:

  - A unique constraint covering the columns `[userId]` on the table `Admin` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[userId]` on the table `Contractor` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[userId]` on the table `Customer` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[userId]` on the table `Employee` will be added. If there are existing duplicate values, this will fail.

*/
-- CreateIndex
CREATE UNIQUE INDEX `Admin_userId_key` ON `Admin`(`userId`);

-- CreateIndex
CREATE UNIQUE INDEX `Contractor_userId_key` ON `Contractor`(`userId`);

-- CreateIndex
CREATE UNIQUE INDEX `Customer_userId_key` ON `Customer`(`userId`);

-- CreateIndex
CREATE UNIQUE INDEX `Employee_userId_key` ON `Employee`(`userId`);
