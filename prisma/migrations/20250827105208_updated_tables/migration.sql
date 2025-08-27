/*
  Warnings:

  - You are about to drop the column `moduleVersionId` on the `approvallog` table. All the data in the column will be lost.
  - The values [Job Order] on the enum `ApprovalLog_module` will be removed. If these variants are still used in the database, this will fail.
  - You are about to drop the column `approval` on the `permission` table. All the data in the column will be lost.
  - The values [approved] on the enum `Role_approvalStatus` will be removed. If these variants are still used in the database, this will fail.
  - You are about to drop the column `approvalStatus` on the `rolepermission` table. All the data in the column will be lost.
  - You are about to alter the column `approvalStatus` on the `userrole` table. The data in that column could be lost. The data in that column will be cast from `Enum(EnumId(11))` to `Enum(EnumId(32))`.
  - You are about to drop the `branchversion` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `contractorpayversion` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `employeesalaryversion` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `equipmentversion` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `joborderversion` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `otherincomeversion` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `overheadexpenses` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `overheadexpensesversion` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `transactionversion` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `userversion` table. If the table is not empty, all the data it contains will be lost.
  - A unique constraint covering the columns `[username]` on the table `User` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[email]` on the table `User` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `moduleId` to the `ApprovalLog` table without a default value. This is not possible if the table is not empty.
  - Added the required column `table` to the `ApprovalLog` table without a default value. This is not possible if the table is not empty.
  - Added the required column `address` to the `Branch` table without a default value. This is not possible if the table is not empty.
  - Added the required column `description` to the `Branch` table without a default value. This is not possible if the table is not empty.
  - Added the required column `name` to the `Branch` table without a default value. This is not possible if the table is not empty.
  - Added the required column `updatedAt` to the `Branch` table without a default value. This is not possible if the table is not empty.
  - Added the required column `updatedById` to the `Branch` table without a default value. This is not possible if the table is not empty.
  - Added the required column `amount` to the `ContractorPay` table without a default value. This is not possible if the table is not empty.
  - Added the required column `type` to the `ContractorPay` table without a default value. This is not possible if the table is not empty.
  - Added the required column `updatedAt` to the `ContractorPay` table without a default value. This is not possible if the table is not empty.
  - Added the required column `updatedById` to the `ContractorPay` table without a default value. This is not possible if the table is not empty.
  - Added the required column `amount` to the `EmployeeSalary` table without a default value. This is not possible if the table is not empty.
  - Added the required column `componentId` to the `EmployeeSalary` table without a default value. This is not possible if the table is not empty.
  - Added the required column `updatedAt` to the `EmployeeSalary` table without a default value. This is not possible if the table is not empty.
  - Added the required column `updatedById` to the `EmployeeSalary` table without a default value. This is not possible if the table is not empty.
  - Added the required column `branchId` to the `Equipment` table without a default value. This is not possible if the table is not empty.
  - Added the required column `name` to the `Equipment` table without a default value. This is not possible if the table is not empty.
  - Added the required column `price` to the `Equipment` table without a default value. This is not possible if the table is not empty.
  - Added the required column `quantity` to the `Equipment` table without a default value. This is not possible if the table is not empty.
  - Added the required column `updatedAt` to the `Equipment` table without a default value. This is not possible if the table is not empty.
  - Added the required column `updatedById` to the `Equipment` table without a default value. This is not possible if the table is not empty.
  - Added the required column `description` to the `JobOrder` table without a default value. This is not possible if the table is not empty.
  - Added the required column `labor` to the `JobOrder` table without a default value. This is not possible if the table is not empty.
  - Added the required column `status` to the `JobOrder` table without a default value. This is not possible if the table is not empty.
  - Added the required column `updatedAt` to the `JobOrder` table without a default value. This is not possible if the table is not empty.
  - Added the required column `updatedById` to the `JobOrder` table without a default value. This is not possible if the table is not empty.
  - Added the required column `amount` to the `OtherIncome` table without a default value. This is not possible if the table is not empty.
  - Added the required column `branchId` to the `OtherIncome` table without a default value. This is not possible if the table is not empty.
  - Added the required column `description` to the `OtherIncome` table without a default value. This is not possible if the table is not empty.
  - Added the required column `updatedAt` to the `OtherIncome` table without a default value. This is not possible if the table is not empty.
  - Added the required column `updatedById` to the `OtherIncome` table without a default value. This is not possible if the table is not empty.
  - Made the column `createdById` on table `role` required. This step will fail if there are existing NULL values in that column.
  - Added the required column `approval` to the `RolePermission` table without a default value. This is not possible if the table is not empty.
  - Added the required column `amount` to the `Transaction` table without a default value. This is not possible if the table is not empty.
  - Added the required column `mop` to the `Transaction` table without a default value. This is not possible if the table is not empty.
  - Added the required column `name` to the `Transaction` table without a default value. This is not possible if the table is not empty.
  - Added the required column `updatedAt` to the `Transaction` table without a default value. This is not possible if the table is not empty.
  - Added the required column `updatedById` to the `Transaction` table without a default value. This is not possible if the table is not empty.

*/
-- DropForeignKey
ALTER TABLE `branchversion` DROP FOREIGN KEY `BranchVersion_branchId_fkey`;

-- DropForeignKey
ALTER TABLE `branchversion` DROP FOREIGN KEY `BranchVersion_updatedById_fkey`;

-- DropForeignKey
ALTER TABLE `contractorpay` DROP FOREIGN KEY `ContractorPay_createdById_fkey`;

-- DropForeignKey
ALTER TABLE `contractorpayversion` DROP FOREIGN KEY `ContractorPayVersion_contractorPayId_fkey`;

-- DropForeignKey
ALTER TABLE `contractorpayversion` DROP FOREIGN KEY `ContractorPayVersion_updatedById_fkey`;

-- DropForeignKey
ALTER TABLE `employeesalary` DROP FOREIGN KEY `EmployeeSalary_createdById_fkey`;

-- DropForeignKey
ALTER TABLE `employeesalaryversion` DROP FOREIGN KEY `EmployeeSalaryVersion_componentId_fkey`;

-- DropForeignKey
ALTER TABLE `employeesalaryversion` DROP FOREIGN KEY `EmployeeSalaryVersion_employeeSalaryId_fkey`;

-- DropForeignKey
ALTER TABLE `employeesalaryversion` DROP FOREIGN KEY `EmployeeSalaryVersion_updatedById_fkey`;

-- DropForeignKey
ALTER TABLE `equipment` DROP FOREIGN KEY `Equipment_createdById_fkey`;

-- DropForeignKey
ALTER TABLE `equipmentversion` DROP FOREIGN KEY `EquipmentVersion_branchId_fkey`;

-- DropForeignKey
ALTER TABLE `equipmentversion` DROP FOREIGN KEY `EquipmentVersion_equipmentId_fkey`;

-- DropForeignKey
ALTER TABLE `equipmentversion` DROP FOREIGN KEY `EquipmentVersion_updatedById_fkey`;

-- DropForeignKey
ALTER TABLE `joborderversion` DROP FOREIGN KEY `JobOrderVersion_jobOrderId_fkey`;

-- DropForeignKey
ALTER TABLE `joborderversion` DROP FOREIGN KEY `JobOrderVersion_updatedById_fkey`;

-- DropForeignKey
ALTER TABLE `otherincome` DROP FOREIGN KEY `OtherIncome_createdById_fkey`;

-- DropForeignKey
ALTER TABLE `otherincomeversion` DROP FOREIGN KEY `OtherIncomeVersion_branchId_fkey`;

-- DropForeignKey
ALTER TABLE `otherincomeversion` DROP FOREIGN KEY `OtherIncomeVersion_otherIncomeId_fkey`;

-- DropForeignKey
ALTER TABLE `otherincomeversion` DROP FOREIGN KEY `OtherIncomeVersion_updatedById_fkey`;

-- DropForeignKey
ALTER TABLE `overheadexpenses` DROP FOREIGN KEY `OverheadExpenses_createdById_fkey`;

-- DropForeignKey
ALTER TABLE `overheadexpensesversion` DROP FOREIGN KEY `OverheadExpensesVersion_branchId_fkey`;

-- DropForeignKey
ALTER TABLE `overheadexpensesversion` DROP FOREIGN KEY `OverheadExpensesVersion_overheadExpensesId_fkey`;

-- DropForeignKey
ALTER TABLE `overheadexpensesversion` DROP FOREIGN KEY `OverheadExpensesVersion_updatedById_fkey`;

-- DropForeignKey
ALTER TABLE `role` DROP FOREIGN KEY `Role_createdById_fkey`;

-- DropForeignKey
ALTER TABLE `transactionversion` DROP FOREIGN KEY `TransactionVersion_transactionId_fkey`;

-- DropForeignKey
ALTER TABLE `transactionversion` DROP FOREIGN KEY `TransactionVersion_updatedById_fkey`;

-- DropForeignKey
ALTER TABLE `userversion` DROP FOREIGN KEY `UserVersion_updatedById_fkey`;

-- DropForeignKey
ALTER TABLE `userversion` DROP FOREIGN KEY `UserVersion_userId_fkey`;

-- DropIndex
DROP INDEX `ContractorPay_createdById_fkey` ON `contractorpay`;

-- DropIndex
DROP INDEX `EmployeeSalary_createdById_fkey` ON `employeesalary`;

-- DropIndex
DROP INDEX `Equipment_createdById_fkey` ON `equipment`;

-- DropIndex
DROP INDEX `OtherIncome_createdById_fkey` ON `otherincome`;

-- DropIndex
DROP INDEX `Role_createdById_fkey` ON `role`;

-- AlterTable
ALTER TABLE `approvallog` DROP COLUMN `moduleVersionId`,
    ADD COLUMN `moduleId` VARCHAR(191) NOT NULL,
    ADD COLUMN `table` ENUM('Dashboard', 'Job Orders', 'Other_Incomes', 'Transactions', 'Revenue and Profit', 'Material Expenses', 'Equipment Expenses', 'Labor Expenses', 'Trucks', 'Activity Logs', 'All Users', 'Roles and Permissions', 'My Profile', 'My Dashboard', 'Assigned Orders', 'My Payout', 'My_Orders', 'My_Transactions', 'My_Trucks', 'My_Salary', 'Profile') NOT NULL,
    MODIFY `module` ENUM('Job Orders', 'Other_Income', 'Transaction', 'Finances - Revenue and Profit', 'Finances - Operational - Material', 'Finances - Operational - Equipment', 'Finances - Operational - Labor', 'Finances - Overhead', 'Trucks', 'Activity Logs', 'Users - All Users', 'Users - Roles and Permissions') NOT NULL;

-- AlterTable
ALTER TABLE `branch` ADD COLUMN `address` VARCHAR(191) NOT NULL,
    ADD COLUMN `approvalStatus` ENUM('pending', 'published', 'rejected') NOT NULL DEFAULT 'published',
    ADD COLUMN `description` VARCHAR(191) NOT NULL,
    ADD COLUMN `name` VARCHAR(100) NOT NULL,
    ADD COLUMN `updatedAt` DATETIME(3) NOT NULL,
    ADD COLUMN `updatedById` VARCHAR(191) NOT NULL;

-- AlterTable
ALTER TABLE `contractorpay` ADD COLUMN `amount` DECIMAL(13, 2) NOT NULL,
    ADD COLUMN `approvalStatus` ENUM('pending', 'published', 'rejected') NOT NULL DEFAULT 'published',
    ADD COLUMN `type` ENUM('regular', 'advance') NOT NULL,
    ADD COLUMN `updatedAt` DATETIME(3) NOT NULL,
    ADD COLUMN `updatedById` VARCHAR(191) NOT NULL;

-- AlterTable
ALTER TABLE `employeesalary` ADD COLUMN `amount` DECIMAL(13, 2) NOT NULL,
    ADD COLUMN `approvalStatus` ENUM('pending', 'published', 'rejected') NOT NULL DEFAULT 'published',
    ADD COLUMN `componentId` VARCHAR(191) NOT NULL,
    ADD COLUMN `type` ENUM('regular', 'advance') NOT NULL DEFAULT 'regular',
    ADD COLUMN `updatedAt` DATETIME(3) NOT NULL,
    ADD COLUMN `updatedById` VARCHAR(191) NOT NULL;

-- AlterTable
ALTER TABLE `equipment` ADD COLUMN `approvalStatus` ENUM('pending', 'published', 'rejected') NOT NULL DEFAULT 'published',
    ADD COLUMN `branchId` VARCHAR(191) NOT NULL,
    ADD COLUMN `name` VARCHAR(100) NOT NULL,
    ADD COLUMN `price` DECIMAL(13, 2) NOT NULL,
    ADD COLUMN `quantity` INTEGER NOT NULL,
    ADD COLUMN `updatedAt` DATETIME(3) NOT NULL,
    ADD COLUMN `updatedById` VARCHAR(191) NOT NULL;

-- AlterTable
ALTER TABLE `joborder` ADD COLUMN `approvalStatus` ENUM('pending', 'published', 'rejected') NOT NULL DEFAULT 'published',
    ADD COLUMN `completedAt` DATETIME(3) NULL,
    ADD COLUMN `description` VARCHAR(191) NOT NULL,
    ADD COLUMN `labor` DECIMAL(13, 2) NOT NULL,
    ADD COLUMN `status` ENUM('unassigned', 'ongoing', 'completed', 'forRelease') NOT NULL,
    ADD COLUMN `updatedAt` DATETIME(3) NOT NULL,
    ADD COLUMN `updatedById` VARCHAR(191) NOT NULL;

-- AlterTable
ALTER TABLE `otherincome` ADD COLUMN `amount` DECIMAL(13, 2) NOT NULL,
    ADD COLUMN `approvalStatus` ENUM('pending', 'published', 'rejected') NOT NULL DEFAULT 'published',
    ADD COLUMN `branchId` VARCHAR(191) NOT NULL,
    ADD COLUMN `description` VARCHAR(191) NOT NULL,
    ADD COLUMN `updatedAt` DATETIME(3) NOT NULL,
    ADD COLUMN `updatedById` VARCHAR(191) NOT NULL;

-- AlterTable
ALTER TABLE `permission` DROP COLUMN `approval`;

-- AlterTable
ALTER TABLE `role` MODIFY `approvalStatus` ENUM('pending', 'published', 'rejected') NOT NULL,
    MODIFY `createdById` VARCHAR(191) NOT NULL;

-- AlterTable
ALTER TABLE `rolepermission` DROP COLUMN `approvalStatus`,
    ADD COLUMN `approval` BOOLEAN NOT NULL;

-- AlterTable
ALTER TABLE `transaction` ADD COLUMN `amount` DECIMAL(13, 2) NOT NULL,
    ADD COLUMN `approvalStatus` ENUM('pending', 'published', 'rejected') NOT NULL DEFAULT 'published',
    ADD COLUMN `mop` VARCHAR(20) NOT NULL,
    ADD COLUMN `name` VARCHAR(100) NOT NULL,
    ADD COLUMN `updatedAt` DATETIME(3) NOT NULL,
    ADD COLUMN `updatedById` VARCHAR(191) NOT NULL;

-- AlterTable
ALTER TABLE `user` ADD COLUMN `approvalStatus` ENUM('pending', 'published', 'rejected') NOT NULL DEFAULT 'published',
    ADD COLUMN `description` VARCHAR(191) NULL,
    ADD COLUMN `email` VARCHAR(100) NULL,
    ADD COLUMN `hashPwd` VARCHAR(255) NULL,
    ADD COLUMN `name` VARCHAR(100) NULL,
    ADD COLUMN `phone` VARCHAR(13) NULL,
    ADD COLUMN `updatedAt` DATETIME(3) NULL,
    ADD COLUMN `updatedById` VARCHAR(191) NULL,
    ADD COLUMN `username` VARCHAR(100) NULL;

-- AlterTable
ALTER TABLE `userrole` MODIFY `approvalStatus` ENUM('pending', 'published', 'rejected') NOT NULL DEFAULT 'published';

-- DropTable
DROP TABLE `branchversion`;

-- DropTable
DROP TABLE `contractorpayversion`;

-- DropTable
DROP TABLE `employeesalaryversion`;

-- DropTable
DROP TABLE `equipmentversion`;

-- DropTable
DROP TABLE `joborderversion`;

-- DropTable
DROP TABLE `otherincomeversion`;

-- DropTable
DROP TABLE `overheadexpenses`;

-- DropTable
DROP TABLE `overheadexpensesversion`;

-- DropTable
DROP TABLE `transactionversion`;

-- DropTable
DROP TABLE `userversion`;

-- CreateTable
CREATE TABLE `UserEdit` (
    `id` VARCHAR(191) NOT NULL,
    `userId` VARCHAR(191) NULL,
    `name` VARCHAR(100) NOT NULL,
    `username` VARCHAR(100) NOT NULL,
    `phone` VARCHAR(13) NULL,
    `email` VARCHAR(100) NOT NULL,
    `hashPwd` VARCHAR(255) NOT NULL,
    `description` VARCHAR(191) NULL,
    `requestType` ENUM('edit', 'delete') NOT NULL,
    `approvalStatus` ENUM('pending', 'published', 'rejected') NOT NULL DEFAULT 'published',
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `createdById` VARCHAR(191) NULL,
    `updatedAt` DATETIME(3) NULL,
    `updatedById` VARCHAR(191) NULL,

    UNIQUE INDEX `UserEdit_username_key`(`username`),
    UNIQUE INDEX `UserEdit_email_key`(`email`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `BranchEdit` (
    `id` VARCHAR(191) NOT NULL,
    `branchId` VARCHAR(191) NOT NULL,
    `name` VARCHAR(100) NOT NULL,
    `description` VARCHAR(191) NOT NULL,
    `address` VARCHAR(191) NOT NULL,
    `requestType` ENUM('edit', 'delete') NOT NULL,
    `approvalStatus` ENUM('pending', 'published', 'rejected') NOT NULL DEFAULT 'published',
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `createdById` VARCHAR(191) NOT NULL,
    `updatedAt` DATETIME(3) NULL,
    `updatedById` VARCHAR(191) NOT NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `ContractorPayEdit` (
    `id` VARCHAR(191) NOT NULL,
    `contractorPayId` VARCHAR(191) NOT NULL,
    `type` ENUM('regular', 'advance') NOT NULL,
    `amount` DECIMAL(13, 2) NOT NULL,
    `requestType` ENUM('edit', 'delete') NOT NULL,
    `approvalStatus` ENUM('pending', 'published', 'rejected') NOT NULL DEFAULT 'published',
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `createdById` VARCHAR(191) NOT NULL,
    `updatedAt` DATETIME(3) NOT NULL,
    `updatedById` VARCHAR(191) NOT NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `EmployeeSalaryEdit` (
    `id` VARCHAR(191) NOT NULL,
    `employeeSalaryId` VARCHAR(191) NOT NULL,
    `componentId` VARCHAR(191) NOT NULL,
    `type` ENUM('regular', 'advance') NOT NULL DEFAULT 'regular',
    `amount` DECIMAL(13, 2) NOT NULL,
    `requestType` ENUM('edit', 'delete') NOT NULL,
    `approvalStatus` ENUM('pending', 'published', 'rejected') NOT NULL DEFAULT 'published',
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `createdById` VARCHAR(191) NOT NULL,
    `updatedAt` DATETIME(3) NOT NULL,
    `updatedById` VARCHAR(191) NOT NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `TransactionEdit` (
    `id` VARCHAR(191) NOT NULL,
    `transactionId` VARCHAR(191) NOT NULL,
    `name` VARCHAR(100) NOT NULL,
    `mop` VARCHAR(20) NOT NULL,
    `amount` DECIMAL(13, 2) NOT NULL,
    `requestType` ENUM('edit', 'delete') NOT NULL,
    `approvalStatus` ENUM('pending', 'published', 'rejected') NOT NULL DEFAULT 'published',
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `createdById` VARCHAR(191) NOT NULL,
    `updatedAt` DATETIME(3) NOT NULL,
    `updatedById` VARCHAR(191) NOT NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `OtherIncomeEdit` (
    `id` VARCHAR(191) NOT NULL,
    `otherIncomeId` VARCHAR(191) NOT NULL,
    `description` VARCHAR(191) NOT NULL,
    `amount` DECIMAL(13, 2) NOT NULL,
    `branchId` VARCHAR(191) NOT NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `createdById` VARCHAR(191) NOT NULL,
    `updatedAt` DATETIME(3) NOT NULL,
    `updatedById` VARCHAR(191) NOT NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `EquipmentEdit` (
    `id` VARCHAR(191) NOT NULL,
    `equipmentId` VARCHAR(191) NOT NULL,
    `name` VARCHAR(100) NOT NULL,
    `quantity` INTEGER NOT NULL,
    `price` DECIMAL(13, 2) NOT NULL,
    `branchId` VARCHAR(191) NOT NULL,
    `requestType` ENUM('edit', 'delete') NOT NULL,
    `approvalStatus` ENUM('pending', 'published', 'rejected') NOT NULL DEFAULT 'published',
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `createdById` VARCHAR(191) NOT NULL,
    `updatedAt` DATETIME(3) NOT NULL,
    `updatedById` VARCHAR(191) NOT NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `JobOrderEdit` (
    `id` VARCHAR(191) NOT NULL,
    `jobOrderId` VARCHAR(191) NOT NULL,
    `jobOrderCode` VARCHAR(191) NOT NULL,
    `branchId` VARCHAR(191) NOT NULL,
    `status` ENUM('unassigned', 'ongoing', 'completed', 'forRelease') NOT NULL,
    `description` VARCHAR(191) NOT NULL,
    `labor` DECIMAL(13, 2) NOT NULL,
    `completedAt` DATETIME(3) NULL,
    `requestType` ENUM('edit', 'delete') NOT NULL,
    `approvalStatus` ENUM('pending', 'published', 'rejected') NOT NULL DEFAULT 'published',
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `createdById` VARCHAR(191) NOT NULL,
    `updatedAt` DATETIME(3) NOT NULL,
    `updatedById` VARCHAR(191) NOT NULL,

    UNIQUE INDEX `JobOrderEdit_jobOrderCode_key`(`jobOrderCode`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `Overhead` (
    `id` VARCHAR(191) NOT NULL,
    `description` VARCHAR(191) NOT NULL,
    `amount` DECIMAL(13, 2) NOT NULL,
    `branchId` VARCHAR(191) NOT NULL,
    `approvalStatus` ENUM('pending', 'published', 'rejected') NOT NULL DEFAULT 'published',
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `createdById` VARCHAR(191) NOT NULL,
    `updatedAt` DATETIME(3) NOT NULL,
    `updatedById` VARCHAR(191) NOT NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `OverheadEdit` (
    `id` VARCHAR(191) NOT NULL,
    `overheadId` VARCHAR(191) NOT NULL,
    `description` VARCHAR(191) NOT NULL,
    `amount` DECIMAL(13, 2) NOT NULL,
    `branchId` VARCHAR(191) NOT NULL,
    `requestType` ENUM('edit', 'delete') NOT NULL,
    `approvalStatus` ENUM('pending', 'published', 'rejected') NOT NULL DEFAULT 'published',
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `createdById` VARCHAR(191) NOT NULL,
    `updatedAt` DATETIME(3) NOT NULL,
    `updatedById` VARCHAR(191) NOT NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateIndex
CREATE UNIQUE INDEX `User_username_key` ON `User`(`username`);

-- CreateIndex
CREATE UNIQUE INDEX `User_email_key` ON `User`(`email`);

-- AddForeignKey
ALTER TABLE `UserEdit` ADD CONSTRAINT `UserEdit_userId_fkey` FOREIGN KEY (`userId`) REFERENCES `User`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `UserEdit` ADD CONSTRAINT `UserEdit_updatedById_fkey` FOREIGN KEY (`updatedById`) REFERENCES `User`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `UserEdit` ADD CONSTRAINT `UserEdit_createdById_fkey` FOREIGN KEY (`createdById`) REFERENCES `User`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Branch` ADD CONSTRAINT `Branch_updatedById_fkey` FOREIGN KEY (`updatedById`) REFERENCES `User`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `BranchEdit` ADD CONSTRAINT `BranchEdit_branchId_fkey` FOREIGN KEY (`branchId`) REFERENCES `Branch`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `BranchEdit` ADD CONSTRAINT `BranchEdit_createdById_fkey` FOREIGN KEY (`createdById`) REFERENCES `User`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `BranchEdit` ADD CONSTRAINT `BranchEdit_updatedById_fkey` FOREIGN KEY (`updatedById`) REFERENCES `User`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `ContractorPay` ADD CONSTRAINT `ContractorPay_createdById_fkey` FOREIGN KEY (`createdById`) REFERENCES `Admin`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `ContractorPay` ADD CONSTRAINT `ContractorPay_updatedById_fkey` FOREIGN KEY (`updatedById`) REFERENCES `Admin`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `ContractorPayEdit` ADD CONSTRAINT `ContractorPayEdit_createdById_fkey` FOREIGN KEY (`createdById`) REFERENCES `Admin`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `ContractorPayEdit` ADD CONSTRAINT `ContractorPayEdit_updatedById_fkey` FOREIGN KEY (`updatedById`) REFERENCES `Admin`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `ContractorPayEdit` ADD CONSTRAINT `ContractorPayEdit_contractorPayId_fkey` FOREIGN KEY (`contractorPayId`) REFERENCES `ContractorPay`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `EmployeeSalary` ADD CONSTRAINT `EmployeeSalary_componentId_fkey` FOREIGN KEY (`componentId`) REFERENCES `PayComponent`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `EmployeeSalary` ADD CONSTRAINT `EmployeeSalary_createdById_fkey` FOREIGN KEY (`createdById`) REFERENCES `Admin`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `EmployeeSalary` ADD CONSTRAINT `EmployeeSalary_updatedById_fkey` FOREIGN KEY (`updatedById`) REFERENCES `Admin`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `EmployeeSalaryEdit` ADD CONSTRAINT `EmployeeSalaryEdit_componentId_fkey` FOREIGN KEY (`componentId`) REFERENCES `PayComponent`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `EmployeeSalaryEdit` ADD CONSTRAINT `EmployeeSalaryEdit_createdById_fkey` FOREIGN KEY (`createdById`) REFERENCES `Admin`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `EmployeeSalaryEdit` ADD CONSTRAINT `EmployeeSalaryEdit_updatedById_fkey` FOREIGN KEY (`updatedById`) REFERENCES `Admin`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `EmployeeSalaryEdit` ADD CONSTRAINT `EmployeeSalaryEdit_employeeSalaryId_fkey` FOREIGN KEY (`employeeSalaryId`) REFERENCES `EmployeeSalary`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Transaction` ADD CONSTRAINT `Transaction_updatedById_fkey` FOREIGN KEY (`updatedById`) REFERENCES `User`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `TransactionEdit` ADD CONSTRAINT `TransactionEdit_transactionId_fkey` FOREIGN KEY (`transactionId`) REFERENCES `Transaction`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `TransactionEdit` ADD CONSTRAINT `TransactionEdit_createdById_fkey` FOREIGN KEY (`createdById`) REFERENCES `User`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `TransactionEdit` ADD CONSTRAINT `TransactionEdit_updatedById_fkey` FOREIGN KEY (`updatedById`) REFERENCES `User`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `OtherIncome` ADD CONSTRAINT `OtherIncome_branchId_fkey` FOREIGN KEY (`branchId`) REFERENCES `Branch`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `OtherIncome` ADD CONSTRAINT `OtherIncome_createdById_fkey` FOREIGN KEY (`createdById`) REFERENCES `Admin`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `OtherIncome` ADD CONSTRAINT `OtherIncome_updatedById_fkey` FOREIGN KEY (`updatedById`) REFERENCES `Admin`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `OtherIncomeEdit` ADD CONSTRAINT `OtherIncomeEdit_branchId_fkey` FOREIGN KEY (`branchId`) REFERENCES `Branch`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `OtherIncomeEdit` ADD CONSTRAINT `OtherIncomeEdit_otherIncomeId_fkey` FOREIGN KEY (`otherIncomeId`) REFERENCES `OtherIncome`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `OtherIncomeEdit` ADD CONSTRAINT `OtherIncomeEdit_createdById_fkey` FOREIGN KEY (`createdById`) REFERENCES `Admin`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `OtherIncomeEdit` ADD CONSTRAINT `OtherIncomeEdit_updatedById_fkey` FOREIGN KEY (`updatedById`) REFERENCES `Admin`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Equipment` ADD CONSTRAINT `Equipment_branchId_fkey` FOREIGN KEY (`branchId`) REFERENCES `Branch`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Equipment` ADD CONSTRAINT `Equipment_createdById_fkey` FOREIGN KEY (`createdById`) REFERENCES `Admin`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Equipment` ADD CONSTRAINT `Equipment_updatedById_fkey` FOREIGN KEY (`updatedById`) REFERENCES `Admin`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `EquipmentEdit` ADD CONSTRAINT `EquipmentEdit_branchId_fkey` FOREIGN KEY (`branchId`) REFERENCES `Branch`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `EquipmentEdit` ADD CONSTRAINT `EquipmentEdit_equipmentId_fkey` FOREIGN KEY (`equipmentId`) REFERENCES `Equipment`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `EquipmentEdit` ADD CONSTRAINT `EquipmentEdit_createdById_fkey` FOREIGN KEY (`createdById`) REFERENCES `Admin`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `EquipmentEdit` ADD CONSTRAINT `EquipmentEdit_updatedById_fkey` FOREIGN KEY (`updatedById`) REFERENCES `Admin`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `JobOrder` ADD CONSTRAINT `JobOrder_updatedById_fkey` FOREIGN KEY (`updatedById`) REFERENCES `User`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `JobOrderEdit` ADD CONSTRAINT `JobOrderEdit_branchId_fkey` FOREIGN KEY (`branchId`) REFERENCES `Branch`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `JobOrderEdit` ADD CONSTRAINT `JobOrderEdit_jobOrderId_fkey` FOREIGN KEY (`jobOrderId`) REFERENCES `JobOrder`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `JobOrderEdit` ADD CONSTRAINT `JobOrderEdit_createdById_fkey` FOREIGN KEY (`createdById`) REFERENCES `User`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `JobOrderEdit` ADD CONSTRAINT `JobOrderEdit_updatedById_fkey` FOREIGN KEY (`updatedById`) REFERENCES `User`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Overhead` ADD CONSTRAINT `Overhead_branchId_fkey` FOREIGN KEY (`branchId`) REFERENCES `Branch`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Overhead` ADD CONSTRAINT `Overhead_createdById_fkey` FOREIGN KEY (`createdById`) REFERENCES `Admin`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Overhead` ADD CONSTRAINT `Overhead_updatedById_fkey` FOREIGN KEY (`updatedById`) REFERENCES `Admin`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `OverheadEdit` ADD CONSTRAINT `OverheadEdit_branchId_fkey` FOREIGN KEY (`branchId`) REFERENCES `Branch`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `OverheadEdit` ADD CONSTRAINT `OverheadEdit_overheadId_fkey` FOREIGN KEY (`overheadId`) REFERENCES `Overhead`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `OverheadEdit` ADD CONSTRAINT `OverheadEdit_createdById_fkey` FOREIGN KEY (`createdById`) REFERENCES `Admin`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `OverheadEdit` ADD CONSTRAINT `OverheadEdit_updatedById_fkey` FOREIGN KEY (`updatedById`) REFERENCES `Admin`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Role` ADD CONSTRAINT `Role_createdById_fkey` FOREIGN KEY (`createdById`) REFERENCES `User`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;
