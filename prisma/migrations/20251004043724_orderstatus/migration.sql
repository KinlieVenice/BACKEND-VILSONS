-- AlterTable
ALTER TABLE `joborder` MODIFY `status` ENUM('pending', 'ongoing', 'completed', 'forRelease', 'archive') NOT NULL DEFAULT 'pending';

-- AlterTable
ALTER TABLE `joborderedit` MODIFY `status` ENUM('pending', 'ongoing', 'completed', 'forRelease', 'archive') NOT NULL DEFAULT 'pending';
