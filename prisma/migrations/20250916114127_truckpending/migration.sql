-- AlterTable
ALTER TABLE `truckedit` ADD COLUMN `approvalStatus` ENUM('pending', 'published', 'rejected') NOT NULL DEFAULT 'pending';
