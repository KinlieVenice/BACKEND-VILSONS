-- CreateTable
CREATE TABLE `joborderimage` (
    `id` VARCHAR(191) NOT NULL,
    `jobOrderId` VARCHAR(191) NOT NULL,
    `type` ENUM('before', 'after') NOT NULL,
    `filename` VARCHAR(191) NOT NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- AddForeignKey
ALTER TABLE `joborderimage` ADD CONSTRAINT `joborderimage_jobOrderId_fkey` FOREIGN KEY (`jobOrderId`) REFERENCES `joborder`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;
