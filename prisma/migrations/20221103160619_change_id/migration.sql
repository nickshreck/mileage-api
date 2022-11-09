/*
  Warnings:

  - You are about to drop the column `endLocationId` on the `Trip` table. All the data in the column will be lost.
  - You are about to drop the column `startLocationId` on the `Trip` table. All the data in the column will be lost.
  - You are about to drop the column `userId` on the `Trip` table. All the data in the column will be lost.
  - Added the required column `endLocation` to the `Trip` table without a default value. This is not possible if the table is not empty.
  - Added the required column `startLocation` to the `Trip` table without a default value. This is not possible if the table is not empty.
  - Added the required column `user` to the `Trip` table without a default value. This is not possible if the table is not empty.

*/
-- DropForeignKey
ALTER TABLE `Trip` DROP FOREIGN KEY `Trip_endLocationId_fkey`;

-- DropForeignKey
ALTER TABLE `Trip` DROP FOREIGN KEY `Trip_startLocationId_fkey`;

-- DropForeignKey
ALTER TABLE `Trip` DROP FOREIGN KEY `Trip_userId_fkey`;

-- AlterTable
ALTER TABLE `Trip` DROP COLUMN `endLocationId`,
    DROP COLUMN `startLocationId`,
    DROP COLUMN `userId`,
    ADD COLUMN `endLocation` VARCHAR(191) NOT NULL,
    ADD COLUMN `startLocation` VARCHAR(191) NOT NULL,
    ADD COLUMN `user` VARCHAR(191) NOT NULL;

-- CreateIndex
CREATE INDEX `Trip_endLocationId_fkey` ON `Trip`(`endLocation`);

-- CreateIndex
CREATE INDEX `Trip_startLocationId_fkey` ON `Trip`(`startLocation`);

-- CreateIndex
CREATE INDEX `Trip_userId_fkey` ON `Trip`(`user`);

-- AddForeignKey
ALTER TABLE `Trip` ADD CONSTRAINT `Trip_endLocation_fkey` FOREIGN KEY (`endLocation`) REFERENCES `Location`(`placeId`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Trip` ADD CONSTRAINT `Trip_startLocation_fkey` FOREIGN KEY (`startLocation`) REFERENCES `Location`(`placeId`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Trip` ADD CONSTRAINT `Trip_user_fkey` FOREIGN KEY (`user`) REFERENCES `User`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;
