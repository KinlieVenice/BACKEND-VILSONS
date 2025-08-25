-- AlterTable
ALTER TABLE `userversion` MODIFY `approvalStatus` ENUM('pending', 'approved', 'published', 'rejected') NOT NULL DEFAULT 'pending';
