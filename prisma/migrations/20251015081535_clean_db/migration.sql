/*
  Warnings:

  - You are about to drop the column `versionNumber` on the `approvallog` table. All the data in the column will be lost.
  - The values [archive] on the enum `joborder_status` will be removed. If these variants are still used in the database, this will fail.
  - You are about to drop the `branchedit` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `contractorpayedit` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `employeesalary` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `employeesalaryedit` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `equipmentedit` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `joborderedit` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `materialedit` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `otherincomeedit` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `overheadedit` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `transactioneditz` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `transactionz` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `truckedit` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `truckownershipedit` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `userbranchedit` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `useredit` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `userroleedit` table. If the table is not empty, all the data it contains will be lost.
  - Made the column `branchId` on table `contractorpay` required. This step will fail if there are existing NULL values in that column.
  - Made the column `branchId` on table `employeepay` required. This step will fail if there are existing NULL values in that column.

*/
-- DropForeignKey
ALTER TABLE `branchedit` DROP FOREIGN KEY `branchedit_branchId_fkey`;

-- DropForeignKey
ALTER TABLE `branchedit` DROP FOREIGN KEY `branchedit_createdByUser_fkey`;

-- DropForeignKey
ALTER TABLE `branchedit` DROP FOREIGN KEY `branchedit_updatedByUser_fkey`;

-- DropForeignKey
ALTER TABLE `contractorpay` DROP FOREIGN KEY `contractorpay_branchId_fkey`;

-- DropForeignKey
ALTER TABLE `contractorpayedit` DROP FOREIGN KEY `contractorpayedit_contractorId_fkey`;

-- DropForeignKey
ALTER TABLE `contractorpayedit` DROP FOREIGN KEY `contractorpayedit_contractorPayId_fkey`;

-- DropForeignKey
ALTER TABLE `contractorpayedit` DROP FOREIGN KEY `contractorpayedit_createdByUser_fkey`;

-- DropForeignKey
ALTER TABLE `contractorpayedit` DROP FOREIGN KEY `contractorpayedit_updatedByUser_fkey`;

-- DropForeignKey
ALTER TABLE `employeepay` DROP FOREIGN KEY `employeepay_branchId_fkey`;

-- DropForeignKey
ALTER TABLE `employeesalary` DROP FOREIGN KEY `employeesalary_createdByUser_fkey`;

-- DropForeignKey
ALTER TABLE `employeesalary` DROP FOREIGN KEY `employeesalary_employeeId_fkey`;

-- DropForeignKey
ALTER TABLE `employeesalary` DROP FOREIGN KEY `employeesalary_updatedByUser_fkey`;

-- DropForeignKey
ALTER TABLE `employeesalaryedit` DROP FOREIGN KEY `employeesalaryedit_createdByUser_fkey`;

-- DropForeignKey
ALTER TABLE `employeesalaryedit` DROP FOREIGN KEY `employeesalaryedit_employeeId_fkey`;

-- DropForeignKey
ALTER TABLE `employeesalaryedit` DROP FOREIGN KEY `employeesalaryedit_employeeSalaryId_fkey`;

-- DropForeignKey
ALTER TABLE `employeesalaryedit` DROP FOREIGN KEY `employeesalaryedit_updatedByUser_fkey`;

-- DropForeignKey
ALTER TABLE `equipmentedit` DROP FOREIGN KEY `equipmentedit_branchId_fkey`;

-- DropForeignKey
ALTER TABLE `equipmentedit` DROP FOREIGN KEY `equipmentedit_createdByUser_fkey`;

-- DropForeignKey
ALTER TABLE `equipmentedit` DROP FOREIGN KEY `equipmentedit_equipmentId_fkey`;

-- DropForeignKey
ALTER TABLE `equipmentedit` DROP FOREIGN KEY `equipmentedit_updatedByUser_fkey`;

-- DropForeignKey
ALTER TABLE `joborderedit` DROP FOREIGN KEY `joborderedit_branchId_fkey`;

-- DropForeignKey
ALTER TABLE `joborderedit` DROP FOREIGN KEY `joborderedit_contractorId_fkey`;

-- DropForeignKey
ALTER TABLE `joborderedit` DROP FOREIGN KEY `joborderedit_createdByUser_fkey`;

-- DropForeignKey
ALTER TABLE `joborderedit` DROP FOREIGN KEY `joborderedit_customerId_fkey`;

-- DropForeignKey
ALTER TABLE `joborderedit` DROP FOREIGN KEY `joborderedit_jobOrderId_fkey`;

-- DropForeignKey
ALTER TABLE `joborderedit` DROP FOREIGN KEY `joborderedit_truckId_fkey`;

-- DropForeignKey
ALTER TABLE `joborderedit` DROP FOREIGN KEY `joborderedit_updatedByUser_fkey`;

-- DropForeignKey
ALTER TABLE `materialedit` DROP FOREIGN KEY `materialedit_jobOrderId_fkey`;

-- DropForeignKey
ALTER TABLE `otherincomeedit` DROP FOREIGN KEY `otherincomeedit_branchId_fkey`;

-- DropForeignKey
ALTER TABLE `otherincomeedit` DROP FOREIGN KEY `otherincomeedit_createdByUser_fkey`;

-- DropForeignKey
ALTER TABLE `otherincomeedit` DROP FOREIGN KEY `otherincomeedit_otherIncomeId_fkey`;

-- DropForeignKey
ALTER TABLE `otherincomeedit` DROP FOREIGN KEY `otherincomeedit_updatedByUser_fkey`;

-- DropForeignKey
ALTER TABLE `overheadedit` DROP FOREIGN KEY `overheadedit_branchId_fkey`;

-- DropForeignKey
ALTER TABLE `overheadedit` DROP FOREIGN KEY `overheadedit_createdByUser_fkey`;

-- DropForeignKey
ALTER TABLE `overheadedit` DROP FOREIGN KEY `overheadedit_overheadId_fkey`;

-- DropForeignKey
ALTER TABLE `overheadedit` DROP FOREIGN KEY `overheadedit_updatedByUser_fkey`;

-- DropForeignKey
ALTER TABLE `transactioneditz` DROP FOREIGN KEY `transactioneditz_createdByUser_fkey`;

-- DropForeignKey
ALTER TABLE `transactioneditz` DROP FOREIGN KEY `transactioneditz_transactionId_fkey`;

-- DropForeignKey
ALTER TABLE `transactioneditz` DROP FOREIGN KEY `transactioneditz_updatedByUser_fkey`;

-- DropForeignKey
ALTER TABLE `transactionz` DROP FOREIGN KEY `transactionz_createdByUser_fkey`;

-- DropForeignKey
ALTER TABLE `transactionz` DROP FOREIGN KEY `transactionz_jobOrderId_fkey`;

-- DropForeignKey
ALTER TABLE `transactionz` DROP FOREIGN KEY `transactionz_updatedByUser_fkey`;

-- DropForeignKey
ALTER TABLE `truckedit` DROP FOREIGN KEY `truckedit_createdByUser_fkey`;

-- DropForeignKey
ALTER TABLE `truckedit` DROP FOREIGN KEY `truckedit_truckId_fkey`;

-- DropForeignKey
ALTER TABLE `truckedit` DROP FOREIGN KEY `truckedit_updatedByUser_fkey`;

-- DropForeignKey
ALTER TABLE `truckownershipedit` DROP FOREIGN KEY `truckownershipedit_customerId_fkey`;

-- DropForeignKey
ALTER TABLE `truckownershipedit` DROP FOREIGN KEY `truckownershipedit_transferredByUser_fkey`;

-- DropForeignKey
ALTER TABLE `truckownershipedit` DROP FOREIGN KEY `truckownershipedit_truckId_fkey`;

-- DropForeignKey
ALTER TABLE `userbranchedit` DROP FOREIGN KEY `userbranchedit_branchId_fkey`;

-- DropForeignKey
ALTER TABLE `userbranchedit` DROP FOREIGN KEY `userbranchedit_userId_fkey`;

-- DropForeignKey
ALTER TABLE `useredit` DROP FOREIGN KEY `useredit_createdByUser_fkey`;

-- DropForeignKey
ALTER TABLE `useredit` DROP FOREIGN KEY `useredit_updatedByUser_fkey`;

-- DropForeignKey
ALTER TABLE `useredit` DROP FOREIGN KEY `useredit_userId_fkey`;

-- DropForeignKey
ALTER TABLE `userroleedit` DROP FOREIGN KEY `userroleedit_roleId_fkey`;

-- DropForeignKey
ALTER TABLE `userroleedit` DROP FOREIGN KEY `userroleedit_userId_fkey`;

-- DropIndex
DROP INDEX `contractorpay_branchId_fkey` ON `contractorpay`;

-- DropIndex
DROP INDEX `employeepay_branchId_fkey` ON `employeepay`;

-- AlterTable
ALTER TABLE `approvallog` DROP COLUMN `versionNumber`;

-- AlterTable
ALTER TABLE `contractorpay` MODIFY `branchId` VARCHAR(191) NOT NULL;

-- AlterTable
ALTER TABLE `employeepay` MODIFY `branchId` VARCHAR(191) NOT NULL;

-- AlterTable
ALTER TABLE `joborder` MODIFY `status` ENUM('pending', 'ongoing', 'completed', 'forRelease', 'archived') NOT NULL DEFAULT 'pending';

-- AlterTable
ALTER TABLE `permission` MODIFY `module` ENUM('Dashboard', 'Job Orders', 'Other Incomes', 'Transactions', 'Branches', 'Finances - Revenue and Profit', 'Finances - Operational - Materials', 'Finances - Operational - Equipment', 'Finances - Operational - Labor', 'Finances - Overhead', 'Trucks', 'Activity Logs', 'Users - All Users', 'Users - Roles and Permissions', 'My Dashboard', 'Assigned Orders', 'My Payout', 'My Orders', 'My Transactions', 'My Trucks', 'My Salary', 'Profile', 'Approval Logs', 'Customers', 'Contractors', 'Employees') NOT NULL;

-- DropTable
DROP TABLE `branchedit`;

-- DropTable
DROP TABLE `contractorpayedit`;

-- DropTable
DROP TABLE `employeesalary`;

-- DropTable
DROP TABLE `employeesalaryedit`;

-- DropTable
DROP TABLE `equipmentedit`;

-- DropTable
DROP TABLE `joborderedit`;

-- DropTable
DROP TABLE `materialedit`;

-- DropTable
DROP TABLE `otherincomeedit`;

-- DropTable
DROP TABLE `overheadedit`;

-- DropTable
DROP TABLE `transactioneditz`;

-- DropTable
DROP TABLE `transactionz`;

-- DropTable
DROP TABLE `truckedit`;

-- DropTable
DROP TABLE `truckownershipedit`;

-- DropTable
DROP TABLE `userbranchedit`;

-- DropTable
DROP TABLE `useredit`;

-- DropTable
DROP TABLE `userroleedit`;

-- AddForeignKey
ALTER TABLE `contractorpay` ADD CONSTRAINT `contractorpay_branchId_fkey` FOREIGN KEY (`branchId`) REFERENCES `branch`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `employeepay` ADD CONSTRAINT `employeepay_branchId_fkey` FOREIGN KEY (`branchId`) REFERENCES `branch`(`id`) ON DELETE NO ACTION ON UPDATE CASCADE;
