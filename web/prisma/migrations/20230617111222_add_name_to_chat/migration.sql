/*
  Warnings:

  - Added the required column `name` to the `Chat` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE `Chat` ADD COLUMN `name` VARCHAR(191) NOT NULL;
