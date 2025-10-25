-- AlterTable
ALTER TABLE `user` MODIFY `email` VARCHAR(100) NULL,
    MODIFY `status` ENUM('active', 'inactive') NULL DEFAULT 'active';
