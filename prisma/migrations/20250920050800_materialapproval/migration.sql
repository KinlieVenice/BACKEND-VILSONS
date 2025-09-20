-- AlterTable
ALTER TABLE `materialedit` ADD COLUMN `approvalStatus` ENUM('pending', 'published', 'rejected') NOT NULL DEFAULT 'pending';
