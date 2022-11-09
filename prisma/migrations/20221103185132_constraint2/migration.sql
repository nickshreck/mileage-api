/*
  Warnings:

  - A unique constraint covering the columns `[user,startTime]` on the table `Trip` will be added. If there are existing duplicate values, this will fail.

*/
-- DropIndex
DROP INDEX `Trip_id_startTime_key` ON `Trip`;

-- CreateIndex
CREATE UNIQUE INDEX `Trip_user_startTime_key` ON `Trip`(`user`, `startTime`);
