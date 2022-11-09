/*
  Warnings:

  - You are about to drop the column `userId` on the `Location` table. All the data in the column will be lost.

*/
-- DropIndex
DROP INDEX `Location_userId_fkey` ON `Location`;

-- AlterTable
ALTER TABLE `Location` DROP COLUMN `userId`;
