/*
  Warnings:

  - You are about to drop the column `userId` on the `activitylog` table. All the data in the column will be lost.
  - You are about to drop the column `createdById` on the `branch` table. All the data in the column will be lost.
  - You are about to drop the column `updatedById` on the `branch` table. All the data in the column will be lost.
  - You are about to drop the column `createdById` on the `branchedit` table. All the data in the column will be lost.
  - You are about to drop the column `updatedById` on the `branchedit` table. All the data in the column will be lost.
  - You are about to drop the column `createdById` on the `contractorpay` table. All the data in the column will be lost.
  - You are about to drop the column `updatedById` on the `contractorpay` table. All the data in the column will be lost.
  - You are about to drop the column `createdById` on the `contractorpayedit` table. All the data in the column will be lost.
  - You are about to drop the column `updatedById` on the `contractorpayedit` table. All the data in the column will be lost.
  - You are about to drop the column `createdById` on the `employeesalary` table. All the data in the column will be lost.
  - You are about to drop the column `updatedById` on the `employeesalary` table. All the data in the column will be lost.
  - You are about to drop the column `createdById` on the `employeesalaryedit` table. All the data in the column will be lost.
  - You are about to drop the column `updatedById` on the `employeesalaryedit` table. All the data in the column will be lost.
  - You are about to drop the column `createdById` on the `equipment` table. All the data in the column will be lost.
  - You are about to drop the column `updatedById` on the `equipment` table. All the data in the column will be lost.
  - You are about to drop the column `createdById` on the `equipmentedit` table. All the data in the column will be lost.
  - You are about to drop the column `updatedById` on the `equipmentedit` table. All the data in the column will be lost.
  - You are about to drop the column `createdById` on the `joborder` table. All the data in the column will be lost.
  - You are about to drop the column `updatedById` on the `joborder` table. All the data in the column will be lost.
  - You are about to drop the column `createdById` on the `joborderedit` table. All the data in the column will be lost.
  - You are about to drop the column `updatedById` on the `joborderedit` table. All the data in the column will be lost.
  - You are about to drop the column `createdById` on the `otherincome` table. All the data in the column will be lost.
  - You are about to drop the column `updatedById` on the `otherincome` table. All the data in the column will be lost.
  - You are about to drop the column `createdById` on the `otherincomeedit` table. All the data in the column will be lost.
  - You are about to drop the column `updatedById` on the `otherincomeedit` table. All the data in the column will be lost.
  - You are about to drop the column `createdById` on the `overhead` table. All the data in the column will be lost.
  - You are about to drop the column `updatedById` on the `overhead` table. All the data in the column will be lost.
  - You are about to drop the column `createdById` on the `overheadedit` table. All the data in the column will be lost.
  - You are about to drop the column `updatedById` on the `overheadedit` table. All the data in the column will be lost.
  - You are about to drop the column `createdById` on the `role` table. All the data in the column will be lost.
  - You are about to drop the column `createdById` on the `transaction` table. All the data in the column will be lost.
  - You are about to drop the column `updatedById` on the `transaction` table. All the data in the column will be lost.
  - You are about to drop the column `createdById` on the `transactionedit` table. All the data in the column will be lost.
  - You are about to drop the column `updatedById` on the `transactionedit` table. All the data in the column will be lost.
  - You are about to drop the column `createdById` on the `truck` table. All the data in the column will be lost.
  - You are about to drop the column `transferredById` on the `truckownership` table. All the data in the column will be lost.
  - You are about to drop the column `createdById` on the `user` table. All the data in the column will be lost.
  - You are about to drop the column `createdById` on the `useredit` table. All the data in the column will be lost.
  - You are about to drop the column `updatedById` on the `useredit` table. All the data in the column will be lost.
  - Added the required column `userName` to the `ActivityLog` table without a default value. This is not possible if the table is not empty.
  - Added the required column `createdByUser` to the `Branch` table without a default value. This is not possible if the table is not empty.
  - Added the required column `updatedByUser` to the `Branch` table without a default value. This is not possible if the table is not empty.
  - Added the required column `createdByUser` to the `BranchEdit` table without a default value. This is not possible if the table is not empty.
  - Added the required column `updatedByUser` to the `BranchEdit` table without a default value. This is not possible if the table is not empty.
  - Added the required column `createdByUser` to the `ContractorPay` table without a default value. This is not possible if the table is not empty.
  - Added the required column `updatedByUser` to the `ContractorPay` table without a default value. This is not possible if the table is not empty.
  - Added the required column `createdByUser` to the `ContractorPayEdit` table without a default value. This is not possible if the table is not empty.
  - Added the required column `updatedByUser` to the `ContractorPayEdit` table without a default value. This is not possible if the table is not empty.
  - Added the required column `createdByUser` to the `EmployeeSalary` table without a default value. This is not possible if the table is not empty.
  - Added the required column `updatedByUser` to the `EmployeeSalary` table without a default value. This is not possible if the table is not empty.
  - Added the required column `createdByUser` to the `EmployeeSalaryEdit` table without a default value. This is not possible if the table is not empty.
  - Added the required column `updatedByUser` to the `EmployeeSalaryEdit` table without a default value. This is not possible if the table is not empty.
  - Added the required column `createdByUser` to the `Equipment` table without a default value. This is not possible if the table is not empty.
  - Added the required column `updatedByUser` to the `Equipment` table without a default value. This is not possible if the table is not empty.
  - Added the required column `createdByUser` to the `EquipmentEdit` table without a default value. This is not possible if the table is not empty.
  - Added the required column `updatedByUser` to the `EquipmentEdit` table without a default value. This is not possible if the table is not empty.
  - Added the required column `createdByUser` to the `JobOrder` table without a default value. This is not possible if the table is not empty.
  - Added the required column `updatedByUser` to the `JobOrder` table without a default value. This is not possible if the table is not empty.
  - Added the required column `createdByUser` to the `JobOrderEdit` table without a default value. This is not possible if the table is not empty.
  - Added the required column `updatedByUser` to the `JobOrderEdit` table without a default value. This is not possible if the table is not empty.
  - Added the required column `createdByUser` to the `OtherIncome` table without a default value. This is not possible if the table is not empty.
  - Added the required column `updatedByUser` to the `OtherIncome` table without a default value. This is not possible if the table is not empty.
  - Added the required column `createdByUser` to the `OtherIncomeEdit` table without a default value. This is not possible if the table is not empty.
  - Added the required column `updatedByUser` to the `OtherIncomeEdit` table without a default value. This is not possible if the table is not empty.
  - Added the required column `createdByUser` to the `Overhead` table without a default value. This is not possible if the table is not empty.
  - Added the required column `updatedByUser` to the `Overhead` table without a default value. This is not possible if the table is not empty.
  - Added the required column `createdByUser` to the `OverheadEdit` table without a default value. This is not possible if the table is not empty.
  - Added the required column `updatedByUser` to the `OverheadEdit` table without a default value. This is not possible if the table is not empty.
  - Added the required column `createdByUser` to the `Transaction` table without a default value. This is not possible if the table is not empty.
  - Added the required column `updatedByUser` to the `Transaction` table without a default value. This is not possible if the table is not empty.
  - Added the required column `createdByUser` to the `TransactionEdit` table without a default value. This is not possible if the table is not empty.
  - Added the required column `updatedByUser` to the `TransactionEdit` table without a default value. This is not possible if the table is not empty.
  - Added the required column `createdByUser` to the `Truck` table without a default value. This is not possible if the table is not empty.
  - Added the required column `transferredByUser` to the `TruckOwnership` table without a default value. This is not possible if the table is not empty.

*/
-- DropForeignKey
ALTER TABLE `activitylog` DROP FOREIGN KEY `ActivityLog_userId_fkey`;

-- DropForeignKey
ALTER TABLE `admin` DROP FOREIGN KEY `Admin_userId_fkey`;

-- DropForeignKey
ALTER TABLE `branch` DROP FOREIGN KEY `Branch_createdById_fkey`;

-- DropForeignKey
ALTER TABLE `branch` DROP FOREIGN KEY `Branch_updatedById_fkey`;

-- DropForeignKey
ALTER TABLE `branchedit` DROP FOREIGN KEY `BranchEdit_createdById_fkey`;

-- DropForeignKey
ALTER TABLE `branchedit` DROP FOREIGN KEY `BranchEdit_updatedById_fkey`;

-- DropForeignKey
ALTER TABLE `contractor` DROP FOREIGN KEY `Contractor_userId_fkey`;

-- DropForeignKey
ALTER TABLE `contractorpay` DROP FOREIGN KEY `ContractorPay_createdById_fkey`;

-- DropForeignKey
ALTER TABLE `contractorpay` DROP FOREIGN KEY `ContractorPay_updatedById_fkey`;

-- DropForeignKey
ALTER TABLE `contractorpayedit` DROP FOREIGN KEY `ContractorPayEdit_createdById_fkey`;

-- DropForeignKey
ALTER TABLE `contractorpayedit` DROP FOREIGN KEY `ContractorPayEdit_updatedById_fkey`;

-- DropForeignKey
ALTER TABLE `customer` DROP FOREIGN KEY `Customer_userId_fkey`;

-- DropForeignKey
ALTER TABLE `employee` DROP FOREIGN KEY `Employee_userId_fkey`;

-- DropForeignKey
ALTER TABLE `employeesalary` DROP FOREIGN KEY `EmployeeSalary_createdById_fkey`;

-- DropForeignKey
ALTER TABLE `employeesalary` DROP FOREIGN KEY `EmployeeSalary_updatedById_fkey`;

-- DropForeignKey
ALTER TABLE `employeesalaryedit` DROP FOREIGN KEY `EmployeeSalaryEdit_createdById_fkey`;

-- DropForeignKey
ALTER TABLE `employeesalaryedit` DROP FOREIGN KEY `EmployeeSalaryEdit_updatedById_fkey`;

-- DropForeignKey
ALTER TABLE `equipment` DROP FOREIGN KEY `Equipment_createdById_fkey`;

-- DropForeignKey
ALTER TABLE `equipment` DROP FOREIGN KEY `Equipment_updatedById_fkey`;

-- DropForeignKey
ALTER TABLE `equipmentedit` DROP FOREIGN KEY `EquipmentEdit_createdById_fkey`;

-- DropForeignKey
ALTER TABLE `equipmentedit` DROP FOREIGN KEY `EquipmentEdit_updatedById_fkey`;

-- DropForeignKey
ALTER TABLE `joborder` DROP FOREIGN KEY `JobOrder_createdById_fkey`;

-- DropForeignKey
ALTER TABLE `joborder` DROP FOREIGN KEY `JobOrder_updatedById_fkey`;

-- DropForeignKey
ALTER TABLE `joborderedit` DROP FOREIGN KEY `JobOrderEdit_createdById_fkey`;

-- DropForeignKey
ALTER TABLE `joborderedit` DROP FOREIGN KEY `JobOrderEdit_updatedById_fkey`;

-- DropForeignKey
ALTER TABLE `otherincome` DROP FOREIGN KEY `OtherIncome_createdById_fkey`;

-- DropForeignKey
ALTER TABLE `otherincome` DROP FOREIGN KEY `OtherIncome_updatedById_fkey`;

-- DropForeignKey
ALTER TABLE `otherincomeedit` DROP FOREIGN KEY `OtherIncomeEdit_createdById_fkey`;

-- DropForeignKey
ALTER TABLE `otherincomeedit` DROP FOREIGN KEY `OtherIncomeEdit_updatedById_fkey`;

-- DropForeignKey
ALTER TABLE `overhead` DROP FOREIGN KEY `Overhead_createdById_fkey`;

-- DropForeignKey
ALTER TABLE `overhead` DROP FOREIGN KEY `Overhead_updatedById_fkey`;

-- DropForeignKey
ALTER TABLE `overheadedit` DROP FOREIGN KEY `OverheadEdit_createdById_fkey`;

-- DropForeignKey
ALTER TABLE `overheadedit` DROP FOREIGN KEY `OverheadEdit_updatedById_fkey`;

-- DropForeignKey
ALTER TABLE `role` DROP FOREIGN KEY `Role_baseRoleId_fkey`;

-- DropForeignKey
ALTER TABLE `role` DROP FOREIGN KEY `Role_createdById_fkey`;

-- DropForeignKey
ALTER TABLE `rolepermission` DROP FOREIGN KEY `RolePermission_permissionId_fkey`;

-- DropForeignKey
ALTER TABLE `rolepermission` DROP FOREIGN KEY `RolePermission_roleId_fkey`;

-- DropForeignKey
ALTER TABLE `transaction` DROP FOREIGN KEY `Transaction_createdById_fkey`;

-- DropForeignKey
ALTER TABLE `transaction` DROP FOREIGN KEY `Transaction_updatedById_fkey`;

-- DropForeignKey
ALTER TABLE `transactionedit` DROP FOREIGN KEY `TransactionEdit_createdById_fkey`;

-- DropForeignKey
ALTER TABLE `transactionedit` DROP FOREIGN KEY `TransactionEdit_updatedById_fkey`;

-- DropForeignKey
ALTER TABLE `truck` DROP FOREIGN KEY `Truck_createdById_fkey`;

-- DropForeignKey
ALTER TABLE `truckownership` DROP FOREIGN KEY `TruckOwnership_transferredById_fkey`;

-- DropForeignKey
ALTER TABLE `user` DROP FOREIGN KEY `User_createdById_fkey`;

-- DropForeignKey
ALTER TABLE `useredit` DROP FOREIGN KEY `UserEdit_createdById_fkey`;

-- DropForeignKey
ALTER TABLE `useredit` DROP FOREIGN KEY `UserEdit_updatedById_fkey`;

-- DropForeignKey
ALTER TABLE `useredit` DROP FOREIGN KEY `UserEdit_userId_fkey`;

-- DropForeignKey
ALTER TABLE `userrole` DROP FOREIGN KEY `UserRole_roleId_fkey`;

-- DropForeignKey
ALTER TABLE `userrole` DROP FOREIGN KEY `UserRole_userId_fkey`;

-- DropForeignKey
ALTER TABLE `userroleedit` DROP FOREIGN KEY `UserRoleEdit_roleId_fkey`;

-- DropForeignKey
ALTER TABLE `userroleedit` DROP FOREIGN KEY `UserRoleEdit_userEditId_fkey`;

-- DropIndex
DROP INDEX `ActivityLog_userId_fkey` ON `activitylog`;

-- DropIndex
DROP INDEX `Admin_userId_fkey` ON `admin`;

-- DropIndex
DROP INDEX `Branch_createdById_fkey` ON `branch`;

-- DropIndex
DROP INDEX `Branch_updatedById_fkey` ON `branch`;

-- DropIndex
DROP INDEX `BranchEdit_createdById_fkey` ON `branchedit`;

-- DropIndex
DROP INDEX `BranchEdit_updatedById_fkey` ON `branchedit`;

-- DropIndex
DROP INDEX `Contractor_userId_fkey` ON `contractor`;

-- DropIndex
DROP INDEX `ContractorPay_createdById_fkey` ON `contractorpay`;

-- DropIndex
DROP INDEX `ContractorPay_updatedById_fkey` ON `contractorpay`;

-- DropIndex
DROP INDEX `ContractorPayEdit_createdById_fkey` ON `contractorpayedit`;

-- DropIndex
DROP INDEX `ContractorPayEdit_updatedById_fkey` ON `contractorpayedit`;

-- DropIndex
DROP INDEX `Customer_userId_fkey` ON `customer`;

-- DropIndex
DROP INDEX `Employee_userId_fkey` ON `employee`;

-- DropIndex
DROP INDEX `EmployeeSalary_createdById_fkey` ON `employeesalary`;

-- DropIndex
DROP INDEX `EmployeeSalary_updatedById_fkey` ON `employeesalary`;

-- DropIndex
DROP INDEX `EmployeeSalaryEdit_createdById_fkey` ON `employeesalaryedit`;

-- DropIndex
DROP INDEX `EmployeeSalaryEdit_updatedById_fkey` ON `employeesalaryedit`;

-- DropIndex
DROP INDEX `Equipment_createdById_fkey` ON `equipment`;

-- DropIndex
DROP INDEX `Equipment_updatedById_fkey` ON `equipment`;

-- DropIndex
DROP INDEX `EquipmentEdit_createdById_fkey` ON `equipmentedit`;

-- DropIndex
DROP INDEX `EquipmentEdit_updatedById_fkey` ON `equipmentedit`;

-- DropIndex
DROP INDEX `JobOrder_createdById_fkey` ON `joborder`;

-- DropIndex
DROP INDEX `JobOrder_updatedById_fkey` ON `joborder`;

-- DropIndex
DROP INDEX `JobOrderEdit_createdById_fkey` ON `joborderedit`;

-- DropIndex
DROP INDEX `JobOrderEdit_updatedById_fkey` ON `joborderedit`;

-- DropIndex
DROP INDEX `OtherIncome_createdById_fkey` ON `otherincome`;

-- DropIndex
DROP INDEX `OtherIncome_updatedById_fkey` ON `otherincome`;

-- DropIndex
DROP INDEX `OtherIncomeEdit_createdById_fkey` ON `otherincomeedit`;

-- DropIndex
DROP INDEX `OtherIncomeEdit_updatedById_fkey` ON `otherincomeedit`;

-- DropIndex
DROP INDEX `Overhead_createdById_fkey` ON `overhead`;

-- DropIndex
DROP INDEX `Overhead_updatedById_fkey` ON `overhead`;

-- DropIndex
DROP INDEX `OverheadEdit_createdById_fkey` ON `overheadedit`;

-- DropIndex
DROP INDEX `OverheadEdit_updatedById_fkey` ON `overheadedit`;

-- DropIndex
DROP INDEX `Role_baseRoleId_fkey` ON `role`;

-- DropIndex
DROP INDEX `Role_createdById_fkey` ON `role`;

-- DropIndex
DROP INDEX `RolePermission_permissionId_fkey` ON `rolepermission`;

-- DropIndex
DROP INDEX `Transaction_createdById_fkey` ON `transaction`;

-- DropIndex
DROP INDEX `Transaction_updatedById_fkey` ON `transaction`;

-- DropIndex
DROP INDEX `TransactionEdit_createdById_fkey` ON `transactionedit`;

-- DropIndex
DROP INDEX `TransactionEdit_updatedById_fkey` ON `transactionedit`;

-- DropIndex
DROP INDEX `Truck_createdById_fkey` ON `truck`;

-- DropIndex
DROP INDEX `TruckOwnership_transferredById_fkey` ON `truckownership`;

-- DropIndex
DROP INDEX `User_createdById_fkey` ON `user`;

-- DropIndex
DROP INDEX `UserEdit_createdById_fkey` ON `useredit`;

-- DropIndex
DROP INDEX `UserEdit_updatedById_fkey` ON `useredit`;

-- DropIndex
DROP INDEX `UserEdit_userId_fkey` ON `useredit`;

-- DropIndex
DROP INDEX `UserRole_roleId_fkey` ON `userrole`;

-- DropIndex
DROP INDEX `UserRoleEdit_roleId_fkey` ON `userroleedit`;

-- AlterTable
ALTER TABLE `activitylog` DROP COLUMN `userId`,
    ADD COLUMN `userName` VARCHAR(191) NOT NULL;

-- AlterTable
ALTER TABLE `branch` DROP COLUMN `createdById`,
    DROP COLUMN `updatedById`,
    ADD COLUMN `createdByUser` VARCHAR(191) NOT NULL,
    ADD COLUMN `updatedByUser` VARCHAR(191) NOT NULL;

-- AlterTable
ALTER TABLE `branchedit` DROP COLUMN `createdById`,
    DROP COLUMN `updatedById`,
    ADD COLUMN `createdByUser` VARCHAR(191) NOT NULL,
    ADD COLUMN `updatedByUser` VARCHAR(191) NOT NULL;

-- AlterTable
ALTER TABLE `contractorpay` DROP COLUMN `createdById`,
    DROP COLUMN `updatedById`,
    ADD COLUMN `createdByUser` VARCHAR(191) NOT NULL,
    ADD COLUMN `updatedByUser` VARCHAR(191) NOT NULL;

-- AlterTable
ALTER TABLE `contractorpayedit` DROP COLUMN `createdById`,
    DROP COLUMN `updatedById`,
    ADD COLUMN `createdByUser` VARCHAR(191) NOT NULL,
    ADD COLUMN `updatedByUser` VARCHAR(191) NOT NULL;

-- AlterTable
ALTER TABLE `employeesalary` DROP COLUMN `createdById`,
    DROP COLUMN `updatedById`,
    ADD COLUMN `createdByUser` VARCHAR(191) NOT NULL,
    ADD COLUMN `updatedByUser` VARCHAR(191) NOT NULL;

-- AlterTable
ALTER TABLE `employeesalaryedit` DROP COLUMN `createdById`,
    DROP COLUMN `updatedById`,
    ADD COLUMN `createdByUser` VARCHAR(191) NOT NULL,
    ADD COLUMN `updatedByUser` VARCHAR(191) NOT NULL;

-- AlterTable
ALTER TABLE `equipment` DROP COLUMN `createdById`,
    DROP COLUMN `updatedById`,
    ADD COLUMN `createdByUser` VARCHAR(191) NOT NULL,
    ADD COLUMN `updatedByUser` VARCHAR(191) NOT NULL;

-- AlterTable
ALTER TABLE `equipmentedit` DROP COLUMN `createdById`,
    DROP COLUMN `updatedById`,
    ADD COLUMN `createdByUser` VARCHAR(191) NOT NULL,
    ADD COLUMN `updatedByUser` VARCHAR(191) NOT NULL;

-- AlterTable
ALTER TABLE `joborder` DROP COLUMN `createdById`,
    DROP COLUMN `updatedById`,
    ADD COLUMN `createdByUser` VARCHAR(191) NOT NULL,
    ADD COLUMN `updatedByUser` VARCHAR(191) NOT NULL;

-- AlterTable
ALTER TABLE `joborderedit` DROP COLUMN `createdById`,
    DROP COLUMN `updatedById`,
    ADD COLUMN `createdByUser` VARCHAR(191) NOT NULL,
    ADD COLUMN `updatedByUser` VARCHAR(191) NOT NULL;

-- AlterTable
ALTER TABLE `otherincome` DROP COLUMN `createdById`,
    DROP COLUMN `updatedById`,
    ADD COLUMN `createdByUser` VARCHAR(191) NOT NULL,
    ADD COLUMN `updatedByUser` VARCHAR(191) NOT NULL;

-- AlterTable
ALTER TABLE `otherincomeedit` DROP COLUMN `createdById`,
    DROP COLUMN `updatedById`,
    ADD COLUMN `createdByUser` VARCHAR(191) NOT NULL,
    ADD COLUMN `updatedByUser` VARCHAR(191) NOT NULL;

-- AlterTable
ALTER TABLE `overhead` DROP COLUMN `createdById`,
    DROP COLUMN `updatedById`,
    ADD COLUMN `createdByUser` VARCHAR(191) NOT NULL,
    ADD COLUMN `updatedByUser` VARCHAR(191) NOT NULL;

-- AlterTable
ALTER TABLE `overheadedit` DROP COLUMN `createdById`,
    DROP COLUMN `updatedById`,
    ADD COLUMN `createdByUser` VARCHAR(191) NOT NULL,
    ADD COLUMN `updatedByUser` VARCHAR(191) NOT NULL;

-- AlterTable
ALTER TABLE `role` DROP COLUMN `createdById`,
    ADD COLUMN `createdByUser` VARCHAR(191) NULL;

-- AlterTable
ALTER TABLE `transaction` DROP COLUMN `createdById`,
    DROP COLUMN `updatedById`,
    ADD COLUMN `createdByUser` VARCHAR(191) NOT NULL,
    ADD COLUMN `updatedByUser` VARCHAR(191) NOT NULL;

-- AlterTable
ALTER TABLE `transactionedit` DROP COLUMN `createdById`,
    DROP COLUMN `updatedById`,
    ADD COLUMN `createdByUser` VARCHAR(191) NOT NULL,
    ADD COLUMN `updatedByUser` VARCHAR(191) NOT NULL;

-- AlterTable
ALTER TABLE `truck` DROP COLUMN `createdById`,
    ADD COLUMN `createdByUser` VARCHAR(191) NOT NULL;

-- AlterTable
ALTER TABLE `truckownership` DROP COLUMN `transferredById`,
    ADD COLUMN `transferredByUser` VARCHAR(191) NOT NULL;

-- AlterTable
ALTER TABLE `user` DROP COLUMN `createdById`,
    ADD COLUMN `createdByUser` VARCHAR(191) NULL;

-- AlterTable
ALTER TABLE `useredit` DROP COLUMN `createdById`,
    DROP COLUMN `updatedById`,
    ADD COLUMN `createdByUser` VARCHAR(191) NULL,
    ADD COLUMN `updatedByUser` VARCHAR(191) NULL;

-- AlterTable
ALTER TABLE `userroleedit` MODIFY `userEditId` VARCHAR(191) NULL;

-- AddForeignKey
ALTER TABLE `User` ADD CONSTRAINT `User_createdByUser_fkey` FOREIGN KEY (`createdByUser`) REFERENCES `User`(`username`) ON DELETE NO ACTION ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `UserEdit` ADD CONSTRAINT `UserEdit_userId_fkey` FOREIGN KEY (`userId`) REFERENCES `User`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `UserEdit` ADD CONSTRAINT `UserEdit_updatedByUser_fkey` FOREIGN KEY (`updatedByUser`) REFERENCES `User`(`username`) ON DELETE NO ACTION ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `UserEdit` ADD CONSTRAINT `UserEdit_createdByUser_fkey` FOREIGN KEY (`createdByUser`) REFERENCES `User`(`username`) ON DELETE NO ACTION ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Admin` ADD CONSTRAINT `Admin_userId_fkey` FOREIGN KEY (`userId`) REFERENCES `User`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Customer` ADD CONSTRAINT `Customer_userId_fkey` FOREIGN KEY (`userId`) REFERENCES `User`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Contractor` ADD CONSTRAINT `Contractor_userId_fkey` FOREIGN KEY (`userId`) REFERENCES `User`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Employee` ADD CONSTRAINT `Employee_userId_fkey` FOREIGN KEY (`userId`) REFERENCES `User`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Branch` ADD CONSTRAINT `Branch_createdByUser_fkey` FOREIGN KEY (`createdByUser`) REFERENCES `User`(`username`) ON DELETE NO ACTION ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Branch` ADD CONSTRAINT `Branch_updatedByUser_fkey` FOREIGN KEY (`updatedByUser`) REFERENCES `User`(`username`) ON DELETE NO ACTION ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `BranchEdit` ADD CONSTRAINT `BranchEdit_createdByUser_fkey` FOREIGN KEY (`createdByUser`) REFERENCES `User`(`username`) ON DELETE NO ACTION ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `BranchEdit` ADD CONSTRAINT `BranchEdit_updatedByUser_fkey` FOREIGN KEY (`updatedByUser`) REFERENCES `User`(`username`) ON DELETE NO ACTION ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Truck` ADD CONSTRAINT `Truck_createdByUser_fkey` FOREIGN KEY (`createdByUser`) REFERENCES `User`(`username`) ON DELETE NO ACTION ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `TruckOwnership` ADD CONSTRAINT `TruckOwnership_transferredByUser_fkey` FOREIGN KEY (`transferredByUser`) REFERENCES `User`(`username`) ON DELETE NO ACTION ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `ContractorPay` ADD CONSTRAINT `ContractorPay_createdByUser_fkey` FOREIGN KEY (`createdByUser`) REFERENCES `User`(`username`) ON DELETE NO ACTION ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `ContractorPay` ADD CONSTRAINT `ContractorPay_updatedByUser_fkey` FOREIGN KEY (`updatedByUser`) REFERENCES `User`(`username`) ON DELETE NO ACTION ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `ContractorPayEdit` ADD CONSTRAINT `ContractorPayEdit_createdByUser_fkey` FOREIGN KEY (`createdByUser`) REFERENCES `User`(`username`) ON DELETE NO ACTION ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `ContractorPayEdit` ADD CONSTRAINT `ContractorPayEdit_updatedByUser_fkey` FOREIGN KEY (`updatedByUser`) REFERENCES `User`(`username`) ON DELETE NO ACTION ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `EmployeeSalary` ADD CONSTRAINT `EmployeeSalary_createdByUser_fkey` FOREIGN KEY (`createdByUser`) REFERENCES `User`(`username`) ON DELETE NO ACTION ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `EmployeeSalary` ADD CONSTRAINT `EmployeeSalary_updatedByUser_fkey` FOREIGN KEY (`updatedByUser`) REFERENCES `User`(`username`) ON DELETE NO ACTION ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `EmployeeSalaryEdit` ADD CONSTRAINT `EmployeeSalaryEdit_createdByUser_fkey` FOREIGN KEY (`createdByUser`) REFERENCES `User`(`username`) ON DELETE NO ACTION ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `EmployeeSalaryEdit` ADD CONSTRAINT `EmployeeSalaryEdit_updatedByUser_fkey` FOREIGN KEY (`updatedByUser`) REFERENCES `User`(`username`) ON DELETE NO ACTION ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `ActivityLog` ADD CONSTRAINT `ActivityLog_userName_fkey` FOREIGN KEY (`userName`) REFERENCES `User`(`id`) ON DELETE NO ACTION ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Transaction` ADD CONSTRAINT `Transaction_createdByUser_fkey` FOREIGN KEY (`createdByUser`) REFERENCES `User`(`username`) ON DELETE NO ACTION ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Transaction` ADD CONSTRAINT `Transaction_updatedByUser_fkey` FOREIGN KEY (`updatedByUser`) REFERENCES `User`(`username`) ON DELETE NO ACTION ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `TransactionEdit` ADD CONSTRAINT `TransactionEdit_createdByUser_fkey` FOREIGN KEY (`createdByUser`) REFERENCES `User`(`username`) ON DELETE NO ACTION ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `TransactionEdit` ADD CONSTRAINT `TransactionEdit_updatedByUser_fkey` FOREIGN KEY (`updatedByUser`) REFERENCES `User`(`username`) ON DELETE NO ACTION ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `OtherIncome` ADD CONSTRAINT `OtherIncome_createdByUser_fkey` FOREIGN KEY (`createdByUser`) REFERENCES `User`(`username`) ON DELETE NO ACTION ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `OtherIncome` ADD CONSTRAINT `OtherIncome_updatedByUser_fkey` FOREIGN KEY (`updatedByUser`) REFERENCES `User`(`username`) ON DELETE NO ACTION ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `OtherIncomeEdit` ADD CONSTRAINT `OtherIncomeEdit_createdByUser_fkey` FOREIGN KEY (`createdByUser`) REFERENCES `User`(`username`) ON DELETE NO ACTION ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `OtherIncomeEdit` ADD CONSTRAINT `OtherIncomeEdit_updatedByUser_fkey` FOREIGN KEY (`updatedByUser`) REFERENCES `User`(`username`) ON DELETE NO ACTION ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Equipment` ADD CONSTRAINT `Equipment_createdByUser_fkey` FOREIGN KEY (`createdByUser`) REFERENCES `User`(`username`) ON DELETE NO ACTION ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Equipment` ADD CONSTRAINT `Equipment_updatedByUser_fkey` FOREIGN KEY (`updatedByUser`) REFERENCES `User`(`username`) ON DELETE NO ACTION ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `EquipmentEdit` ADD CONSTRAINT `EquipmentEdit_createdByUser_fkey` FOREIGN KEY (`createdByUser`) REFERENCES `User`(`username`) ON DELETE NO ACTION ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `EquipmentEdit` ADD CONSTRAINT `EquipmentEdit_updatedByUser_fkey` FOREIGN KEY (`updatedByUser`) REFERENCES `User`(`username`) ON DELETE NO ACTION ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `JobOrder` ADD CONSTRAINT `JobOrder_createdByUser_fkey` FOREIGN KEY (`createdByUser`) REFERENCES `User`(`username`) ON DELETE NO ACTION ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `JobOrder` ADD CONSTRAINT `JobOrder_updatedByUser_fkey` FOREIGN KEY (`updatedByUser`) REFERENCES `User`(`username`) ON DELETE NO ACTION ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `JobOrderEdit` ADD CONSTRAINT `JobOrderEdit_createdByUser_fkey` FOREIGN KEY (`createdByUser`) REFERENCES `User`(`username`) ON DELETE NO ACTION ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `JobOrderEdit` ADD CONSTRAINT `JobOrderEdit_updatedByUser_fkey` FOREIGN KEY (`updatedByUser`) REFERENCES `User`(`username`) ON DELETE NO ACTION ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Overhead` ADD CONSTRAINT `Overhead_createdByUser_fkey` FOREIGN KEY (`createdByUser`) REFERENCES `User`(`username`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Overhead` ADD CONSTRAINT `Overhead_updatedByUser_fkey` FOREIGN KEY (`updatedByUser`) REFERENCES `User`(`username`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `OverheadEdit` ADD CONSTRAINT `OverheadEdit_createdByUser_fkey` FOREIGN KEY (`createdByUser`) REFERENCES `User`(`username`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `OverheadEdit` ADD CONSTRAINT `OverheadEdit_updatedByUser_fkey` FOREIGN KEY (`updatedByUser`) REFERENCES `User`(`username`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `UserRole` ADD CONSTRAINT `UserRole_userId_fkey` FOREIGN KEY (`userId`) REFERENCES `User`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `UserRole` ADD CONSTRAINT `UserRole_roleId_fkey` FOREIGN KEY (`roleId`) REFERENCES `Role`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `UserRoleEdit` ADD CONSTRAINT `UserRoleEdit_userEditId_fkey` FOREIGN KEY (`userEditId`) REFERENCES `UserEdit`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `UserRoleEdit` ADD CONSTRAINT `UserRoleEdit_roleId_fkey` FOREIGN KEY (`roleId`) REFERENCES `Role`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Role` ADD CONSTRAINT `Role_baseRoleId_fkey` FOREIGN KEY (`baseRoleId`) REFERENCES `Role`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Role` ADD CONSTRAINT `Role_createdByUser_fkey` FOREIGN KEY (`createdByUser`) REFERENCES `User`(`username`) ON DELETE NO ACTION ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `RolePermission` ADD CONSTRAINT `RolePermission_roleId_fkey` FOREIGN KEY (`roleId`) REFERENCES `Role`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `RolePermission` ADD CONSTRAINT `RolePermission_permissionId_fkey` FOREIGN KEY (`permissionId`) REFERENCES `Permission`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;
