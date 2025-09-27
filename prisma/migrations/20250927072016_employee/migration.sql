-- AlterTable
ALTER TABLE `employeepay` ADD COLUMN `type` ENUM('regular', 'advance') NOT NULL DEFAULT 'regular';
