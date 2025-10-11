/*
  Warnings:

  - You are about to drop the column `module` on the `approvallog` table. All the data in the column will be lost.
  - You are about to drop the column `moduleId` on the `approvallog` table. All the data in the column will be lost.
  - You are about to drop the column `requestComment` on the `approvallog` table. All the data in the column will be lost.
  - You are about to drop the column `table` on the `approvallog` table. All the data in the column will be lost.
  - Added the required column `actionType` to the `approvallog` table without a default value. This is not possible if the table is not empty.
  - Added the required column `payload` to the `approvallog` table without a default value. This is not possible if the table is not empty.
  - Added the required column `requestedByUser` to the `approvallog` table without a default value. This is not possible if the table is not empty.
  - Added the required column `tableName` to the `approvallog` table without a default value. This is not possible if the table is not empty.
  - Added the required column `updatedAt` to the `approvallog` table without a default value. This is not possible if the table is not empty.

*/
-- DropForeignKey
ALTER TABLE `activitylog` DROP FOREIGN KEY `ActivityLog_userName_fkey`;

-- DropForeignKey
ALTER TABLE `admin` DROP FOREIGN KEY `Admin_userId_fkey`;

-- DropForeignKey
ALTER TABLE `branch` DROP FOREIGN KEY `Branch_createdByUser_fkey`;

-- DropForeignKey
ALTER TABLE `branch` DROP FOREIGN KEY `Branch_updatedByUser_fkey`;

-- DropForeignKey
ALTER TABLE `branchedit` DROP FOREIGN KEY `BranchEdit_branchId_fkey`;

-- DropForeignKey
ALTER TABLE `branchedit` DROP FOREIGN KEY `BranchEdit_createdByUser_fkey`;

-- DropForeignKey
ALTER TABLE `branchedit` DROP FOREIGN KEY `BranchEdit_updatedByUser_fkey`;

-- DropForeignKey
ALTER TABLE `contractor` DROP FOREIGN KEY `Contractor_userId_fkey`;

-- DropForeignKey
ALTER TABLE `contractorpay` DROP FOREIGN KEY `ContractorPay_contractorId_fkey`;

-- DropForeignKey
ALTER TABLE `contractorpay` DROP FOREIGN KEY `ContractorPay_createdByUser_fkey`;

-- DropForeignKey
ALTER TABLE `contractorpay` DROP FOREIGN KEY `ContractorPay_updatedByUser_fkey`;

-- DropForeignKey
ALTER TABLE `contractorpayedit` DROP FOREIGN KEY `ContractorPayEdit_contractorId_fkey`;

-- DropForeignKey
ALTER TABLE `contractorpayedit` DROP FOREIGN KEY `ContractorPayEdit_contractorPayId_fkey`;

-- DropForeignKey
ALTER TABLE `contractorpayedit` DROP FOREIGN KEY `ContractorPayEdit_createdByUser_fkey`;

-- DropForeignKey
ALTER TABLE `contractorpayedit` DROP FOREIGN KEY `ContractorPayEdit_updatedByUser_fkey`;

-- DropForeignKey
ALTER TABLE `customer` DROP FOREIGN KEY `Customer_userId_fkey`;

-- DropForeignKey
ALTER TABLE `employee` DROP FOREIGN KEY `Employee_userId_fkey`;

-- DropForeignKey
ALTER TABLE `employeepay` DROP FOREIGN KEY `EmployeePay_createdByUser_fkey`;

-- DropForeignKey
ALTER TABLE `employeepay` DROP FOREIGN KEY `EmployeePay_employeeId_fkey`;

-- DropForeignKey
ALTER TABLE `employeepay` DROP FOREIGN KEY `EmployeePay_updatedByUser_fkey`;

-- DropForeignKey
ALTER TABLE `employeesalary` DROP FOREIGN KEY `EmployeeSalary_createdByUser_fkey`;

-- DropForeignKey
ALTER TABLE `employeesalary` DROP FOREIGN KEY `EmployeeSalary_employeeId_fkey`;

-- DropForeignKey
ALTER TABLE `employeesalary` DROP FOREIGN KEY `EmployeeSalary_updatedByUser_fkey`;

-- DropForeignKey
ALTER TABLE `employeesalaryedit` DROP FOREIGN KEY `EmployeeSalaryEdit_createdByUser_fkey`;

-- DropForeignKey
ALTER TABLE `employeesalaryedit` DROP FOREIGN KEY `EmployeeSalaryEdit_employeeId_fkey`;

-- DropForeignKey
ALTER TABLE `employeesalaryedit` DROP FOREIGN KEY `EmployeeSalaryEdit_employeeSalaryId_fkey`;

-- DropForeignKey
ALTER TABLE `employeesalaryedit` DROP FOREIGN KEY `EmployeeSalaryEdit_updatedByUser_fkey`;

-- DropForeignKey
ALTER TABLE `equipment` DROP FOREIGN KEY `Equipment_branchId_fkey`;

-- DropForeignKey
ALTER TABLE `equipment` DROP FOREIGN KEY `Equipment_createdByUser_fkey`;

-- DropForeignKey
ALTER TABLE `equipment` DROP FOREIGN KEY `Equipment_updatedByUser_fkey`;

-- DropForeignKey
ALTER TABLE `equipmentedit` DROP FOREIGN KEY `EquipmentEdit_branchId_fkey`;

-- DropForeignKey
ALTER TABLE `equipmentedit` DROP FOREIGN KEY `EquipmentEdit_createdByUser_fkey`;

-- DropForeignKey
ALTER TABLE `equipmentedit` DROP FOREIGN KEY `EquipmentEdit_equipmentId_fkey`;

-- DropForeignKey
ALTER TABLE `equipmentedit` DROP FOREIGN KEY `EquipmentEdit_updatedByUser_fkey`;

-- DropForeignKey
ALTER TABLE `joborder` DROP FOREIGN KEY `JobOrder_branchId_fkey`;

-- DropForeignKey
ALTER TABLE `joborder` DROP FOREIGN KEY `JobOrder_contractorId_fkey`;

-- DropForeignKey
ALTER TABLE `joborder` DROP FOREIGN KEY `JobOrder_createdByUser_fkey`;

-- DropForeignKey
ALTER TABLE `joborder` DROP FOREIGN KEY `JobOrder_customerId_fkey`;

-- DropForeignKey
ALTER TABLE `joborder` DROP FOREIGN KEY `JobOrder_truckId_fkey`;

-- DropForeignKey
ALTER TABLE `joborder` DROP FOREIGN KEY `JobOrder_updatedByUser_fkey`;

-- DropForeignKey
ALTER TABLE `joborderedit` DROP FOREIGN KEY `JobOrderEdit_branchId_fkey`;

-- DropForeignKey
ALTER TABLE `joborderedit` DROP FOREIGN KEY `JobOrderEdit_contractorId_fkey`;

-- DropForeignKey
ALTER TABLE `joborderedit` DROP FOREIGN KEY `JobOrderEdit_createdByUser_fkey`;

-- DropForeignKey
ALTER TABLE `joborderedit` DROP FOREIGN KEY `JobOrderEdit_customerId_fkey`;

-- DropForeignKey
ALTER TABLE `joborderedit` DROP FOREIGN KEY `JobOrderEdit_jobOrderId_fkey`;

-- DropForeignKey
ALTER TABLE `joborderedit` DROP FOREIGN KEY `JobOrderEdit_truckId_fkey`;

-- DropForeignKey
ALTER TABLE `joborderedit` DROP FOREIGN KEY `JobOrderEdit_updatedByUser_fkey`;

-- DropForeignKey
ALTER TABLE `material` DROP FOREIGN KEY `Material_jobOrderId_fkey`;

-- DropForeignKey
ALTER TABLE `materialedit` DROP FOREIGN KEY `MaterialEdit_jobOrderId_fkey`;

-- DropForeignKey
ALTER TABLE `otherincome` DROP FOREIGN KEY `OtherIncome_branchId_fkey`;

-- DropForeignKey
ALTER TABLE `otherincome` DROP FOREIGN KEY `OtherIncome_createdByUser_fkey`;

-- DropForeignKey
ALTER TABLE `otherincome` DROP FOREIGN KEY `OtherIncome_updatedByUser_fkey`;

-- DropForeignKey
ALTER TABLE `otherincomeedit` DROP FOREIGN KEY `OtherIncomeEdit_branchId_fkey`;

-- DropForeignKey
ALTER TABLE `otherincomeedit` DROP FOREIGN KEY `OtherIncomeEdit_createdByUser_fkey`;

-- DropForeignKey
ALTER TABLE `otherincomeedit` DROP FOREIGN KEY `OtherIncomeEdit_otherIncomeId_fkey`;

-- DropForeignKey
ALTER TABLE `otherincomeedit` DROP FOREIGN KEY `OtherIncomeEdit_updatedByUser_fkey`;

-- DropForeignKey
ALTER TABLE `overhead` DROP FOREIGN KEY `Overhead_branchId_fkey`;

-- DropForeignKey
ALTER TABLE `overhead` DROP FOREIGN KEY `Overhead_createdByUser_fkey`;

-- DropForeignKey
ALTER TABLE `overhead` DROP FOREIGN KEY `Overhead_updatedByUser_fkey`;

-- DropForeignKey
ALTER TABLE `overheadedit` DROP FOREIGN KEY `OverheadEdit_branchId_fkey`;

-- DropForeignKey
ALTER TABLE `overheadedit` DROP FOREIGN KEY `OverheadEdit_createdByUser_fkey`;

-- DropForeignKey
ALTER TABLE `overheadedit` DROP FOREIGN KEY `OverheadEdit_overheadId_fkey`;

-- DropForeignKey
ALTER TABLE `overheadedit` DROP FOREIGN KEY `OverheadEdit_updatedByUser_fkey`;

-- DropForeignKey
ALTER TABLE `paycomponent` DROP FOREIGN KEY `PayComponent_componentId_fkey`;

-- DropForeignKey
ALTER TABLE `paycomponent` DROP FOREIGN KEY `PayComponent_createdByUser_fkey`;

-- DropForeignKey
ALTER TABLE `paycomponent` DROP FOREIGN KEY `PayComponent_employeePayId_fkey`;

-- DropForeignKey
ALTER TABLE `paycomponent` DROP FOREIGN KEY `PayComponent_updatedByUser_fkey`;

-- DropForeignKey
ALTER TABLE `role` DROP FOREIGN KEY `Role_baseRoleId_fkey`;

-- DropForeignKey
ALTER TABLE `role` DROP FOREIGN KEY `Role_createdByUser_fkey`;

-- DropForeignKey
ALTER TABLE `rolepermission` DROP FOREIGN KEY `RolePermission_permissionId_fkey`;

-- DropForeignKey
ALTER TABLE `rolepermission` DROP FOREIGN KEY `RolePermission_roleId_fkey`;

-- DropForeignKey
ALTER TABLE `transaction` DROP FOREIGN KEY `Transaction_createdByUser_fkey`;

-- DropForeignKey
ALTER TABLE `transaction` DROP FOREIGN KEY `Transaction_jobOrderCode_fkey`;

-- DropForeignKey
ALTER TABLE `transaction` DROP FOREIGN KEY `Transaction_updatedByUser_fkey`;

-- DropForeignKey
ALTER TABLE `transactioneditz` DROP FOREIGN KEY `TransactionEditZ_createdByUser_fkey`;

-- DropForeignKey
ALTER TABLE `transactioneditz` DROP FOREIGN KEY `TransactionEditZ_transactionId_fkey`;

-- DropForeignKey
ALTER TABLE `transactioneditz` DROP FOREIGN KEY `TransactionEditZ_updatedByUser_fkey`;

-- DropForeignKey
ALTER TABLE `transactionz` DROP FOREIGN KEY `TransactionZ_createdByUser_fkey`;

-- DropForeignKey
ALTER TABLE `transactionz` DROP FOREIGN KEY `TransactionZ_jobOrderId_fkey`;

-- DropForeignKey
ALTER TABLE `transactionz` DROP FOREIGN KEY `TransactionZ_updatedByUser_fkey`;

-- DropForeignKey
ALTER TABLE `truck` DROP FOREIGN KEY `Truck_createdByUser_fkey`;

-- DropForeignKey
ALTER TABLE `truck` DROP FOREIGN KEY `Truck_updatedByUser_fkey`;

-- DropForeignKey
ALTER TABLE `truckedit` DROP FOREIGN KEY `TruckEdit_createdByUser_fkey`;

-- DropForeignKey
ALTER TABLE `truckedit` DROP FOREIGN KEY `TruckEdit_truckId_fkey`;

-- DropForeignKey
ALTER TABLE `truckedit` DROP FOREIGN KEY `TruckEdit_updatedByUser_fkey`;

-- DropForeignKey
ALTER TABLE `truckownership` DROP FOREIGN KEY `TruckOwnership_customerId_fkey`;

-- DropForeignKey
ALTER TABLE `truckownership` DROP FOREIGN KEY `TruckOwnership_transferredByUser_fkey`;

-- DropForeignKey
ALTER TABLE `truckownership` DROP FOREIGN KEY `TruckOwnership_truckId_fkey`;

-- DropForeignKey
ALTER TABLE `truckownershipedit` DROP FOREIGN KEY `TruckOwnershipEdit_customerId_fkey`;

-- DropForeignKey
ALTER TABLE `truckownershipedit` DROP FOREIGN KEY `TruckOwnershipEdit_transferredByUser_fkey`;

-- DropForeignKey
ALTER TABLE `truckownershipedit` DROP FOREIGN KEY `TruckOwnershipEdit_truckId_fkey`;

-- DropForeignKey
ALTER TABLE `user` DROP FOREIGN KEY `User_createdByUser_fkey`;

-- DropForeignKey
ALTER TABLE `user` DROP FOREIGN KEY `User_updatedByUser_fkey`;

-- DropForeignKey
ALTER TABLE `userbranch` DROP FOREIGN KEY `UserBranch_branchId_fkey`;

-- DropForeignKey
ALTER TABLE `userbranch` DROP FOREIGN KEY `UserBranch_userId_fkey`;

-- DropForeignKey
ALTER TABLE `userbranchedit` DROP FOREIGN KEY `UserBranchEdit_branchId_fkey`;

-- DropForeignKey
ALTER TABLE `userbranchedit` DROP FOREIGN KEY `UserBranchEdit_userId_fkey`;

-- DropForeignKey
ALTER TABLE `useredit` DROP FOREIGN KEY `UserEdit_createdByUser_fkey`;

-- DropForeignKey
ALTER TABLE `useredit` DROP FOREIGN KEY `UserEdit_updatedByUser_fkey`;

-- DropForeignKey
ALTER TABLE `useredit` DROP FOREIGN KEY `UserEdit_userId_fkey`;

-- DropForeignKey
ALTER TABLE `userrole` DROP FOREIGN KEY `UserRole_roleId_fkey`;

-- DropForeignKey
ALTER TABLE `userrole` DROP FOREIGN KEY `UserRole_userId_fkey`;

-- DropForeignKey
ALTER TABLE `userroleedit` DROP FOREIGN KEY `UserRoleEdit_roleId_fkey`;

-- DropForeignKey
ALTER TABLE `userroleedit` DROP FOREIGN KEY `UserRoleEdit_userId_fkey`;

-- AlterTable
ALTER TABLE `approvallog` DROP COLUMN `module`,
    DROP COLUMN `moduleId`,
    DROP COLUMN `requestComment`,
    DROP COLUMN `table`,
    ADD COLUMN `actionType` ENUM('edit', 'delete', 'create') NOT NULL,
    ADD COLUMN `approvedByUser` VARCHAR(191) NULL,
    ADD COLUMN `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    ADD COLUMN `payload` JSON NOT NULL,
    ADD COLUMN `recordId` VARCHAR(191) NULL,
    ADD COLUMN `requestedByUser` VARCHAR(191) NOT NULL,
    ADD COLUMN `status` ENUM('pending', 'published', 'rejected') NOT NULL DEFAULT 'pending',
    ADD COLUMN `tableName` VARCHAR(191) NOT NULL,
    ADD COLUMN `updatedAt` DATETIME(3) NOT NULL,
    ADD COLUMN `versionNumber` INTEGER NULL;

-- AddForeignKey
ALTER TABLE `user` ADD CONSTRAINT `user_createdByUser_fkey` FOREIGN KEY (`createdByUser`) REFERENCES `user`(`username`) ON DELETE NO ACTION ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `user` ADD CONSTRAINT `user_updatedByUser_fkey` FOREIGN KEY (`updatedByUser`) REFERENCES `user`(`username`) ON DELETE NO ACTION ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `useredit` ADD CONSTRAINT `useredit_userId_fkey` FOREIGN KEY (`userId`) REFERENCES `user`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `useredit` ADD CONSTRAINT `useredit_updatedByUser_fkey` FOREIGN KEY (`updatedByUser`) REFERENCES `user`(`username`) ON DELETE NO ACTION ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `useredit` ADD CONSTRAINT `useredit_createdByUser_fkey` FOREIGN KEY (`createdByUser`) REFERENCES `user`(`username`) ON DELETE NO ACTION ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `admin` ADD CONSTRAINT `admin_userId_fkey` FOREIGN KEY (`userId`) REFERENCES `user`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `customer` ADD CONSTRAINT `customer_userId_fkey` FOREIGN KEY (`userId`) REFERENCES `user`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `contractor` ADD CONSTRAINT `contractor_userId_fkey` FOREIGN KEY (`userId`) REFERENCES `user`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `employee` ADD CONSTRAINT `employee_userId_fkey` FOREIGN KEY (`userId`) REFERENCES `user`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `branch` ADD CONSTRAINT `branch_createdByUser_fkey` FOREIGN KEY (`createdByUser`) REFERENCES `user`(`username`) ON DELETE NO ACTION ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `branch` ADD CONSTRAINT `branch_updatedByUser_fkey` FOREIGN KEY (`updatedByUser`) REFERENCES `user`(`username`) ON DELETE NO ACTION ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `branchedit` ADD CONSTRAINT `branchedit_branchId_fkey` FOREIGN KEY (`branchId`) REFERENCES `branch`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `branchedit` ADD CONSTRAINT `branchedit_createdByUser_fkey` FOREIGN KEY (`createdByUser`) REFERENCES `user`(`username`) ON DELETE NO ACTION ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `branchedit` ADD CONSTRAINT `branchedit_updatedByUser_fkey` FOREIGN KEY (`updatedByUser`) REFERENCES `user`(`username`) ON DELETE NO ACTION ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `truck` ADD CONSTRAINT `truck_createdByUser_fkey` FOREIGN KEY (`createdByUser`) REFERENCES `user`(`username`) ON DELETE NO ACTION ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `truck` ADD CONSTRAINT `truck_updatedByUser_fkey` FOREIGN KEY (`updatedByUser`) REFERENCES `user`(`username`) ON DELETE NO ACTION ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `truckedit` ADD CONSTRAINT `truckedit_truckId_fkey` FOREIGN KEY (`truckId`) REFERENCES `truck`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `truckedit` ADD CONSTRAINT `truckedit_createdByUser_fkey` FOREIGN KEY (`createdByUser`) REFERENCES `user`(`username`) ON DELETE NO ACTION ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `truckedit` ADD CONSTRAINT `truckedit_updatedByUser_fkey` FOREIGN KEY (`updatedByUser`) REFERENCES `user`(`username`) ON DELETE NO ACTION ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `truckownership` ADD CONSTRAINT `truckownership_truckId_fkey` FOREIGN KEY (`truckId`) REFERENCES `truck`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `truckownership` ADD CONSTRAINT `truckownership_customerId_fkey` FOREIGN KEY (`customerId`) REFERENCES `customer`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `truckownership` ADD CONSTRAINT `truckownership_transferredByUser_fkey` FOREIGN KEY (`transferredByUser`) REFERENCES `user`(`username`) ON DELETE NO ACTION ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `truckownershipedit` ADD CONSTRAINT `truckownershipedit_truckId_fkey` FOREIGN KEY (`truckId`) REFERENCES `truck`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `truckownershipedit` ADD CONSTRAINT `truckownershipedit_customerId_fkey` FOREIGN KEY (`customerId`) REFERENCES `customer`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `truckownershipedit` ADD CONSTRAINT `truckownershipedit_transferredByUser_fkey` FOREIGN KEY (`transferredByUser`) REFERENCES `user`(`username`) ON DELETE NO ACTION ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `contractorpay` ADD CONSTRAINT `contractorpay_contractorId_fkey` FOREIGN KEY (`contractorId`) REFERENCES `contractor`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `contractorpay` ADD CONSTRAINT `contractorpay_createdByUser_fkey` FOREIGN KEY (`createdByUser`) REFERENCES `user`(`username`) ON DELETE NO ACTION ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `contractorpay` ADD CONSTRAINT `contractorpay_updatedByUser_fkey` FOREIGN KEY (`updatedByUser`) REFERENCES `user`(`username`) ON DELETE NO ACTION ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `contractorpayedit` ADD CONSTRAINT `contractorpayedit_contractorId_fkey` FOREIGN KEY (`contractorId`) REFERENCES `contractor`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `contractorpayedit` ADD CONSTRAINT `contractorpayedit_createdByUser_fkey` FOREIGN KEY (`createdByUser`) REFERENCES `user`(`username`) ON DELETE NO ACTION ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `contractorpayedit` ADD CONSTRAINT `contractorpayedit_updatedByUser_fkey` FOREIGN KEY (`updatedByUser`) REFERENCES `user`(`username`) ON DELETE NO ACTION ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `contractorpayedit` ADD CONSTRAINT `contractorpayedit_contractorPayId_fkey` FOREIGN KEY (`contractorPayId`) REFERENCES `contractorpay`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `employeesalary` ADD CONSTRAINT `employeesalary_employeeId_fkey` FOREIGN KEY (`employeeId`) REFERENCES `employee`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `employeesalary` ADD CONSTRAINT `employeesalary_createdByUser_fkey` FOREIGN KEY (`createdByUser`) REFERENCES `user`(`username`) ON DELETE NO ACTION ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `employeesalary` ADD CONSTRAINT `employeesalary_updatedByUser_fkey` FOREIGN KEY (`updatedByUser`) REFERENCES `user`(`username`) ON DELETE NO ACTION ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `employeesalaryedit` ADD CONSTRAINT `employeesalaryedit_employeeId_fkey` FOREIGN KEY (`employeeId`) REFERENCES `employee`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `employeesalaryedit` ADD CONSTRAINT `employeesalaryedit_createdByUser_fkey` FOREIGN KEY (`createdByUser`) REFERENCES `user`(`username`) ON DELETE NO ACTION ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `employeesalaryedit` ADD CONSTRAINT `employeesalaryedit_updatedByUser_fkey` FOREIGN KEY (`updatedByUser`) REFERENCES `user`(`username`) ON DELETE NO ACTION ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `employeesalaryedit` ADD CONSTRAINT `employeesalaryedit_employeeSalaryId_fkey` FOREIGN KEY (`employeeSalaryId`) REFERENCES `employeesalary`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `employeepay` ADD CONSTRAINT `employeepay_employeeId_fkey` FOREIGN KEY (`employeeId`) REFERENCES `employee`(`id`) ON DELETE NO ACTION ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `employeepay` ADD CONSTRAINT `employeepay_createdByUser_fkey` FOREIGN KEY (`createdByUser`) REFERENCES `user`(`username`) ON DELETE NO ACTION ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `employeepay` ADD CONSTRAINT `employeepay_updatedByUser_fkey` FOREIGN KEY (`updatedByUser`) REFERENCES `user`(`username`) ON DELETE NO ACTION ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `paycomponent` ADD CONSTRAINT `paycomponent_componentId_fkey` FOREIGN KEY (`componentId`) REFERENCES `component`(`id`) ON DELETE NO ACTION ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `paycomponent` ADD CONSTRAINT `paycomponent_employeePayId_fkey` FOREIGN KEY (`employeePayId`) REFERENCES `employeepay`(`id`) ON DELETE NO ACTION ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `paycomponent` ADD CONSTRAINT `paycomponent_createdByUser_fkey` FOREIGN KEY (`createdByUser`) REFERENCES `user`(`username`) ON DELETE NO ACTION ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `paycomponent` ADD CONSTRAINT `paycomponent_updatedByUser_fkey` FOREIGN KEY (`updatedByUser`) REFERENCES `user`(`username`) ON DELETE NO ACTION ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `activitylog` ADD CONSTRAINT `activitylog_userName_fkey` FOREIGN KEY (`userName`) REFERENCES `user`(`username`) ON DELETE NO ACTION ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `transactionz` ADD CONSTRAINT `transactionz_jobOrderId_fkey` FOREIGN KEY (`jobOrderId`) REFERENCES `joborder`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `transactionz` ADD CONSTRAINT `transactionz_createdByUser_fkey` FOREIGN KEY (`createdByUser`) REFERENCES `user`(`username`) ON DELETE NO ACTION ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `transactionz` ADD CONSTRAINT `transactionz_updatedByUser_fkey` FOREIGN KEY (`updatedByUser`) REFERENCES `user`(`username`) ON DELETE NO ACTION ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `transactioneditz` ADD CONSTRAINT `transactioneditz_transactionId_fkey` FOREIGN KEY (`transactionId`) REFERENCES `transactionz`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `transactioneditz` ADD CONSTRAINT `transactioneditz_createdByUser_fkey` FOREIGN KEY (`createdByUser`) REFERENCES `user`(`username`) ON DELETE NO ACTION ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `transactioneditz` ADD CONSTRAINT `transactioneditz_updatedByUser_fkey` FOREIGN KEY (`updatedByUser`) REFERENCES `user`(`username`) ON DELETE NO ACTION ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `transaction` ADD CONSTRAINT `transaction_jobOrderCode_fkey` FOREIGN KEY (`jobOrderCode`) REFERENCES `joborder`(`jobOrderCode`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `transaction` ADD CONSTRAINT `transaction_createdByUser_fkey` FOREIGN KEY (`createdByUser`) REFERENCES `user`(`username`) ON DELETE NO ACTION ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `transaction` ADD CONSTRAINT `transaction_updatedByUser_fkey` FOREIGN KEY (`updatedByUser`) REFERENCES `user`(`username`) ON DELETE NO ACTION ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `otherincome` ADD CONSTRAINT `otherincome_branchId_fkey` FOREIGN KEY (`branchId`) REFERENCES `branch`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `otherincome` ADD CONSTRAINT `otherincome_createdByUser_fkey` FOREIGN KEY (`createdByUser`) REFERENCES `user`(`username`) ON DELETE NO ACTION ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `otherincome` ADD CONSTRAINT `otherincome_updatedByUser_fkey` FOREIGN KEY (`updatedByUser`) REFERENCES `user`(`username`) ON DELETE NO ACTION ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `otherincomeedit` ADD CONSTRAINT `otherincomeedit_branchId_fkey` FOREIGN KEY (`branchId`) REFERENCES `branch`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `otherincomeedit` ADD CONSTRAINT `otherincomeedit_otherIncomeId_fkey` FOREIGN KEY (`otherIncomeId`) REFERENCES `otherincome`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `otherincomeedit` ADD CONSTRAINT `otherincomeedit_createdByUser_fkey` FOREIGN KEY (`createdByUser`) REFERENCES `user`(`username`) ON DELETE NO ACTION ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `otherincomeedit` ADD CONSTRAINT `otherincomeedit_updatedByUser_fkey` FOREIGN KEY (`updatedByUser`) REFERENCES `user`(`username`) ON DELETE NO ACTION ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `equipment` ADD CONSTRAINT `equipment_branchId_fkey` FOREIGN KEY (`branchId`) REFERENCES `branch`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `equipment` ADD CONSTRAINT `equipment_createdByUser_fkey` FOREIGN KEY (`createdByUser`) REFERENCES `user`(`username`) ON DELETE NO ACTION ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `equipment` ADD CONSTRAINT `equipment_updatedByUser_fkey` FOREIGN KEY (`updatedByUser`) REFERENCES `user`(`username`) ON DELETE NO ACTION ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `equipmentedit` ADD CONSTRAINT `equipmentedit_branchId_fkey` FOREIGN KEY (`branchId`) REFERENCES `branch`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `equipmentedit` ADD CONSTRAINT `equipmentedit_equipmentId_fkey` FOREIGN KEY (`equipmentId`) REFERENCES `equipment`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `equipmentedit` ADD CONSTRAINT `equipmentedit_createdByUser_fkey` FOREIGN KEY (`createdByUser`) REFERENCES `user`(`username`) ON DELETE NO ACTION ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `equipmentedit` ADD CONSTRAINT `equipmentedit_updatedByUser_fkey` FOREIGN KEY (`updatedByUser`) REFERENCES `user`(`username`) ON DELETE NO ACTION ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `material` ADD CONSTRAINT `material_jobOrderId_fkey` FOREIGN KEY (`jobOrderId`) REFERENCES `joborder`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `materialedit` ADD CONSTRAINT `materialedit_jobOrderId_fkey` FOREIGN KEY (`jobOrderId`) REFERENCES `joborder`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `joborder` ADD CONSTRAINT `joborder_truckId_fkey` FOREIGN KEY (`truckId`) REFERENCES `truck`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `joborder` ADD CONSTRAINT `joborder_branchId_fkey` FOREIGN KEY (`branchId`) REFERENCES `branch`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `joborder` ADD CONSTRAINT `joborder_contractorId_fkey` FOREIGN KEY (`contractorId`) REFERENCES `contractor`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `joborder` ADD CONSTRAINT `joborder_customerId_fkey` FOREIGN KEY (`customerId`) REFERENCES `customer`(`id`) ON DELETE NO ACTION ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `joborder` ADD CONSTRAINT `joborder_createdByUser_fkey` FOREIGN KEY (`createdByUser`) REFERENCES `user`(`username`) ON DELETE NO ACTION ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `joborder` ADD CONSTRAINT `joborder_updatedByUser_fkey` FOREIGN KEY (`updatedByUser`) REFERENCES `user`(`username`) ON DELETE NO ACTION ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `joborderedit` ADD CONSTRAINT `joborderedit_branchId_fkey` FOREIGN KEY (`branchId`) REFERENCES `branch`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `joborderedit` ADD CONSTRAINT `joborderedit_jobOrderId_fkey` FOREIGN KEY (`jobOrderId`) REFERENCES `joborder`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `joborderedit` ADD CONSTRAINT `joborderedit_truckId_fkey` FOREIGN KEY (`truckId`) REFERENCES `truck`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `joborderedit` ADD CONSTRAINT `joborderedit_contractorId_fkey` FOREIGN KEY (`contractorId`) REFERENCES `contractor`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `joborderedit` ADD CONSTRAINT `joborderedit_customerId_fkey` FOREIGN KEY (`customerId`) REFERENCES `customer`(`id`) ON DELETE NO ACTION ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `joborderedit` ADD CONSTRAINT `joborderedit_createdByUser_fkey` FOREIGN KEY (`createdByUser`) REFERENCES `user`(`username`) ON DELETE NO ACTION ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `joborderedit` ADD CONSTRAINT `joborderedit_updatedByUser_fkey` FOREIGN KEY (`updatedByUser`) REFERENCES `user`(`username`) ON DELETE NO ACTION ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `overhead` ADD CONSTRAINT `overhead_branchId_fkey` FOREIGN KEY (`branchId`) REFERENCES `branch`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `overhead` ADD CONSTRAINT `overhead_createdByUser_fkey` FOREIGN KEY (`createdByUser`) REFERENCES `user`(`username`) ON DELETE NO ACTION ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `overhead` ADD CONSTRAINT `overhead_updatedByUser_fkey` FOREIGN KEY (`updatedByUser`) REFERENCES `user`(`username`) ON DELETE NO ACTION ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `overheadedit` ADD CONSTRAINT `overheadedit_branchId_fkey` FOREIGN KEY (`branchId`) REFERENCES `branch`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `overheadedit` ADD CONSTRAINT `overheadedit_overheadId_fkey` FOREIGN KEY (`overheadId`) REFERENCES `overhead`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `overheadedit` ADD CONSTRAINT `overheadedit_createdByUser_fkey` FOREIGN KEY (`createdByUser`) REFERENCES `user`(`username`) ON DELETE NO ACTION ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `overheadedit` ADD CONSTRAINT `overheadedit_updatedByUser_fkey` FOREIGN KEY (`updatedByUser`) REFERENCES `user`(`username`) ON DELETE NO ACTION ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `userrole` ADD CONSTRAINT `userrole_userId_fkey` FOREIGN KEY (`userId`) REFERENCES `user`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `userrole` ADD CONSTRAINT `userrole_roleId_fkey` FOREIGN KEY (`roleId`) REFERENCES `role`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `userroleedit` ADD CONSTRAINT `userroleedit_userId_fkey` FOREIGN KEY (`userId`) REFERENCES `user`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `userroleedit` ADD CONSTRAINT `userroleedit_roleId_fkey` FOREIGN KEY (`roleId`) REFERENCES `role`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `userbranch` ADD CONSTRAINT `userbranch_userId_fkey` FOREIGN KEY (`userId`) REFERENCES `user`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `userbranch` ADD CONSTRAINT `userbranch_branchId_fkey` FOREIGN KEY (`branchId`) REFERENCES `branch`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `userbranchedit` ADD CONSTRAINT `userbranchedit_userId_fkey` FOREIGN KEY (`userId`) REFERENCES `user`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `userbranchedit` ADD CONSTRAINT `userbranchedit_branchId_fkey` FOREIGN KEY (`branchId`) REFERENCES `branch`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `role` ADD CONSTRAINT `role_baseRoleId_fkey` FOREIGN KEY (`baseRoleId`) REFERENCES `role`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `role` ADD CONSTRAINT `role_createdByUser_fkey` FOREIGN KEY (`createdByUser`) REFERENCES `user`(`username`) ON DELETE NO ACTION ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `rolepermission` ADD CONSTRAINT `rolepermission_roleId_fkey` FOREIGN KEY (`roleId`) REFERENCES `role`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `rolepermission` ADD CONSTRAINT `rolepermission_permissionId_fkey` FOREIGN KEY (`permissionId`) REFERENCES `permission`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `approvallog` ADD CONSTRAINT `approvallog_requestedByUser_fkey` FOREIGN KEY (`requestedByUser`) REFERENCES `user`(`username`) ON DELETE NO ACTION ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `approvallog` ADD CONSTRAINT `approvallog_approvedByUser_fkey` FOREIGN KEY (`approvedByUser`) REFERENCES `user`(`username`) ON DELETE NO ACTION ON UPDATE CASCADE;

-- RenameIndex
ALTER TABLE `admin` RENAME INDEX `Admin_userId_key` TO `admin_userId_key`;

-- RenameIndex
ALTER TABLE `branch` RENAME INDEX `Branch_branchName_key` TO `branch_branchName_key`;

-- RenameIndex
ALTER TABLE `contractor` RENAME INDEX `Contractor_userId_key` TO `contractor_userId_key`;

-- RenameIndex
ALTER TABLE `customer` RENAME INDEX `Customer_userId_key` TO `customer_userId_key`;

-- RenameIndex
ALTER TABLE `employee` RENAME INDEX `Employee_userId_key` TO `employee_userId_key`;

-- RenameIndex
ALTER TABLE `joborder` RENAME INDEX `JobOrder_jobOrderCode_key` TO `joborder_jobOrderCode_key`;

-- RenameIndex
ALTER TABLE `permission` RENAME INDEX `Permission_permissionName_key` TO `permission_permissionName_key`;

-- RenameIndex
ALTER TABLE `role` RENAME INDEX `Role_roleName_key` TO `role_roleName_key`;

-- RenameIndex
ALTER TABLE `rolepermission` RENAME INDEX `RolePermission_roleId_permissionId_key` TO `rolepermission_roleId_permissionId_key`;

-- RenameIndex
ALTER TABLE `transaction` RENAME INDEX `Transaction_sessionId_key` TO `transaction_sessionId_key`;

-- RenameIndex
ALTER TABLE `truck` RENAME INDEX `Truck_plate_key` TO `truck_plate_key`;

-- RenameIndex
ALTER TABLE `user` RENAME INDEX `User_email_key` TO `user_email_key`;

-- RenameIndex
ALTER TABLE `user` RENAME INDEX `User_username_key` TO `user_username_key`;

-- RenameIndex
ALTER TABLE `userbranch` RENAME INDEX `UserBranch_userId_branchId_key` TO `userbranch_userId_branchId_key`;

-- RenameIndex
ALTER TABLE `userbranchedit` RENAME INDEX `UserBranchEdit_userId_branchId_key` TO `userbranchedit_userId_branchId_key`;

-- RenameIndex
ALTER TABLE `userrole` RENAME INDEX `UserRole_userId_roleId_key` TO `userrole_userId_roleId_key`;

-- RenameIndex
ALTER TABLE `userroleedit` RENAME INDEX `UserRoleEdit_userId_roleId_key` TO `userroleedit_userId_roleId_key`;
