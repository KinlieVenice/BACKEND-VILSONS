-- CreateTable
CREATE TABLE `MaterialEdit` (
    `id` VARCHAR(191) NOT NULL,
    `jobOrderId` VARCHAR(191) NULL,
    `materialName` VARCHAR(100) NOT NULL,
    `quantity` INTEGER NOT NULL,
    `price` DECIMAL(13, 2) NOT NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- AddForeignKey
ALTER TABLE `MaterialEdit` ADD CONSTRAINT `MaterialEdit_jobOrderId_fkey` FOREIGN KEY (`jobOrderId`) REFERENCES `JobOrder`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;
