-- AlterTable
ALTER TABLE `analytics_breakdown` ADD COLUMN `hits` INTEGER NOT NULL DEFAULT 0;

-- AlterTable
ALTER TABLE `pages` ADD COLUMN `heading` VARCHAR(255) NOT NULL DEFAULT '';

-- CreateTable
CREATE TABLE `contact_messages` (
    `id` VARCHAR(40) NOT NULL,
    `name` VARCHAR(191) NOT NULL,
    `email` VARCHAR(191) NOT NULL,
    `subject` VARCHAR(255) NOT NULL DEFAULT '',
    `message` TEXT NOT NULL,
    `status` ENUM('new', 'read', 'archived') NOT NULL DEFAULT 'new',
    `ip_hash` VARCHAR(64) NOT NULL DEFAULT '',
    `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    INDEX `contact_messages_status_created_at_idx`(`status`, `created_at`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `analytics_visits` (
    `date` DATE NOT NULL,
    `visitor_key` VARCHAR(64) NOT NULL,
    `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    PRIMARY KEY (`date`, `visitor_key`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
