-- AlterTable
ALTER TABLE `branchedit` MODIFY `requestType` ENUM('edit', 'delete', 'create') NOT NULL;

-- AlterTable
ALTER TABLE `contractorpayedit` MODIFY `requestType` ENUM('edit', 'delete', 'create') NOT NULL;

-- AlterTable
ALTER TABLE `employeesalaryedit` MODIFY `requestType` ENUM('edit', 'delete', 'create') NOT NULL;

-- AlterTable
ALTER TABLE `equipmentedit` MODIFY `requestType` ENUM('edit', 'delete', 'create') NOT NULL;

-- AlterTable
ALTER TABLE `joborderedit` MODIFY `requestType` ENUM('edit', 'delete', 'create') NOT NULL;

-- AlterTable
ALTER TABLE `overheadedit` MODIFY `requestType` ENUM('edit', 'delete', 'create') NOT NULL;

-- AlterTable
ALTER TABLE `transactionedit` MODIFY `requestType` ENUM('edit', 'delete', 'create') NOT NULL;

-- AlterTable
ALTER TABLE `useredit` MODIFY `requestType` ENUM('edit', 'delete', 'create') NOT NULL;
