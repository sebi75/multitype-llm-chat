/*
  Warnings:

  - Added the required column `text` to the `Messages` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE `Messages` ADD COLUMN `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    ADD COLUMN `role` ENUM('user', 'assistant') NOT NULL DEFAULT 'user',
    ADD COLUMN `text` VARCHAR(191) NOT NULL;
