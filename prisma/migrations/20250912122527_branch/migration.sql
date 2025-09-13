-- DropForeignKey
ALTER TABLE `branchedit` DROP FOREIGN KEY `BranchEdit_branchId_fkey`;

-- DropIndex
DROP INDEX `BranchEdit_branchId_fkey` ON `branchedit`;

-- AlterTable
ALTER TABLE `branchedit` MODIFY `branchId` VARCHAR(191) NULL;

-- AddForeignKey
ALTER TABLE `BranchEdit` ADD CONSTRAINT `BranchEdit_branchId_fkey` FOREIGN KEY (`branchId`) REFERENCES `Branch`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;
