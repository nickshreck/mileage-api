-- DropForeignKey
ALTER TABLE `Trip` DROP FOREIGN KEY `Trip_endLocation_fkey`;

-- DropForeignKey
ALTER TABLE `Trip` DROP FOREIGN KEY `Trip_startLocation_fkey`;

-- DropForeignKey
ALTER TABLE `Trip` DROP FOREIGN KEY `Trip_user_fkey`;

-- AlterTable
ALTER TABLE `Trip` ADD COLUMN `classification` VARCHAR(191) NOT NULL DEFAULT 'unclassified';
