/*
  Warnings:

  - The primary key for the `Location` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - You are about to drop the column `id` on the `Location` table. All the data in the column will be lost.
  - The primary key for the `Trip` table will be changed. If it partially fails, the table could be left without primary key constraint.

*/
-- DropForeignKey
ALTER TABLE `Trip` DROP FOREIGN KEY `Trip_endLocationId_fkey`;

-- DropForeignKey
ALTER TABLE `Trip` DROP FOREIGN KEY `Trip_startLocationId_fkey`;

-- AlterTable
ALTER TABLE `Location` DROP PRIMARY KEY,
    DROP COLUMN `id`,
    ADD PRIMARY KEY (`placeId`);

-- AlterTable
ALTER TABLE `Trip` DROP PRIMARY KEY,
    MODIFY `id` VARCHAR(191) NOT NULL,
    MODIFY `startLocationId` VARCHAR(191) NOT NULL,
    MODIFY `endLocationId` VARCHAR(191) NOT NULL,
    ADD PRIMARY KEY (`id`);

-- AddForeignKey
ALTER TABLE `Trip` ADD CONSTRAINT `Trip_startLocationId_fkey` FOREIGN KEY (`startLocationId`) REFERENCES `Location`(`placeId`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Trip` ADD CONSTRAINT `Trip_endLocationId_fkey` FOREIGN KEY (`endLocationId`) REFERENCES `Location`(`placeId`) ON DELETE RESTRICT ON UPDATE CASCADE;
