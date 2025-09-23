-- CreateTable
CREATE TABLE `User` (
    `id` VARCHAR(191) NOT NULL,
    `fullName` VARCHAR(100) NOT NULL,
    `username` VARCHAR(100) NOT NULL,
    `phone` VARCHAR(13) NOT NULL,
    `email` VARCHAR(100) NOT NULL,
    `hashPwd` VARCHAR(255) NOT NULL,
    `description` VARCHAR(191) NULL,
    `refreshToken` VARCHAR(191) NULL,
    `approvalStatus` ENUM('pending', 'published', 'rejected') NOT NULL DEFAULT 'published',
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `createdByUser` VARCHAR(191) NULL,
    `updatedAt` DATETIME(3) NOT NULL,
    `updatedByUser` VARCHAR(191) NULL,

    UNIQUE INDEX `User_username_key`(`username`),
    UNIQUE INDEX `User_email_key`(`email`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `UserEdit` (
    `id` VARCHAR(191) NOT NULL,
    `userId` VARCHAR(191) NULL,
    `fullName` VARCHAR(100) NOT NULL,
    `username` VARCHAR(100) NOT NULL,
    `phone` VARCHAR(13) NOT NULL,
    `email` VARCHAR(100) NOT NULL,
    `hashPwd` VARCHAR(255) NOT NULL,
    `description` VARCHAR(191) NULL,
    `requestType` ENUM('edit', 'delete', 'create') NOT NULL,
    `approvalStatus` ENUM('pending', 'published', 'rejected') NOT NULL DEFAULT 'pending',
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `createdByUser` VARCHAR(191) NULL,
    `updatedAt` DATETIME(3) NULL,
    `updatedByUser` VARCHAR(191) NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `Admin` (
    `id` VARCHAR(191) NOT NULL,
    `userId` VARCHAR(191) NOT NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `Customer` (
    `id` VARCHAR(191) NOT NULL,
    `userId` VARCHAR(191) NOT NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `Contractor` (
    `id` VARCHAR(191) NOT NULL,
    `userId` VARCHAR(191) NOT NULL,
    `commission` DECIMAL(13, 2) NOT NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `Employee` (
    `id` VARCHAR(191) NOT NULL,
    `userId` VARCHAR(191) NOT NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `Branch` (
    `id` VARCHAR(191) NOT NULL,
    `branchName` VARCHAR(100) NOT NULL,
    `description` VARCHAR(191) NULL,
    `address` VARCHAR(191) NOT NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `createdByUser` VARCHAR(191) NOT NULL,
    `updatedAt` DATETIME(3) NOT NULL,
    `updatedByUser` VARCHAR(191) NOT NULL,

    UNIQUE INDEX `Branch_branchName_key`(`branchName`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `BranchEdit` (
    `id` VARCHAR(191) NOT NULL,
    `branchId` VARCHAR(191) NULL,
    `branchName` VARCHAR(100) NOT NULL,
    `description` VARCHAR(191) NULL,
    `address` VARCHAR(191) NOT NULL,
    `requestType` ENUM('edit', 'delete', 'create') NOT NULL,
    `approvalStatus` ENUM('pending', 'published', 'rejected') NOT NULL DEFAULT 'pending',
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `createdByUser` VARCHAR(191) NOT NULL,
    `updatedAt` DATETIME(3) NULL,
    `updatedByUser` VARCHAR(191) NOT NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `Truck` (
    `id` VARCHAR(191) NOT NULL,
    `plate` VARCHAR(10) NOT NULL,
    `make` VARCHAR(20) NOT NULL,
    `model` VARCHAR(20) NOT NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `createdByUser` VARCHAR(191) NOT NULL,
    `updatedAt` DATETIME(3) NOT NULL,
    `updatedByUser` VARCHAR(191) NOT NULL,

    UNIQUE INDEX `Truck_plate_key`(`plate`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `TruckEdit` (
    `id` VARCHAR(191) NOT NULL,
    `truckId` VARCHAR(191) NULL,
    `plate` VARCHAR(10) NOT NULL,
    `make` VARCHAR(20) NOT NULL,
    `model` VARCHAR(20) NOT NULL,
    `approvalStatus` ENUM('pending', 'published', 'rejected') NOT NULL DEFAULT 'pending',
    `requestType` ENUM('edit', 'delete', 'create') NOT NULL DEFAULT 'create',
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `createdByUser` VARCHAR(191) NOT NULL,
    `updatedAt` DATETIME(3) NOT NULL,
    `updatedByUser` VARCHAR(191) NOT NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `TruckOwnership` (
    `id` VARCHAR(191) NOT NULL,
    `truckId` VARCHAR(191) NOT NULL,
    `customerId` VARCHAR(191) NOT NULL,
    `transferredByUser` VARCHAR(191) NOT NULL,
    `startDate` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `endDate` DATETIME(3) NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `ContractorPay` (
    `id` VARCHAR(191) NOT NULL,
    `contractorId` VARCHAR(191) NOT NULL,
    `type` ENUM('regular', 'advance') NOT NULL,
    `amount` DECIMAL(13, 2) NOT NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `createdByUser` VARCHAR(191) NOT NULL,
    `updatedAt` DATETIME(3) NOT NULL,
    `updatedByUser` VARCHAR(191) NOT NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `ContractorPayEdit` (
    `id` VARCHAR(191) NOT NULL,
    `contractorPayId` VARCHAR(191) NOT NULL,
    `contractorId` VARCHAR(191) NOT NULL,
    `type` ENUM('regular', 'advance') NOT NULL,
    `amount` DECIMAL(13, 2) NOT NULL,
    `requestType` ENUM('edit', 'delete', 'create') NOT NULL,
    `approvalStatus` ENUM('pending', 'published', 'rejected') NOT NULL DEFAULT 'pending',
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `createdByUser` VARCHAR(191) NOT NULL,
    `updatedAt` DATETIME(3) NOT NULL,
    `updatedByUser` VARCHAR(191) NOT NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `PayComponent` (
    `id` VARCHAR(191) NOT NULL,
    `payComponentName` VARCHAR(20) NOT NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `EmployeeSalary` (
    `id` VARCHAR(191) NOT NULL,
    `employeeId` VARCHAR(191) NOT NULL,
    `componentId` VARCHAR(191) NOT NULL,
    `type` ENUM('regular', 'advance') NOT NULL DEFAULT 'regular',
    `amount` DECIMAL(13, 2) NOT NULL,
    `approvalStatus` ENUM('pending', 'published', 'rejected') NOT NULL DEFAULT 'pending',
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `createdByUser` VARCHAR(191) NOT NULL,
    `updatedAt` DATETIME(3) NOT NULL,
    `updatedByUser` VARCHAR(191) NOT NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `EmployeeSalaryEdit` (
    `id` VARCHAR(191) NOT NULL,
    `employeeSalaryId` VARCHAR(191) NOT NULL,
    `componentId` VARCHAR(191) NOT NULL,
    `type` ENUM('regular', 'advance') NOT NULL DEFAULT 'regular',
    `amount` DECIMAL(13, 2) NOT NULL,
    `requestType` ENUM('edit', 'delete', 'create') NOT NULL,
    `approvalStatus` ENUM('pending', 'published', 'rejected') NOT NULL DEFAULT 'pending',
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `createdByUser` VARCHAR(191) NOT NULL,
    `updatedAt` DATETIME(3) NOT NULL,
    `updatedByUser` VARCHAR(191) NOT NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `ActivityLog` (
    `id` VARCHAR(191) NOT NULL,
    `userName` VARCHAR(191) NOT NULL,
    `activity` VARCHAR(255) NOT NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `Transaction` (
    `id` VARCHAR(191) NOT NULL,
    `jobOrderId` VARCHAR(191) NOT NULL,
    `transactionName` VARCHAR(100) NOT NULL,
    `mop` VARCHAR(20) NOT NULL,
    `amount` DECIMAL(13, 2) NOT NULL,
    `approvalStatus` ENUM('pending', 'published', 'rejected') NOT NULL DEFAULT 'pending',
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `createdByUser` VARCHAR(191) NOT NULL,
    `updatedAt` DATETIME(3) NOT NULL,
    `updatedByUser` VARCHAR(191) NOT NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `TransactionEdit` (
    `id` VARCHAR(191) NOT NULL,
    `transactionId` VARCHAR(191) NOT NULL,
    `transactionName` VARCHAR(100) NOT NULL,
    `mop` VARCHAR(20) NOT NULL,
    `amount` DECIMAL(13, 2) NOT NULL,
    `requestType` ENUM('edit', 'delete', 'create') NOT NULL,
    `approvalStatus` ENUM('pending', 'published', 'rejected') NOT NULL DEFAULT 'pending',
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `createdByUser` VARCHAR(191) NOT NULL,
    `updatedAt` DATETIME(3) NOT NULL,
    `updatedByUser` VARCHAR(191) NOT NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `OtherIncome` (
    `id` VARCHAR(191) NOT NULL,
    `description` VARCHAR(191) NOT NULL,
    `amount` DECIMAL(13, 2) NOT NULL,
    `branchId` VARCHAR(191) NOT NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `createdByUser` VARCHAR(191) NOT NULL,
    `updatedAt` DATETIME(3) NOT NULL,
    `updatedByUser` VARCHAR(191) NOT NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `OtherIncomeEdit` (
    `id` VARCHAR(191) NOT NULL,
    `otherIncomeId` VARCHAR(191) NULL,
    `description` VARCHAR(191) NOT NULL,
    `amount` DECIMAL(13, 2) NOT NULL,
    `branchId` VARCHAR(191) NOT NULL,
    `requestType` ENUM('edit', 'delete', 'create') NOT NULL,
    `approvalStatus` ENUM('pending', 'published', 'rejected') NOT NULL DEFAULT 'pending',
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `createdByUser` VARCHAR(191) NOT NULL,
    `updatedAt` DATETIME(3) NOT NULL,
    `updatedByUser` VARCHAR(191) NOT NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `Equipment` (
    `id` VARCHAR(191) NOT NULL,
    `equipmentName` VARCHAR(100) NOT NULL,
    `quantity` INTEGER NOT NULL,
    `price` DECIMAL(13, 2) NOT NULL,
    `branchId` VARCHAR(191) NOT NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `createdByUser` VARCHAR(191) NOT NULL,
    `updatedAt` DATETIME(3) NOT NULL,
    `updatedByUser` VARCHAR(191) NOT NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `EquipmentEdit` (
    `id` VARCHAR(191) NOT NULL,
    `equipmentId` VARCHAR(191) NULL,
    `equipmentName` VARCHAR(100) NOT NULL,
    `quantity` INTEGER NOT NULL,
    `price` DECIMAL(13, 2) NOT NULL,
    `branchId` VARCHAR(191) NOT NULL,
    `requestType` ENUM('edit', 'delete', 'create') NOT NULL,
    `approvalStatus` ENUM('pending', 'published', 'rejected') NOT NULL DEFAULT 'pending',
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `createdByUser` VARCHAR(191) NOT NULL,
    `updatedAt` DATETIME(3) NOT NULL,
    `updatedByUser` VARCHAR(191) NOT NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `Material` (
    `id` VARCHAR(191) NOT NULL,
    `jobOrderId` VARCHAR(191) NOT NULL,
    `materialName` VARCHAR(100) NOT NULL,
    `quantity` INTEGER NOT NULL,
    `price` DECIMAL(13, 2) NOT NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `MaterialEdit` (
    `id` VARCHAR(191) NOT NULL,
    `jobOrderId` VARCHAR(191) NULL,
    `materialName` VARCHAR(100) NOT NULL,
    `quantity` INTEGER NOT NULL,
    `price` DECIMAL(13, 2) NOT NULL,
    `requestType` ENUM('edit', 'delete', 'create') NOT NULL,
    `approvalStatus` ENUM('pending', 'published', 'rejected') NOT NULL DEFAULT 'pending',
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `JobOrder` (
    `id` VARCHAR(191) NOT NULL,
    `jobOrderCode` VARCHAR(191) NOT NULL,
    `truckId` VARCHAR(191) NOT NULL,
    `branchId` VARCHAR(191) NOT NULL,
    `customerId` VARCHAR(191) NOT NULL,
    `contractorId` VARCHAR(191) NULL,
    `status` ENUM('pending', 'ongoing', 'completed', 'forRelease') NOT NULL DEFAULT 'pending',
    `description` VARCHAR(191) NOT NULL,
    `labor` DECIMAL(13, 2) NULL,
    `contractorPercent` DECIMAL(13, 2) NULL,
    `completedAt` DATETIME(3) NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `createdByUser` VARCHAR(191) NOT NULL,
    `updatedAt` DATETIME(3) NOT NULL,
    `updatedByUser` VARCHAR(191) NOT NULL,

    UNIQUE INDEX `JobOrder_jobOrderCode_key`(`jobOrderCode`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `JobOrderEdit` (
    `id` VARCHAR(191) NOT NULL,
    `jobOrderId` VARCHAR(191) NULL,
    `jobOrderCode` VARCHAR(191) NULL,
    `branchId` VARCHAR(191) NOT NULL,
    `truckId` VARCHAR(191) NOT NULL,
    `customerId` VARCHAR(191) NOT NULL,
    `contractorId` VARCHAR(191) NULL,
    `status` ENUM('pending', 'ongoing', 'completed', 'forRelease') NOT NULL DEFAULT 'pending',
    `description` VARCHAR(191) NOT NULL,
    `labor` DECIMAL(13, 2) NULL,
    `contractorPercent` DECIMAL(13, 2) NULL,
    `completedAt` DATETIME(3) NULL,
    `requestType` ENUM('edit', 'delete', 'create') NOT NULL,
    `approvalStatus` ENUM('pending', 'published', 'rejected') NOT NULL DEFAULT 'pending',
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `createdByUser` VARCHAR(191) NOT NULL,
    `updatedAt` DATETIME(3) NOT NULL,
    `updatedByUser` VARCHAR(191) NOT NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `Overhead` (
    `id` VARCHAR(191) NOT NULL,
    `description` VARCHAR(191) NOT NULL,
    `amount` DECIMAL(13, 2) NOT NULL,
    `branchId` VARCHAR(191) NOT NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `createdByUser` VARCHAR(191) NOT NULL,
    `updatedAt` DATETIME(3) NOT NULL,
    `updatedByUser` VARCHAR(191) NOT NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `OverheadEdit` (
    `id` VARCHAR(191) NOT NULL,
    `overheadId` VARCHAR(191) NOT NULL,
    `description` VARCHAR(191) NOT NULL,
    `amount` DECIMAL(13, 2) NOT NULL,
    `branchId` VARCHAR(191) NOT NULL,
    `requestType` ENUM('edit', 'delete', 'create') NOT NULL,
    `approvalStatus` ENUM('pending', 'published', 'rejected') NOT NULL DEFAULT 'pending',
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `createdByUser` VARCHAR(191) NOT NULL,
    `updatedAt` DATETIME(3) NOT NULL,
    `updatedByUser` VARCHAR(191) NOT NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `UserRole` (
    `id` VARCHAR(191) NOT NULL,
    `userId` VARCHAR(191) NOT NULL,
    `roleId` VARCHAR(191) NOT NULL,

    UNIQUE INDEX `UserRole_userId_roleId_key`(`userId`, `roleId`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `UserRoleEdit` (
    `id` VARCHAR(191) NOT NULL,
    `userEditId` VARCHAR(191) NULL,
    `roleId` VARCHAR(191) NOT NULL,
    `approvalStatus` ENUM('pending', 'published', 'rejected') NOT NULL DEFAULT 'pending',

    UNIQUE INDEX `UserRoleEdit_userEditId_roleId_key`(`userEditId`, `roleId`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `Role` (
    `id` VARCHAR(191) NOT NULL,
    `roleName` VARCHAR(100) NOT NULL,
    `baseRoleId` VARCHAR(191) NULL,
    `isCustom` BOOLEAN NULL,
    `createdByUser` VARCHAR(191) NULL,

    UNIQUE INDEX `Role_roleName_key`(`roleName`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `Permission` (
    `id` VARCHAR(191) NOT NULL,
    `module` ENUM('Dashboard', 'Job Orders', 'Other Incomes', 'Transactions', 'Branches', 'Finances - Revenue and Profit', 'Finances - Operational - Materials', 'Finances - Operational - Equipment', 'Finances - Operational - Labor', 'Finances - Overhead', 'Trucks', 'Activity Logs', 'Users - All Users', 'Users - Roles and Permissions', 'My Dashboard', 'Assigned Orders', 'My Payout', 'My Orders', 'My Transactions', 'My Trucks', 'My Salary', 'Profile') NOT NULL,
    `permissionName` VARCHAR(100) NOT NULL,
    `method` ENUM('view', 'create', 'edit', 'delete') NOT NULL,
    `description` VARCHAR(191) NULL,

    UNIQUE INDEX `Permission_permissionName_key`(`permissionName`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `RolePermission` (
    `id` VARCHAR(191) NOT NULL,
    `roleId` VARCHAR(191) NOT NULL,
    `permissionId` VARCHAR(191) NOT NULL,
    `approval` BOOLEAN NOT NULL,

    UNIQUE INDEX `RolePermission_roleId_permissionId_key`(`roleId`, `permissionId`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `ApprovalLog` (
    `id` VARCHAR(191) NOT NULL,
    `module` ENUM('Dashboard', 'Job Orders', 'Other Incomes', 'Transactions', 'Branches', 'Finances - Revenue and Profit', 'Finances - Operational - Materials', 'Finances - Operational - Equipment', 'Finances - Operational - Labor', 'Finances - Overhead', 'Trucks', 'Activity Logs', 'Users - All Users', 'Users - Roles and Permissions', 'My Dashboard', 'Assigned Orders', 'My Payout', 'My Orders', 'My Transactions', 'My Trucks', 'My Salary', 'Profile') NOT NULL,
    `table` ENUM('Dashboard', 'Job Orders', 'Other_Incomes', 'Transactions', 'Revenue and Profit', 'Material Expenses', 'Equipment Expenses', 'Labor Expenses', 'Trucks', 'Activity Logs', 'All Users', 'Roles and Permissions', 'My Profile', 'My Dashboard', 'Assigned Orders', 'My Payout', 'My_Orders', 'My_Transactions', 'My_Trucks', 'My_Salary', 'Profile') NOT NULL,
    `moduleId` VARCHAR(191) NOT NULL,
    `requestComment` VARCHAR(191) NOT NULL,
    `responseComment` VARCHAR(191) NOT NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- AddForeignKey
ALTER TABLE `User` ADD CONSTRAINT `User_createdByUser_fkey` FOREIGN KEY (`createdByUser`) REFERENCES `User`(`username`) ON DELETE NO ACTION ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `User` ADD CONSTRAINT `User_updatedByUser_fkey` FOREIGN KEY (`updatedByUser`) REFERENCES `User`(`username`) ON DELETE NO ACTION ON UPDATE CASCADE;

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
ALTER TABLE `BranchEdit` ADD CONSTRAINT `BranchEdit_branchId_fkey` FOREIGN KEY (`branchId`) REFERENCES `Branch`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `BranchEdit` ADD CONSTRAINT `BranchEdit_createdByUser_fkey` FOREIGN KEY (`createdByUser`) REFERENCES `User`(`username`) ON DELETE NO ACTION ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `BranchEdit` ADD CONSTRAINT `BranchEdit_updatedByUser_fkey` FOREIGN KEY (`updatedByUser`) REFERENCES `User`(`username`) ON DELETE NO ACTION ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Truck` ADD CONSTRAINT `Truck_createdByUser_fkey` FOREIGN KEY (`createdByUser`) REFERENCES `User`(`username`) ON DELETE NO ACTION ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Truck` ADD CONSTRAINT `Truck_updatedByUser_fkey` FOREIGN KEY (`updatedByUser`) REFERENCES `User`(`username`) ON DELETE NO ACTION ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `TruckEdit` ADD CONSTRAINT `TruckEdit_truckId_fkey` FOREIGN KEY (`truckId`) REFERENCES `Truck`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `TruckEdit` ADD CONSTRAINT `TruckEdit_createdByUser_fkey` FOREIGN KEY (`createdByUser`) REFERENCES `User`(`username`) ON DELETE NO ACTION ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `TruckEdit` ADD CONSTRAINT `TruckEdit_updatedByUser_fkey` FOREIGN KEY (`updatedByUser`) REFERENCES `User`(`username`) ON DELETE NO ACTION ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `TruckOwnership` ADD CONSTRAINT `TruckOwnership_truckId_fkey` FOREIGN KEY (`truckId`) REFERENCES `Truck`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `TruckOwnership` ADD CONSTRAINT `TruckOwnership_customerId_fkey` FOREIGN KEY (`customerId`) REFERENCES `Customer`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `TruckOwnership` ADD CONSTRAINT `TruckOwnership_transferredByUser_fkey` FOREIGN KEY (`transferredByUser`) REFERENCES `User`(`username`) ON DELETE NO ACTION ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `ContractorPay` ADD CONSTRAINT `ContractorPay_contractorId_fkey` FOREIGN KEY (`contractorId`) REFERENCES `Contractor`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `ContractorPay` ADD CONSTRAINT `ContractorPay_createdByUser_fkey` FOREIGN KEY (`createdByUser`) REFERENCES `User`(`username`) ON DELETE NO ACTION ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `ContractorPay` ADD CONSTRAINT `ContractorPay_updatedByUser_fkey` FOREIGN KEY (`updatedByUser`) REFERENCES `User`(`username`) ON DELETE NO ACTION ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `ContractorPayEdit` ADD CONSTRAINT `ContractorPayEdit_contractorId_fkey` FOREIGN KEY (`contractorId`) REFERENCES `Contractor`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `ContractorPayEdit` ADD CONSTRAINT `ContractorPayEdit_createdByUser_fkey` FOREIGN KEY (`createdByUser`) REFERENCES `User`(`username`) ON DELETE NO ACTION ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `ContractorPayEdit` ADD CONSTRAINT `ContractorPayEdit_updatedByUser_fkey` FOREIGN KEY (`updatedByUser`) REFERENCES `User`(`username`) ON DELETE NO ACTION ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `ContractorPayEdit` ADD CONSTRAINT `ContractorPayEdit_contractorPayId_fkey` FOREIGN KEY (`contractorPayId`) REFERENCES `ContractorPay`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `EmployeeSalary` ADD CONSTRAINT `EmployeeSalary_componentId_fkey` FOREIGN KEY (`componentId`) REFERENCES `PayComponent`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `EmployeeSalary` ADD CONSTRAINT `EmployeeSalary_employeeId_fkey` FOREIGN KEY (`employeeId`) REFERENCES `Employee`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `EmployeeSalary` ADD CONSTRAINT `EmployeeSalary_createdByUser_fkey` FOREIGN KEY (`createdByUser`) REFERENCES `User`(`username`) ON DELETE NO ACTION ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `EmployeeSalary` ADD CONSTRAINT `EmployeeSalary_updatedByUser_fkey` FOREIGN KEY (`updatedByUser`) REFERENCES `User`(`username`) ON DELETE NO ACTION ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `EmployeeSalaryEdit` ADD CONSTRAINT `EmployeeSalaryEdit_componentId_fkey` FOREIGN KEY (`componentId`) REFERENCES `PayComponent`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `EmployeeSalaryEdit` ADD CONSTRAINT `EmployeeSalaryEdit_createdByUser_fkey` FOREIGN KEY (`createdByUser`) REFERENCES `User`(`username`) ON DELETE NO ACTION ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `EmployeeSalaryEdit` ADD CONSTRAINT `EmployeeSalaryEdit_updatedByUser_fkey` FOREIGN KEY (`updatedByUser`) REFERENCES `User`(`username`) ON DELETE NO ACTION ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `EmployeeSalaryEdit` ADD CONSTRAINT `EmployeeSalaryEdit_employeeSalaryId_fkey` FOREIGN KEY (`employeeSalaryId`) REFERENCES `EmployeeSalary`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `ActivityLog` ADD CONSTRAINT `ActivityLog_userName_fkey` FOREIGN KEY (`userName`) REFERENCES `User`(`id`) ON DELETE NO ACTION ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Transaction` ADD CONSTRAINT `Transaction_jobOrderId_fkey` FOREIGN KEY (`jobOrderId`) REFERENCES `JobOrder`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Transaction` ADD CONSTRAINT `Transaction_createdByUser_fkey` FOREIGN KEY (`createdByUser`) REFERENCES `User`(`username`) ON DELETE NO ACTION ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Transaction` ADD CONSTRAINT `Transaction_updatedByUser_fkey` FOREIGN KEY (`updatedByUser`) REFERENCES `User`(`username`) ON DELETE NO ACTION ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `TransactionEdit` ADD CONSTRAINT `TransactionEdit_transactionId_fkey` FOREIGN KEY (`transactionId`) REFERENCES `Transaction`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `TransactionEdit` ADD CONSTRAINT `TransactionEdit_createdByUser_fkey` FOREIGN KEY (`createdByUser`) REFERENCES `User`(`username`) ON DELETE NO ACTION ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `TransactionEdit` ADD CONSTRAINT `TransactionEdit_updatedByUser_fkey` FOREIGN KEY (`updatedByUser`) REFERENCES `User`(`username`) ON DELETE NO ACTION ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `OtherIncome` ADD CONSTRAINT `OtherIncome_branchId_fkey` FOREIGN KEY (`branchId`) REFERENCES `Branch`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `OtherIncome` ADD CONSTRAINT `OtherIncome_createdByUser_fkey` FOREIGN KEY (`createdByUser`) REFERENCES `User`(`username`) ON DELETE NO ACTION ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `OtherIncome` ADD CONSTRAINT `OtherIncome_updatedByUser_fkey` FOREIGN KEY (`updatedByUser`) REFERENCES `User`(`username`) ON DELETE NO ACTION ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `OtherIncomeEdit` ADD CONSTRAINT `OtherIncomeEdit_branchId_fkey` FOREIGN KEY (`branchId`) REFERENCES `Branch`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `OtherIncomeEdit` ADD CONSTRAINT `OtherIncomeEdit_otherIncomeId_fkey` FOREIGN KEY (`otherIncomeId`) REFERENCES `OtherIncome`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `OtherIncomeEdit` ADD CONSTRAINT `OtherIncomeEdit_createdByUser_fkey` FOREIGN KEY (`createdByUser`) REFERENCES `User`(`username`) ON DELETE NO ACTION ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `OtherIncomeEdit` ADD CONSTRAINT `OtherIncomeEdit_updatedByUser_fkey` FOREIGN KEY (`updatedByUser`) REFERENCES `User`(`username`) ON DELETE NO ACTION ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Equipment` ADD CONSTRAINT `Equipment_branchId_fkey` FOREIGN KEY (`branchId`) REFERENCES `Branch`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Equipment` ADD CONSTRAINT `Equipment_createdByUser_fkey` FOREIGN KEY (`createdByUser`) REFERENCES `User`(`username`) ON DELETE NO ACTION ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Equipment` ADD CONSTRAINT `Equipment_updatedByUser_fkey` FOREIGN KEY (`updatedByUser`) REFERENCES `User`(`username`) ON DELETE NO ACTION ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `EquipmentEdit` ADD CONSTRAINT `EquipmentEdit_branchId_fkey` FOREIGN KEY (`branchId`) REFERENCES `Branch`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `EquipmentEdit` ADD CONSTRAINT `EquipmentEdit_equipmentId_fkey` FOREIGN KEY (`equipmentId`) REFERENCES `Equipment`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `EquipmentEdit` ADD CONSTRAINT `EquipmentEdit_createdByUser_fkey` FOREIGN KEY (`createdByUser`) REFERENCES `User`(`username`) ON DELETE NO ACTION ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `EquipmentEdit` ADD CONSTRAINT `EquipmentEdit_updatedByUser_fkey` FOREIGN KEY (`updatedByUser`) REFERENCES `User`(`username`) ON DELETE NO ACTION ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Material` ADD CONSTRAINT `Material_jobOrderId_fkey` FOREIGN KEY (`jobOrderId`) REFERENCES `JobOrder`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `MaterialEdit` ADD CONSTRAINT `MaterialEdit_jobOrderId_fkey` FOREIGN KEY (`jobOrderId`) REFERENCES `JobOrder`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `JobOrder` ADD CONSTRAINT `JobOrder_truckId_fkey` FOREIGN KEY (`truckId`) REFERENCES `Truck`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `JobOrder` ADD CONSTRAINT `JobOrder_branchId_fkey` FOREIGN KEY (`branchId`) REFERENCES `Branch`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `JobOrder` ADD CONSTRAINT `JobOrder_contractorId_fkey` FOREIGN KEY (`contractorId`) REFERENCES `Contractor`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `JobOrder` ADD CONSTRAINT `JobOrder_customerId_fkey` FOREIGN KEY (`customerId`) REFERENCES `Customer`(`id`) ON DELETE NO ACTION ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `JobOrder` ADD CONSTRAINT `JobOrder_createdByUser_fkey` FOREIGN KEY (`createdByUser`) REFERENCES `User`(`username`) ON DELETE NO ACTION ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `JobOrder` ADD CONSTRAINT `JobOrder_updatedByUser_fkey` FOREIGN KEY (`updatedByUser`) REFERENCES `User`(`username`) ON DELETE NO ACTION ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `JobOrderEdit` ADD CONSTRAINT `JobOrderEdit_branchId_fkey` FOREIGN KEY (`branchId`) REFERENCES `Branch`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `JobOrderEdit` ADD CONSTRAINT `JobOrderEdit_jobOrderId_fkey` FOREIGN KEY (`jobOrderId`) REFERENCES `JobOrder`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `JobOrderEdit` ADD CONSTRAINT `JobOrderEdit_truckId_fkey` FOREIGN KEY (`truckId`) REFERENCES `Truck`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `JobOrderEdit` ADD CONSTRAINT `JobOrderEdit_contractorId_fkey` FOREIGN KEY (`contractorId`) REFERENCES `Contractor`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `JobOrderEdit` ADD CONSTRAINT `JobOrderEdit_customerId_fkey` FOREIGN KEY (`customerId`) REFERENCES `Customer`(`id`) ON DELETE NO ACTION ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `JobOrderEdit` ADD CONSTRAINT `JobOrderEdit_createdByUser_fkey` FOREIGN KEY (`createdByUser`) REFERENCES `User`(`username`) ON DELETE NO ACTION ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `JobOrderEdit` ADD CONSTRAINT `JobOrderEdit_updatedByUser_fkey` FOREIGN KEY (`updatedByUser`) REFERENCES `User`(`username`) ON DELETE NO ACTION ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Overhead` ADD CONSTRAINT `Overhead_branchId_fkey` FOREIGN KEY (`branchId`) REFERENCES `Branch`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Overhead` ADD CONSTRAINT `Overhead_createdByUser_fkey` FOREIGN KEY (`createdByUser`) REFERENCES `User`(`username`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Overhead` ADD CONSTRAINT `Overhead_updatedByUser_fkey` FOREIGN KEY (`updatedByUser`) REFERENCES `User`(`username`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `OverheadEdit` ADD CONSTRAINT `OverheadEdit_branchId_fkey` FOREIGN KEY (`branchId`) REFERENCES `Branch`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `OverheadEdit` ADD CONSTRAINT `OverheadEdit_overheadId_fkey` FOREIGN KEY (`overheadId`) REFERENCES `Overhead`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

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
