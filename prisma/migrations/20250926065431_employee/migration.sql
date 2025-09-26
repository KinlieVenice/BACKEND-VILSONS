/*
  Warnings:

  - Added the required column `employeeId` to the `EmployeeSalaryEdit` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE `employeesalaryedit` ADD COLUMN `employeeId` VARCHAR(191) NOT NULL;

-- AddForeignKey
ALTER TABLE `EmployeeSalaryEdit` ADD CONSTRAINT `EmployeeSalaryEdit_employeeId_fkey` FOREIGN KEY (`employeeId`) REFERENCES `Employee`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;
