/*
  Warnings:

  - Added the required column `nodeId` to the `WorkflowParameter` table without a default value. This is not possible if the table is not empty.
  - Added the required column `paramKey` to the `WorkflowParameter` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE `WorkflowParameter` ADD COLUMN `nodeId` VARCHAR(191) NOT NULL,
    ADD COLUMN `paramKey` VARCHAR(191) NOT NULL;

-- CreateTable
CREATE TABLE `WorkflowParamGroup` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,
    `name` VARCHAR(191) NOT NULL,
    `workflowId` INTEGER NOT NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `WorkflowParamGroupItem` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,
    `nodeId` VARCHAR(191) NOT NULL,
    `paramKey` VARCHAR(191) NOT NULL,
    `currentValue` VARCHAR(191) NOT NULL,
    `paramGroupId` INTEGER NOT NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `WorkflowParamCombination` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,
    `paramValues` JSON NOT NULL,
    `paramGroupId` INTEGER NOT NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- AddForeignKey
ALTER TABLE `WorkflowParamGroup` ADD CONSTRAINT `WorkflowParamGroup_workflowId_fkey` FOREIGN KEY (`workflowId`) REFERENCES `Workflow`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `WorkflowParamGroupItem` ADD CONSTRAINT `WorkflowParamGroupItem_paramGroupId_fkey` FOREIGN KEY (`paramGroupId`) REFERENCES `WorkflowParamGroup`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `WorkflowParamCombination` ADD CONSTRAINT `WorkflowParamCombination_paramGroupId_fkey` FOREIGN KEY (`paramGroupId`) REFERENCES `WorkflowParamGroup`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;
