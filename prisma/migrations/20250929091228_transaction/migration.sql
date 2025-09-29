/*
  Warnings:

  - You are about to drop the column `approvalStatus` on the `transaction` table. All the data in the column will be lost.
  - You are about to drop the column `jobOrderId` on the `transaction` table. All the data in the column will be lost.
  - You are about to drop the column `transactionName` on the `transaction` table. All the data in the column will be lost.
  - You are about to drop the `transactionedit` table. If the table is not empty, all the data it contains will be lost.
  - A unique constraint covering the columns `[sessionId]` on the table `Transaction` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `email` to the `Transaction` table without a default value. This is not possible if the table is not empty.
  - Added the required column `jobOrderCode` to the `Transaction` table without a default value. This is not possible if the table is not empty.
  - Added the required column `senderName` to the `Transaction` table without a default value. This is not possible if the table is not empty.
  - Added the required column `sessionId` to the `Transaction` table without a default value. This is not possible if the table is not empty.

*/
-- DropForeignKey
ALTER TABLE `transaction` DROP FOREIGN KEY `Transaction_jobOrderId_fkey`;

-- DropForeignKey
ALTER TABLE `transactionedit` DROP FOREIGN KEY `TransactionEdit_createdByUser_fkey`;

-- DropForeignKey
ALTER TABLE `transactionedit` DROP FOREIGN KEY `TransactionEdit_transactionId_fkey`;

-- DropForeignKey
ALTER TABLE `transactionedit` DROP FOREIGN KEY `TransactionEdit_updatedByUser_fkey`;

-- DropIndex
DROP INDEX `Transaction_jobOrderId_fkey` ON `transaction`;

-- AlterTable
ALTER TABLE `transaction` DROP COLUMN `approvalStatus`,
    DROP COLUMN `jobOrderId`,
    DROP COLUMN `transactionName`,
    ADD COLUMN `email` VARCHAR(191) NOT NULL,
    ADD COLUMN `jobOrderCode` VARCHAR(191) NOT NULL,
    ADD COLUMN `referenceNumber` VARCHAR(191) NULL,
    ADD COLUMN `senderName` VARCHAR(100) NOT NULL,
    ADD COLUMN `sessionId` VARCHAR(191) NOT NULL,
    ADD COLUMN `status` VARCHAR(191) NOT NULL DEFAULT 'pending',
    MODIFY `mop` VARCHAR(20) NULL,
    MODIFY `createdByUser` VARCHAR(191) NULL,
    MODIFY `updatedByUser` VARCHAR(191) NULL;

-- DropTable
DROP TABLE `transactionedit`;

-- CreateTable
CREATE TABLE `TransactionZ` (
    `id` VARCHAR(191) NOT NULL,
    `jobOrderId` VARCHAR(191) NOT NULL,
    `transactionName` VARCHAR(100) NOT NULL,
    `mop` VARCHAR(20) NOT NULL,
    `amount` DECIMAL(13, 2) NOT NULL,
    `approvalStatus` ENUM('pending', 'published', 'rejected') NOT NULL DEFAULT 'pending',
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `createdByUser` VARCHAR(191) NOT NULL,
    `updatedAt` DATETIME(3) NOT NULL,
    `updatedByUser` VARCHAR(191) NOT NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `TransactionEditZ` (
    `id` VARCHAR(191) NOT NULL,
    `transactionId` VARCHAR(191) NOT NULL,
    `transactionName` VARCHAR(100) NOT NULL,
    `mop` VARCHAR(20) NOT NULL,
    `amount` DECIMAL(13, 2) NOT NULL,
    `requestType` ENUM('edit', 'delete', 'create') NOT NULL,
    `approvalStatus` ENUM('pending', 'published', 'rejected') NOT NULL DEFAULT 'pending',
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `createdByUser` VARCHAR(191) NOT NULL,
    `updatedAt` DATETIME(3) NOT NULL,
    `updatedByUser` VARCHAR(191) NOT NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateIndex
CREATE UNIQUE INDEX `Transaction_sessionId_key` ON `Transaction`(`sessionId`);

-- AddForeignKey
ALTER TABLE `TransactionZ` ADD CONSTRAINT `TransactionZ_jobOrderId_fkey` FOREIGN KEY (`jobOrderId`) REFERENCES `JobOrder`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `TransactionZ` ADD CONSTRAINT `TransactionZ_createdByUser_fkey` FOREIGN KEY (`createdByUser`) REFERENCES `User`(`username`) ON DELETE NO ACTION ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `TransactionZ` ADD CONSTRAINT `TransactionZ_updatedByUser_fkey` FOREIGN KEY (`updatedByUser`) REFERENCES `User`(`username`) ON DELETE NO ACTION ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `TransactionEditZ` ADD CONSTRAINT `TransactionEditZ_transactionId_fkey` FOREIGN KEY (`transactionId`) REFERENCES `TransactionZ`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `TransactionEditZ` ADD CONSTRAINT `TransactionEditZ_createdByUser_fkey` FOREIGN KEY (`createdByUser`) REFERENCES `User`(`username`) ON DELETE NO ACTION ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `TransactionEditZ` ADD CONSTRAINT `TransactionEditZ_updatedByUser_fkey` FOREIGN KEY (`updatedByUser`) REFERENCES `User`(`username`) ON DELETE NO ACTION ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Transaction` ADD CONSTRAINT `Transaction_jobOrderCode_fkey` FOREIGN KEY (`jobOrderCode`) REFERENCES `JobOrder`(`jobOrderCode`) ON DELETE RESTRICT ON UPDATE CASCADE;
