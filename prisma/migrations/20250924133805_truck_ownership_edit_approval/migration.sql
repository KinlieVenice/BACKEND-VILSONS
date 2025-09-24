-- AlterTable
ALTER TABLE `truckownershipedit` ADD COLUMN `approvalStatus` ENUM('pending', 'published', 'rejected') NOT NULL DEFAULT 'pending';
