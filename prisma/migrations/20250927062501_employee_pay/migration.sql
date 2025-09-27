/*
  Warnings:

  - You are about to drop the column `payComponentName` on the `paycomponent` table. All the data in the column will be lost.
  - Added the required column `amount` to the `PayComponent` table without a default value. This is not possible if the table is not empty.
  - Added the required column `componentId` to the `PayComponent` table without a default value. This is not possible if the table is not empty.
  - Added the required column `createdByUser` to the `PayComponent` table without a default value. This is not possible if the table is not empty.
  - Added the required column `employeePayId` to the `PayComponent` table without a default value. This is not possible if the table is not empty.
  - Added the required column `updatedAt` to the `PayComponent` table without a default value. This is not possible if the table is not empty.
  - Added the required column `updatedByUser` to the `PayComponent` table without a default value. This is not possible if the table is not empty.

*/
-- DropForeignKey
ALTER TABLE `activitylog` DROP FOREIGN KEY `ActivityLog_userName_fkey`;

-- DropForeignKey
ALTER TABLE `employeesalary` DROP FOREIGN KEY `EmployeeSalary_componentId_fkey`;

-- DropForeignKey
ALTER TABLE `employeesalaryedit` DROP FOREIGN KEY `EmployeeSalaryEdit_componentId_fkey`;

-- DropIndex
DROP INDEX `ActivityLog_userName_fkey` ON `activitylog`;

-- DropIndex
DROP INDEX `EmployeeSalary_componentId_fkey` ON `employeesalary`;

-- DropIndex
DROP INDEX `EmployeeSalaryEdit_componentId_fkey` ON `employeesalaryedit`;

-- AlterTable
ALTER TABLE `paycomponent` DROP COLUMN `payComponentName`,
    ADD COLUMN `amount` DECIMAL(13, 2) NOT NULL,
    ADD COLUMN `componentId` VARCHAR(191) NOT NULL,
    ADD COLUMN `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    ADD COLUMN `createdByUser` VARCHAR(191) NOT NULL,
    ADD COLUMN `employeePayId` VARCHAR(191) NOT NULL,
    ADD COLUMN `updatedAt` DATETIME(3) NOT NULL,
    ADD COLUMN `updatedByUser` VARCHAR(191) NOT NULL;

-- CreateTable
CREATE TABLE `EmployeePay` (
    `id` VARCHAR(191) NOT NULL,
    `employeeId` VARCHAR(191) NOT NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `createdByUser` VARCHAR(191) NOT NULL,
    `updatedAt` DATETIME(3) NOT NULL,
    `updatedByUser` VARCHAR(191) NOT NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `Component` (
    `id` VARCHAR(191) NOT NULL,
    `componentName` VARCHAR(20) NOT NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- AddForeignKey
ALTER TABLE `EmployeePay` ADD CONSTRAINT `EmployeePay_employeeId_fkey` FOREIGN KEY (`employeeId`) REFERENCES `Employee`(`id`) ON DELETE NO ACTION ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `EmployeePay` ADD CONSTRAINT `EmployeePay_createdByUser_fkey` FOREIGN KEY (`createdByUser`) REFERENCES `User`(`username`) ON DELETE NO ACTION ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `EmployeePay` ADD CONSTRAINT `EmployeePay_updatedByUser_fkey` FOREIGN KEY (`updatedByUser`) REFERENCES `User`(`username`) ON DELETE NO ACTION ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `PayComponent` ADD CONSTRAINT `PayComponent_componentId_fkey` FOREIGN KEY (`componentId`) REFERENCES `Component`(`id`) ON DELETE NO ACTION ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `PayComponent` ADD CONSTRAINT `PayComponent_employeePayId_fkey` FOREIGN KEY (`employeePayId`) REFERENCES `EmployeePay`(`id`) ON DELETE NO ACTION ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `PayComponent` ADD CONSTRAINT `PayComponent_createdByUser_fkey` FOREIGN KEY (`createdByUser`) REFERENCES `User`(`username`) ON DELETE NO ACTION ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `PayComponent` ADD CONSTRAINT `PayComponent_updatedByUser_fkey` FOREIGN KEY (`updatedByUser`) REFERENCES `User`(`username`) ON DELETE NO ACTION ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `ActivityLog` ADD CONSTRAINT `ActivityLog_userName_fkey` FOREIGN KEY (`userName`) REFERENCES `User`(`username`) ON DELETE NO ACTION ON UPDATE CASCADE;
