-- AlterTable
ALTER TABLE `Task` MODIFY `status` ENUM('INIT', 'PENDING', 'RUNNING', 'COMPLETED', 'FAILED', 'CANCELLED') NOT NULL DEFAULT 'PENDING';

-- AlterTable
ALTER TABLE `TaskItem` MODIFY `status` ENUM('INIT', 'PENDING', 'RUNNING', 'COMPLETED', 'FAILED', 'CANCELLED') NOT NULL DEFAULT 'PENDING';
