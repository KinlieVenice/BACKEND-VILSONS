-- DropIndex
DROP INDEX `JobOrderEdit_jobOrderCode_key` ON `joborderedit`;

-- AlterTable
ALTER TABLE `joborder` MODIFY `status` ENUM('unassigned', 'ongoing', 'completed', 'forRelease') NOT NULL DEFAULT 'unassigned';

-- AlterTable
ALTER TABLE `joborderedit` MODIFY `status` ENUM('unassigned', 'ongoing', 'completed', 'forRelease') NOT NULL DEFAULT 'unassigned';
