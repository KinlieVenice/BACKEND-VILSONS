/*
  Warnings:

  - A unique constraint covering the columns `[plate]` on the table `Truck` will be added. If there are existing duplicate values, this will fail.

*/
-- CreateIndex
CREATE UNIQUE INDEX `Truck_plate_key` ON `Truck`(`plate`);
