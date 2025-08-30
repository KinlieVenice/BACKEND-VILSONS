/*
  Warnings:

  - You are about to alter the column `module` on the `permission` table. The data in that column could be lost. The data in that column will be cast from `VarChar(100)` to `Enum(EnumId(35))`.

*/
-- AlterTable
ALTER TABLE `permission` MODIFY `module` ENUM('Job Orders', 'Other_Income', 'Transaction', 'Finances - Revenue and Profit', 'Finances - Operational - Material', 'Finances - Operational - Equipment', 'Finances - Operational - Labor', 'Finances - Overhead', 'Trucks', 'Activity Logs', 'Users - All Users', 'Users - Roles and Permissions') NOT NULL;
