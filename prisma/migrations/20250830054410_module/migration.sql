/*
  Warnings:

  - The values [Other_Income] on the enum `ApprovalLog_module` will be removed. If these variants are still used in the database, this will fail.
  - The values [Other_Income] on the enum `ApprovalLog_module` will be removed. If these variants are still used in the database, this will fail.

*/
-- AlterTable
ALTER TABLE `approvallog` MODIFY `module` ENUM('Dashboard', 'Job Orders', 'Other Income', 'Transaction', 'Finances - Revenue and Profit', 'Finances - Operational - Material', 'Finances - Operational - Equipment', 'Finances - Operational - Labor', 'Finances - Overhead', 'Trucks', 'Activity Logs', 'Users - All Users', 'Users - Roles and Permissions', 'My Dashboard', 'Assigned Orders', 'My Payout', 'My Orders', 'My Transactions', 'My Trucks', 'My Salary', 'Profile') NOT NULL;

-- AlterTable
ALTER TABLE `permission` MODIFY `module` ENUM('Dashboard', 'Job Orders', 'Other Income', 'Transaction', 'Finances - Revenue and Profit', 'Finances - Operational - Material', 'Finances - Operational - Equipment', 'Finances - Operational - Labor', 'Finances - Overhead', 'Trucks', 'Activity Logs', 'Users - All Users', 'Users - Roles and Permissions', 'My Dashboard', 'Assigned Orders', 'My Payout', 'My Orders', 'My Transactions', 'My Trucks', 'My Salary', 'Profile') NOT NULL;
