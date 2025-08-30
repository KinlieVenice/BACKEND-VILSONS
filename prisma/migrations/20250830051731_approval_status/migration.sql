-- AlterTable
ALTER TABLE `role` MODIFY `approvalStatus` ENUM('pending', 'published', 'rejected') NOT NULL DEFAULT 'published';
