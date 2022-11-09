/*
  Warnings:

  - A unique constraint covering the columns `[startTime]` on the table `Trip` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[endTime]` on the table `Trip` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[id,startTime]` on the table `Trip` will be added. If there are existing duplicate values, this will fail.

*/
-- CreateIndex
CREATE UNIQUE INDEX `Trip_startTime_key` ON `Trip`(`startTime`);

-- CreateIndex
CREATE UNIQUE INDEX `Trip_endTime_key` ON `Trip`(`endTime`);

-- CreateIndex
CREATE UNIQUE INDEX `Trip_id_startTime_key` ON `Trip`(`id`, `startTime`);
