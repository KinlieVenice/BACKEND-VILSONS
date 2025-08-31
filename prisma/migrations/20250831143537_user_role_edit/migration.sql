-- AlterTable
ALTER TABLE `branch` MODIFY `approvalStatus` ENUM('pending', 'published', 'rejected') NOT NULL DEFAULT 'pending';

-- AlterTable
ALTER TABLE `branchedit` MODIFY `approvalStatus` ENUM('pending', 'published', 'rejected') NOT NULL DEFAULT 'pending';

-- AlterTable
ALTER TABLE `contractorpay` MODIFY `approvalStatus` ENUM('pending', 'published', 'rejected') NOT NULL DEFAULT 'pending';

-- AlterTable
ALTER TABLE `contractorpayedit` MODIFY `approvalStatus` ENUM('pending', 'published', 'rejected') NOT NULL DEFAULT 'pending';

-- AlterTable
ALTER TABLE `employeesalary` MODIFY `approvalStatus` ENUM('pending', 'published', 'rejected') NOT NULL DEFAULT 'pending';

-- AlterTable
ALTER TABLE `employeesalaryedit` MODIFY `approvalStatus` ENUM('pending', 'published', 'rejected') NOT NULL DEFAULT 'pending';

-- AlterTable
ALTER TABLE `equipment` MODIFY `approvalStatus` ENUM('pending', 'published', 'rejected') NOT NULL DEFAULT 'pending';

-- AlterTable
ALTER TABLE `equipmentedit` MODIFY `approvalStatus` ENUM('pending', 'published', 'rejected') NOT NULL DEFAULT 'pending';

-- AlterTable
ALTER TABLE `joborder` MODIFY `approvalStatus` ENUM('pending', 'published', 'rejected') NOT NULL DEFAULT 'pending';

-- AlterTable
ALTER TABLE `joborderedit` MODIFY `approvalStatus` ENUM('pending', 'published', 'rejected') NOT NULL DEFAULT 'pending';

-- AlterTable
ALTER TABLE `otherincome` MODIFY `approvalStatus` ENUM('pending', 'published', 'rejected') NOT NULL DEFAULT 'pending';

-- AlterTable
ALTER TABLE `overhead` MODIFY `approvalStatus` ENUM('pending', 'published', 'rejected') NOT NULL DEFAULT 'pending';

-- AlterTable
ALTER TABLE `overheadedit` MODIFY `approvalStatus` ENUM('pending', 'published', 'rejected') NOT NULL DEFAULT 'pending';

-- AlterTable
ALTER TABLE `transaction` MODIFY `approvalStatus` ENUM('pending', 'published', 'rejected') NOT NULL DEFAULT 'pending';

-- AlterTable
ALTER TABLE `transactionedit` MODIFY `approvalStatus` ENUM('pending', 'published', 'rejected') NOT NULL DEFAULT 'pending';

-- AlterTable
ALTER TABLE `useredit` MODIFY `approvalStatus` ENUM('pending', 'published', 'rejected') NOT NULL DEFAULT 'pending';

-- CreateTable
CREATE TABLE `UserRoleEdit` (
    `id` VARCHAR(191) NOT NULL,
    `userId` VARCHAR(191) NOT NULL,
    `roleId` VARCHAR(191) NOT NULL,
    `approvalStatus` ENUM('pending', 'published', 'rejected') NOT NULL DEFAULT 'pending',

    UNIQUE INDEX `UserRoleEdit_userId_roleId_key`(`userId`, `roleId`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- AddForeignKey
ALTER TABLE `UserRoleEdit` ADD CONSTRAINT `UserRoleEdit_userId_fkey` FOREIGN KEY (`userId`) REFERENCES `UserEdit`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `UserRoleEdit` ADD CONSTRAINT `UserRoleEdit_roleId_fkey` FOREIGN KEY (`roleId`) REFERENCES `Role`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;
