/*
  Warnings:

  - Added the required column `batchSize` to the `BatchTask` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE `BatchTask` ADD COLUMN `batchSize` INTEGER NOT NULL;
