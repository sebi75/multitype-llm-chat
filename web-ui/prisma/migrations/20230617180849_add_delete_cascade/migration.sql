-- DropForeignKey
ALTER TABLE `Messages` DROP FOREIGN KEY `Messages_chatId_fkey`;

-- DropForeignKey
ALTER TABLE `Objects` DROP FOREIGN KEY `Objects_chatId_fkey`;

-- AddForeignKey
ALTER TABLE `Messages` ADD CONSTRAINT `Messages_chatId_fkey` FOREIGN KEY (`chatId`) REFERENCES `Chat`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Objects` ADD CONSTRAINT `Objects_chatId_fkey` FOREIGN KEY (`chatId`) REFERENCES `Chat`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;
