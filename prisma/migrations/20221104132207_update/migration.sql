/*
  Warnings:

  - Added the required column `month` to the `Trip` table without a default value. This is not possible if the table is not empty.
  - Added the required column `year` to the `Trip` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE `Trip` ADD COLUMN `month` INTEGER NOT NULL,
    ADD COLUMN `year` INTEGER NOT NULL;
